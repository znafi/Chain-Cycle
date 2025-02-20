import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Bid {
  'id' : bigint,
  'status' : { 'active' : null } |
    { 'rejected' : null } |
    { 'accepted' : null },
  'listingId' : bigint,
  'timestamp' : Time,
  'amount' : bigint,
  'bidder' : UserId,
}
export interface MaterialListing {
  'id' : bigint,
  'status' : { 'active' : null } |
    { 'cancelled' : null } |
    { 'sold' : null },
  'owner' : UserId,
  'createdAt' : Time,
  'highestBid' : [] | [Bid],
  'bidEndTime' : Time,
  'quantity' : bigint,
  'price' : bigint,
  'ipfsHash' : [] | [string],
  'materialType' : string,
  'location' : string,
}
export interface Proposal {
  'id' : bigint,
  'status' : { 'active' : null } |
    { 'rejected' : null } |
    { 'passed' : null },
  'noVotes' : bigint,
  'title' : string,
  'creator' : UserId,
  'yesVotes' : bigint,
  'description' : string,
  'voteEndTime' : bigint,
}
export type Result = { 'ok' : Proposal } |
  { 'err' : string };
export type Result_1 = { 'ok' : Array<MaterialListing> } |
  { 'err' : string };
export type Result_2 = { 'ok' : Array<Bid> } |
  { 'err' : string };
export type Result_3 = { 'ok' : MaterialListing } |
  { 'err' : string };
export type Result_4 = { 'ok' : Array<Proposal> } |
  { 'err' : string };
export type Result_5 = { 'ok' : bigint } |
  { 'err' : string };
export type Time = bigint;
export type UserId = Principal;
export interface _SERVICE {
  'castVote' : ActorMethod<[bigint, boolean], Result>,
  'createBid' : ActorMethod<[bigint, bigint], Result_5>,
  'createListing' : ActorMethod<
    [string, bigint, string, bigint, [] | [string], bigint],
    Result_5
  >,
  'createProposal' : ActorMethod<[string, string], Result>,
  'finalizeBid' : ActorMethod<[bigint], Result_3>,
  'getAllListings' : ActorMethod<[], Result_1>,
  'getAllProposals' : ActorMethod<[], Result_4>,
  'getListing' : ActorMethod<[bigint], Result_3>,
  'getMyBids' : ActorMethod<[], Result_2>,
  'getMyListings' : ActorMethod<[], Result_1>,
  'getProposal' : ActorMethod<[bigint], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
