import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Result "mo:base/Result";
import Error "mo:base/Error";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";

actor UserProfile {
    type UserId = Principal;

    type Profile = {
        id: Principal;
        greenScore: Nat;
        listings: [Nat];
        bids: [Nat];
        votedProposals: [Nat];
        lastActivity: Int;
        balance: Nat;
    };

    type ProfileUpdate = {
        greenScore: ?Nat;
        listings: ?[Nat];
        bids: ?[Nat];
        votedProposals: ?[Nat];
        balance: ?Nat;
    };

    // State
    private let profiles = HashMap.HashMap<UserId, Profile>(0, Principal.equal, Principal.hash);
    private let votedProposals = HashMap.HashMap<Nat, [Principal]>(0, Nat.equal, Hash.hash);

    // Create or update profile
    public shared(msg) func createProfile() : async Result.Result<Profile, Text> {
        let caller = msg.caller;
        
        if (Principal.isAnonymous(caller)) {
            return #err("Anonymous principals cannot create profiles");
        };

        let newProfile = {
            id = caller;
            greenScore = 0;
            listings = [];
            bids = [];
            votedProposals = [];
            lastActivity = Time.now();
            balance = 1000;  // Initial balance of 1000 CYC
        };

        profiles.put(caller, newProfile);
        #ok(newProfile)
    };

    // Get balance
    public query func getBalance(userId: Principal) : async Nat {
        switch (profiles.get(userId)) {
            case (?profile) { profile.balance };
            case null { 0 };
        }
    };

    // Add balance (for top-up)
    public shared(msg) func addBalance(amount: Nat) : async Result.Result<Nat, Text> {
        if (Principal.isAnonymous(msg.caller)) {
            return #err("Anonymous principals cannot add balance");
        };

        switch (profiles.get(msg.caller)) {
            case (?profile) {
                let updatedProfile = {
                    id = profile.id;
                    greenScore = profile.greenScore;
                    listings = profile.listings;
                    bids = profile.bids;
                    votedProposals = profile.votedProposals;
                    lastActivity = Time.now();
                    balance = profile.balance + amount;
                };
                profiles.put(msg.caller, updatedProfile);
                #ok(updatedProfile.balance)
            };
            case null {
                #err("Profile not found")
            };
        }
    };

    // Subtract balance (for cash out or payments)
    public shared(msg) func subtractBalance(amount: Nat) : async Result.Result<Nat, Text> {
        if (Principal.isAnonymous(msg.caller)) {
            return #err("Anonymous principals cannot subtract balance");
        };

        switch (profiles.get(msg.caller)) {
            case (?profile) {
                if (profile.balance < amount) {
                    return #err("Insufficient balance");
                };
                let updatedProfile = {
                    id = profile.id;
                    greenScore = profile.greenScore;
                    listings = profile.listings;
                    bids = profile.bids;
                    votedProposals = profile.votedProposals;
                    lastActivity = Time.now();
                    balance = profile.balance - amount;
                };
                profiles.put(msg.caller, updatedProfile);
                #ok(updatedProfile.balance)
            };
            case null {
                #err("Profile not found")
            };
        }
    };

    // Transfer balance (for transactions)
    public shared(msg) func transferBalance(to: Principal, amount: Nat) : async Result.Result<(), Text> {
        if (Principal.isAnonymous(msg.caller)) {
            return #err("Anonymous principals cannot transfer balance");
        };

        switch (profiles.get(msg.caller), profiles.get(to)) {
            case (?fromProfile, ?toProfile) {
                if (fromProfile.balance < amount) {
                    return #err("Insufficient balance");
                };

                let updatedFromProfile = {
                    id = fromProfile.id;
                    greenScore = fromProfile.greenScore;
                    listings = fromProfile.listings;
                    bids = fromProfile.bids;
                    votedProposals = fromProfile.votedProposals;
                    lastActivity = Time.now();
                    balance = fromProfile.balance - amount;
                };

                let updatedToProfile = {
                    id = toProfile.id;
                    greenScore = toProfile.greenScore;
                    listings = toProfile.listings;
                    bids = toProfile.bids;
                    votedProposals = toProfile.votedProposals;
                    lastActivity = Time.now();
                    balance = toProfile.balance + amount;
                };

                profiles.put(msg.caller, updatedFromProfile);
                profiles.put(to, updatedToProfile);
                #ok()
            };
            case (null, _) {
                #err("Sender profile not found")
            };
            case (_, null) {
                #err("Recipient profile not found")
            };
        }
    };

    // Update profile
    public shared(msg) func updateProfile(update: ProfileUpdate) : async Result.Result<Profile, Text> {
        let caller = msg.caller;
        
        if (Principal.isAnonymous(caller)) {
            return #err("Anonymous principals cannot update profiles");
        };

        switch (profiles.get(caller)) {
            case (?existing) {
                let updatedProfile = {
                    id = caller;
                    greenScore = switch (update.greenScore) {
                        case (?score) { score };
                        case null { existing.greenScore };
                    };
                    listings = switch (update.listings) {
                        case (?l) { l };
                        case null { existing.listings };
                    };
                    bids = switch (update.bids) {
                        case (?b) { b };
                        case null { existing.bids };
                    };
                    votedProposals = switch (update.votedProposals) {
                        case (?v) { v };
                        case null { existing.votedProposals };
                    };
                    balance = switch (update.balance) {
                        case (?b) { b };
                        case null { existing.balance };
                    };
                    lastActivity = Time.now();
                };
                profiles.put(caller, updatedProfile);
                #ok(updatedProfile)
            };
            case null {
                #err("Profile not found")
            };
        }
    };

    // Check if user has a profile
    public query func hasProfile(userId: Principal) : async Bool {
        switch (profiles.get(userId)) {
            case (?_) { true };
            case null { false };
        }
    };

    // Check if user has voted on a proposal
    public query func hasVoted(userId: Principal, proposalId: Nat) : async Bool {
        switch (profiles.get(userId)) {
            case (?profile) {
                for (votedId in profile.votedProposals.vals()) {
                    if (votedId == proposalId) return true;
                };
                false
            };
            case null { false };
        }
    };

    // Record a vote
    public shared(msg) func recordVote(proposalId: Nat) : async Result.Result<(), Text> {
        let caller = msg.caller;
        
        switch (profiles.get(caller)) {
            case (?profile) {
                // Check if user has already voted
                for (votedId in profile.votedProposals.vals()) {
                    if (votedId == proposalId) {
                        return #err("User has already voted on this proposal");
                    };
                };

                // Add proposal to user's voted proposals
                let updatedVotedProposals = Array.append(profile.votedProposals, [proposalId]);
                
                let updatedProfile = {
                    id = profile.id;
                    greenScore = profile.greenScore;
                    listings = profile.listings;
                    bids = profile.bids;
                    votedProposals = updatedVotedProposals;
                    lastActivity = Time.now();
                    balance = profile.balance;
                };

                profiles.put(caller, updatedProfile);
                #ok()
            };
            case null {
                #err("Profile not found");
            };
        }
    };

    // Update green score
    public shared(msg) func updateGreenScore(userId: Principal, points: Nat) : async Result.Result<(), Text> {
        switch (profiles.get(userId)) {
            case (?profile) {
                let updatedProfile = {
                    id = profile.id;
                    greenScore = profile.greenScore + points;
                    listings = profile.listings;
                    bids = profile.bids;
                    votedProposals = profile.votedProposals;
                    lastActivity = Time.now();
                    balance = profile.balance;
                };
                profiles.put(userId, updatedProfile);
                #ok()
            };
            case null {
                #err("Profile not found");
            };
        }
    };

    // Query Methods
    public query func getProfile(userId: Principal) : async ?Profile {
        profiles.get(userId)
    };

    public query func getAllProfiles() : async [Profile] {
        Iter.toArray(profiles.vals())
    };
}
