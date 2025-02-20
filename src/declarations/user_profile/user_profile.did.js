export const idlFactory = ({ IDL }) => {
  const Result_2 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  const Profile = IDL.Record({
    'id' : IDL.Principal,
    'votedProposals' : IDL.Vec(IDL.Nat),
    'balance' : IDL.Nat,
    'listings' : IDL.Vec(IDL.Nat),
    'bids' : IDL.Vec(IDL.Nat),
    'lastActivity' : IDL.Int,
    'greenScore' : IDL.Nat,
  });
  const Result = IDL.Variant({ 'ok' : Profile, 'err' : IDL.Text });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const ProfileUpdate = IDL.Record({
    'votedProposals' : IDL.Opt(IDL.Vec(IDL.Nat)),
    'balance' : IDL.Opt(IDL.Nat),
    'listings' : IDL.Opt(IDL.Vec(IDL.Nat)),
    'bids' : IDL.Opt(IDL.Vec(IDL.Nat)),
    'greenScore' : IDL.Opt(IDL.Nat),
  });
  return IDL.Service({
    'addBalance' : IDL.Func([IDL.Nat], [Result_2], []),
    'createProfile' : IDL.Func([], [Result], []),
    'getAllProfiles' : IDL.Func([], [IDL.Vec(Profile)], ['query']),
    'getBalance' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'getProfile' : IDL.Func([IDL.Principal], [IDL.Opt(Profile)], ['query']),
    'hasProfile' : IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
    'hasVoted' : IDL.Func([IDL.Principal, IDL.Nat], [IDL.Bool], ['query']),
    'recordVote' : IDL.Func([IDL.Nat], [Result_1], []),
    'subtractBalance' : IDL.Func([IDL.Nat], [Result_2], []),
    'transferBalance' : IDL.Func([IDL.Principal, IDL.Nat], [Result_1], []),
    'updateGreenScore' : IDL.Func([IDL.Principal, IDL.Nat], [Result_1], []),
    'updateProfile' : IDL.Func([ProfileUpdate], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
