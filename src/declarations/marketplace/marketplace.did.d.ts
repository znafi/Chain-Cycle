import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Bid {
  'id' : bigint,
  'status' : BidStatus,
  'listingId' : bigint,
  'timestamp' : bigint,
  'amount' : bigint,
  'bidder' : UserId,
}
export type BidStatus = { 'active' : null } |
  { 'rejected' : null } |
  { 'accepted' : null };
export type ListingStatus = { 'active' : null } |
  { 'cancelled' : null } |
  { 'sold' : null };
export interface MaterialListing {
  'id' : bigint,
  'status' : ListingStatus,
  'owner' : UserId,
  'createdAt' : bigint,
  'quantity' : bigint,
  'price' : bigint,
  'ipfsHash' : [] | [string],
  'materialType' : string,
  'location' : string,
}
export type Result = { 'ok' : Bid } |
  { 'err' : string };
export type Result_1 = { 'ok' : MaterialListing } |
  { 'err' : string };
export type Result_2 = { 'ok' : null } |
  { 'err' : string };
export type UserId = Principal;
export interface _SERVICE {
  'acceptBid' : ActorMethod<[bigint, bigint], Result_2>,
  'createListing' : ActorMethod<
    [string, bigint, string, bigint, [] | [string]],
    Result_1
  >,
  'getAllListings' : ActorMethod<[], Array<MaterialListing>>,
  'getBid' : ActorMethod<[bigint], [] | [Bid]>,
  'getListing' : ActorMethod<[bigint], [] | [MaterialListing]>,
  'getListingBids' : ActorMethod<[bigint], Array<Bid>>,
  'placeBid' : ActorMethod<[bigint, bigint], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
