import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Result "mo:base/Result";
import Error "mo:base/Error";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";
import Buffer "mo:base/Buffer";

actor Marketplace {
    // Types
    type UserId = Principal;
    
    type MaterialListing = {
        id: Nat;
        owner: UserId;
        materialType: Text;
        quantity: Nat;
        location: Text;
        price: Nat;
        ipfsHash: ?Text;
        status: ListingStatus;
        createdAt: Int;
    };

    type ListingStatus = {
        #active;
        #sold;
        #cancelled;
    };

    type Bid = {
        id: Nat;
        listingId: Nat;
        bidder: UserId;
        amount: Nat;
        status: BidStatus;
        timestamp: Int;
    };

    type BidStatus = {
        #active;
        #accepted;
        #rejected;
    };

    type Profile = {
        id: Principal;
        greenScore: Nat;
        listings: [Nat];
        bids: [Nat];
        votedProposals: [Nat];
        lastActivity: Int;
    };

    // State
    private stable var nextListingId: Nat = 0;
    private stable var nextBidId: Nat = 0;

    private let listings = HashMap.HashMap<Nat, MaterialListing>(0, Nat.equal, Hash.hash);
    private let bids = HashMap.HashMap<Nat, Bid>(0, Nat.equal, Hash.hash);

    // Constants for rewards
    private let TRANSACTION_REWARD = 50; // Both buyer and seller get 50 CYC per transaction

    // Canister references
    private let gtkToken = actor "bw4dl-smaaa-aaaaa-qaacq-cai" : actor {
        transfer: shared (Principal, Nat) -> async Result.Result<(), Text>;
        balanceOf: shared query (Principal) -> async Nat;
    };

    private let userProfile = actor "by6od-j4aaa-aaaaa-qaadq-cai" : actor {
        hasProfile: shared query (Principal) -> async Bool;
        createProfile: shared () -> async Result.Result<Profile, Text>;
        getProfile: shared query (Principal) -> async ?Profile;
        transferBalance: shared (Principal, Nat) -> async Result.Result<(), Text>;
        addBalance: shared (Nat) -> async Result.Result<Nat, Text>;
    };

    // Listing Management
    public shared(msg) func createListing(
        materialType: Text,
        quantity: Nat,
        location: Text,
        price: Nat,
        ipfsHash: ?Text
    ) : async Result.Result<MaterialListing, Text> {
        if (Principal.isAnonymous(msg.caller)) {
            return #err("Anonymous principals cannot create listings");
        };

        let profile = await userProfile.getProfile(msg.caller);
        switch (profile) {
            case null { return #err("User profile not found") };
            case (?profile) {
                if (profile.listings.size() >= 10) {
                    return #err("User has reached the maximum number of listings");
                };
            };
        };

        let listing = {
            id = nextListingId;
            owner = msg.caller;
            materialType = materialType;
            quantity = quantity;
            location = location;
            price = price;
            ipfsHash = ipfsHash;
            status = #active;
            createdAt = Time.now();
        };
        
        listings.put(nextListingId, listing);
        nextListingId += 1;
        #ok(listing)
    };

    // Bidding System
    public shared(msg) func placeBid(listingId: Nat, amount: Nat) : async Result.Result<Bid, Text> {
        if (Principal.isAnonymous(msg.caller)) {
            return #err("Anonymous principals cannot place bids");
        };

        let profile = await userProfile.getProfile(msg.caller);
        switch (profile) {
            case null { return #err("User profile not found") };
            case (?profile) {
                if (profile.bids.size() >= 10) {
                    return #err("User has reached the maximum number of bids");
                };
            };
        };

        switch (listings.get(listingId)) {
            case null #err("Listing not found");
            case (?listing) {
                if (listing.status != #active) {
                    return #err("Listing is not active");
                };

                // Check if bidder has enough GTK tokens
                let balance = await gtkToken.balanceOf(msg.caller);
                if (balance < amount) {
                    return #err("Insufficient GTK balance");
                };
                
                let bid = {
                    id = nextBidId;
                    listingId = listingId;
                    bidder = msg.caller;
                    amount = amount;
                    status = #active;
                    timestamp = Time.now();
                };
                
                bids.put(nextBidId, bid);
                nextBidId += 1;
                #ok(bid)
            };
        }
    };

    public shared(msg) func acceptBid(listingId: Nat, bidId: Nat) : async Result.Result<(), Text> {
        switch (listings.get(listingId), bids.get(bidId)) {
            case (?listing, ?bid) {
                if (listing.owner != msg.caller) {
                    return #err("Only the listing owner can accept bids");
                };

                if (bid.status != #active) {
                    return #err("Bid is not active");
                };

                if (bid.listingId != listingId) {
                    return #err("Bid is for a different listing");
                };

                // Transfer CYC tokens from bidder to seller
                let transferResult = await userProfile.transferBalance(listing.owner, bid.amount);
                switch (transferResult) {
                    case (#err(e)) { return #err(e) };
                    case (#ok()) {
                        // Award transaction rewards
                        ignore await userProfile.addBalance(TRANSACTION_REWARD); // Reward seller
                        ignore await userProfile.addBalance(TRANSACTION_REWARD); // Reward buyer

                        // Update listing status
                        let updatedListing = {
                            id = listing.id;
                            owner = listing.owner;
                            materialType = listing.materialType;
                            quantity = listing.quantity;
                            location = listing.location;
                            price = listing.price;
                            ipfsHash = listing.ipfsHash;
                            status = #sold;
                            createdAt = listing.createdAt;
                        };
                        listings.put(listingId, updatedListing);

                        // Update bid status
                        let updatedBid = {
                            id = bid.id;
                            listingId = bid.listingId;
                            bidder = bid.bidder;
                            amount = bid.amount;
                            status = #accepted;
                            timestamp = bid.timestamp;
                        };
                        bids.put(bidId, updatedBid);

                        #ok()
                    };
                }
            };
            case (null, _) { #err("Listing not found") };
            case (_, null) { #err("Bid not found") };
        }
    };

    // Query Methods
    public query func getListing(id: Nat) : async ?MaterialListing {
        listings.get(id)
    };

    public query func getAllListings() : async [MaterialListing] {
        let listingsArray = Buffer.Buffer<MaterialListing>(0);
        for ((_, listing) in listings.entries()) {
            if (listing.status == #active) {  // Only return active listings
                listingsArray.add(listing);
            }
        };
        Buffer.toArray(listingsArray)
    };

    public query func getBid(id: Nat) : async ?Bid {
        bids.get(id)
    };

    public query func getListingBids(listingId: Nat) : async [Bid] {
        var listingBids = Buffer.Buffer<Bid>(0);
        for ((_, bid) in bids.entries()) {
            if (bid.listingId == listingId) {
                listingBids.add(bid);
            };
        };
        Buffer.toArray(listingBids)
    };
};
