export const idlFactory = ({ IDL }) => {
  const Result_2 = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const ListingStatus = IDL.Variant({
    'active' : IDL.Null,
    'cancelled' : IDL.Null,
    'sold' : IDL.Null,
  });
  const UserId = IDL.Principal;
  const MaterialListing = IDL.Record({
    'id' : IDL.Nat,
    'status' : ListingStatus,
    'owner' : UserId,
    'createdAt' : IDL.Int,
    'quantity' : IDL.Nat,
    'price' : IDL.Nat,
    'ipfsHash' : IDL.Opt(IDL.Text),
    'materialType' : IDL.Text,
    'location' : IDL.Text,
  });
  const Result_1 = IDL.Variant({ 'ok' : MaterialListing, 'err' : IDL.Text });
  const BidStatus = IDL.Variant({
    'active' : IDL.Null,
    'rejected' : IDL.Null,
    'accepted' : IDL.Null,
  });
  const Bid = IDL.Record({
    'id' : IDL.Nat,
    'status' : BidStatus,
    'listingId' : IDL.Nat,
    'timestamp' : IDL.Int,
    'amount' : IDL.Nat,
    'bidder' : UserId,
  });
  const Result = IDL.Variant({ 'ok' : Bid, 'err' : IDL.Text });
  return IDL.Service({
    'acceptBid' : IDL.Func([IDL.Nat, IDL.Nat], [Result_2], []),
    'createListing' : IDL.Func(
        [IDL.Text, IDL.Nat, IDL.Text, IDL.Nat, IDL.Opt(IDL.Text)],
        [Result_1],
        [],
      ),
    'getAllListings' : IDL.Func([], [IDL.Vec(MaterialListing)], ['query']),
    'getBid' : IDL.Func([IDL.Nat], [IDL.Opt(Bid)], ['query']),
    'getListing' : IDL.Func([IDL.Nat], [IDL.Opt(MaterialListing)], ['query']),
    'getListingBids' : IDL.Func([IDL.Nat], [IDL.Vec(Bid)], ['query']),
    'placeBid' : IDL.Func([IDL.Nat, IDL.Nat], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
