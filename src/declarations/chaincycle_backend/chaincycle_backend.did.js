export const idlFactory = ({ IDL }) => {
  const UserId = IDL.Principal;
  const Proposal = IDL.Record({
    'id' : IDL.Nat,
    'status' : IDL.Variant({
      'active' : IDL.Null,
      'rejected' : IDL.Null,
      'passed' : IDL.Null,
    }),
    'noVotes' : IDL.Nat,
    'title' : IDL.Text,
    'creator' : UserId,
    'yesVotes' : IDL.Nat,
    'description' : IDL.Text,
    'voteEndTime' : IDL.Int,
  });
  const Result = IDL.Variant({ 'ok' : Proposal, 'err' : IDL.Text });
  const Result_5 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  const Time = IDL.Int;
  const Bid = IDL.Record({
    'id' : IDL.Nat,
    'status' : IDL.Variant({
      'active' : IDL.Null,
      'rejected' : IDL.Null,
      'accepted' : IDL.Null,
    }),
    'listingId' : IDL.Nat,
    'timestamp' : Time,
    'amount' : IDL.Nat,
    'bidder' : UserId,
  });
  const MaterialListing = IDL.Record({
    'id' : IDL.Nat,
    'status' : IDL.Variant({
      'active' : IDL.Null,
      'cancelled' : IDL.Null,
      'sold' : IDL.Null,
    }),
    'owner' : UserId,
    'createdAt' : Time,
    'highestBid' : IDL.Opt(Bid),
    'bidEndTime' : Time,
    'quantity' : IDL.Nat,
    'price' : IDL.Nat,
    'ipfsHash' : IDL.Opt(IDL.Text),
    'materialType' : IDL.Text,
    'location' : IDL.Text,
  });
  const Result_3 = IDL.Variant({ 'ok' : MaterialListing, 'err' : IDL.Text });
  const Result_1 = IDL.Variant({
    'ok' : IDL.Vec(MaterialListing),
    'err' : IDL.Text,
  });
  const Result_4 = IDL.Variant({ 'ok' : IDL.Vec(Proposal), 'err' : IDL.Text });
  const Result_2 = IDL.Variant({ 'ok' : IDL.Vec(Bid), 'err' : IDL.Text });
  return IDL.Service({
    'castVote' : IDL.Func([IDL.Nat, IDL.Bool], [Result], []),
    'createBid' : IDL.Func([IDL.Nat, IDL.Nat], [Result_5], []),
    'createListing' : IDL.Func(
        [IDL.Text, IDL.Nat, IDL.Text, IDL.Nat, IDL.Opt(IDL.Text), IDL.Nat],
        [Result_5],
        [],
      ),
    'createProposal' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
    'finalizeBid' : IDL.Func([IDL.Nat], [Result_3], []),
    'getAllListings' : IDL.Func([], [Result_1], []),
    'getAllProposals' : IDL.Func([], [Result_4], []),
    'getListing' : IDL.Func([IDL.Nat], [Result_3], []),
    'getMyBids' : IDL.Func([], [Result_2], []),
    'getMyListings' : IDL.Func([], [Result_1], []),
    'getProposal' : IDL.Func([IDL.Nat], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
