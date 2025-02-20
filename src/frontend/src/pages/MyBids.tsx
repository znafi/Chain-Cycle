import React, { useState, useEffect } from 'react';
import { useBackendActor } from '../hooks/useBackendActor';
import { useAuth } from '../contexts/AuthContext';
import { Principal } from '@dfinity/principal';
import { Bid, MaterialListing } from '../../../declarations/chaincycle_backend/chaincycle_backend.did';

interface BidWithListing extends Bid {
  listing?: MaterialListing;
}

const MyBids: React.FC = () => {
  const [myBids, setMyBids] = useState<BidWithListing[]>([]);
  const { identity } = useAuth();
  const { actor } = useBackendActor();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (identity && actor) {
      fetchMyBids();
    }
  }, [identity, actor]);

  const fetchMyBids = async () => {
    if (!identity || !actor) {
      console.log("No identity or actor available");
      return;
    }
    setLoading(true);
    try {
      console.log("Fetching my bids...");
      const result = await actor.getMyBids();
      console.log("My bids result:", result);
      
      if ('ok' in result) {
        // Sort bids by timestamp (newest first)
        const sortedBids = [...result.ok].sort((a, b) => {
          return Number(b.timestamp - a.timestamp);
        });

        // Fetch listing details for each bid
        const bidsWithListings = await Promise.all(
          sortedBids.map(async (bid) => {
            try {
              const listingResult = await actor.getListing(bid.listingId);
              if ('ok' in listingResult) {
                return { ...bid, listing: listingResult.ok };
              }
              return bid;
            } catch (err) {
              console.error("Error fetching listing for bid:", err);
              return bid;
            }
          })
        );

        console.log("Bids with listings:", bidsWithListings);
        setMyBids(bidsWithListings);
        setError(null);
      } else {
        console.error("Error in my bids result:", result.err);
        setError(result.err);
      }
    } catch (err) {
      console.error("Error fetching my bids:", err);
      setError(err instanceof Error ? err.message : 'Failed to fetch bids');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Bid['status']) => {
    if ('active' in status) return 'text-blue-600';
    if ('accepted' in status) return 'text-green-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Bids</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-lg text-gray-600">Loading...</span>
        </div>
      ) : (
        <div className="grid gap-4">
          {myBids.map(bid => (
            <div key={bid.id.toString()} className="border p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {bid.listing ? bid.listing.materialType : `Bid on Listing #${bid.listingId.toString()}`}
                      </h3>
                      <div className="mt-2 space-y-2">
                        <p><span className="font-medium">Your Bid Amount:</span> {bid.amount.toString()}</p>
                        {bid.listing && (
                          <>
                            <p><span className="font-medium">Listing Price:</span> {bid.listing.price.toString()}</p>
                            <p><span className="font-medium">Location:</span> {bid.listing.location}</p>
                            <p><span className="font-medium">Quantity:</span> {bid.listing.quantity.toString()}</p>
                          </>
                        )}
                        <p>
                          <span className="font-medium">Bid Status: </span>
                          <span className={getStatusColor(bid.status)}>
                            {Object.keys(bid.status)[0]}
                          </span>
                        </p>
                        <p><span className="font-medium">Bid Time:</span> {new Date(Number(bid.timestamp) / 1_000_000).toLocaleString()}</p>
                      </div>
                    </div>
                    {bid.listing?.highestBid && bid.listing.highestBid.length > 0 && (
                      <div className="bg-blue-50 p-4 rounded-lg ml-4">
                        <h4 className="font-medium text-blue-800 mb-2">Current Highest Bid</h4>
                        <p className="text-blue-700">Amount: {bid.listing.highestBid[0]?.amount.toString()}</p>
                        {identity && bid.listing.highestBid[0]?.bidder.toString() === identity.getPrincipal().toString() && (
                          <p className="text-green-600 font-medium mt-1">You are the highest bidder!</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {myBids.length === 0 && (
            <p className="text-gray-500 text-center py-8">You haven't placed any bids yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MyBids;
