import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Profile {
  'id' : Principal,
  'votedProposals' : Array<bigint>,
  'balance' : bigint,
  'listings' : Array<bigint>,
  'bids' : Array<bigint>,
  'lastActivity' : bigint,
  'greenScore' : bigint,
}
export interface ProfileUpdate {
  'votedProposals' : [] | [Array<bigint>],
  'balance' : [] | [bigint],
  'listings' : [] | [Array<bigint>],
  'bids' : [] | [Array<bigint>],
  'greenScore' : [] | [bigint],
}
export type Result = { 'ok' : Profile } |
  { 'err' : string };
export type Result_1 = { 'ok' : null } |
  { 'err' : string };
export type Result_2 = { 'ok' : bigint } |
  { 'err' : string };
export interface _SERVICE {
  'addBalance' : ActorMethod<[bigint], Result_2>,
  'createProfile' : ActorMethod<[], Result>,
  'getAllProfiles' : ActorMethod<[], Array<Profile>>,
  'getBalance' : ActorMethod<[Principal], bigint>,
  'getProfile' : ActorMethod<[Principal], [] | [Profile]>,
  'hasProfile' : ActorMethod<[Principal], boolean>,
  'hasVoted' : ActorMethod<[Principal, bigint], boolean>,
  'recordVote' : ActorMethod<[bigint], Result_1>,
  'subtractBalance' : ActorMethod<[bigint], Result_2>,
  'transferBalance' : ActorMethod<[Principal, bigint], Result_1>,
  'updateGreenScore' : ActorMethod<[Principal, bigint], Result_1>,
  'updateProfile' : ActorMethod<[ProfileUpdate], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
