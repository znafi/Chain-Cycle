import React, { useState, useEffect } from 'react';
import { useBackendActor } from '../hooks/useBackendActor';
import { useAuth } from '../contexts/AuthContext';
import { Principal } from '@dfinity/principal';
import { MaterialListing } from '../../../declarations/chaincycle_backend/chaincycle_backend.did';

type ListingStatus = { active: null } | { sold: null } | { cancelled: null };

const MyItems: React.FC = () => {
  const [myListings, setMyListings] = useState<MaterialListing[]>([]);
  const { identity } = useAuth();
  const { actor } = useBackendActor();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (identity && actor) {
      fetchMyListings();
    }
  }, [identity, actor]);

  const fetchMyListings = async () => {
    if (!identity || !actor) {
      console.log("No identity or actor available");
      return;
    }
    setLoading(true);
    try {
      console.log("Fetching my listings...");
      const result = await actor.getMyListings();
      console.log("My listings result:", result);
      
      if ('ok' in result) {
        const sortedListings = result.ok.sort((a, b) => {
          // Sort by creation time (newest first)
          return Number(b.createdAt - a.createdAt);
        });
        console.log("Sorted my listings:", sortedListings);
        setMyListings(sortedListings);
        setError(null);
      } else {
        console.error("Error in my listings result:", result.err);
        setError(result.err);
      }
    } catch (err) {
      console.error("Error fetching my listings:", err);
      setError(err instanceof Error ? err.message : 'Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeBid = async (listingId: bigint) => {
    if (!actor) {
      setError("Not connected to backend");
      return;
    }
    try {
      console.log("Finalizing bid for listing:", listingId.toString());
      const result = await actor.finalizeBid(listingId);
      console.log("Finalize bid result:", result);
      
      if ('ok' in result) {
        await fetchMyListings();
        setError(null);
      } else {
        console.error("Error finalizing bid:", result.err);
        setError(result.err);
      }
    } catch (err) {
      console.error("Error in finalize bid:", err);
      setError(err instanceof Error ? err.message : 'Failed to finalize bid');
    }
  };

  const getStatusColor = (status: ListingStatus) => {
    if ('active' in status) return 'text-blue-600';
    if ('sold' in status) return 'text-green-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Items</h1>
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
          {myListings.map(listing => (
            <div key={listing.id.toString()} className="border p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{listing.materialType}</h3>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Quantity:</span> {listing.quantity.toString()}</p>
                    <p><span className="font-medium">Location:</span> {listing.location}</p>
                    <p><span className="font-medium">Price:</span> {listing.price.toString()}</p>
                    <p>
                      <span className="font-medium">Status: </span>
                      <span className={getStatusColor(listing.status)}>
                        {Object.keys(listing.status)[0]}
                      </span>
                    </p>
                    <p><span className="font-medium">Created:</span> {new Date(Number(listing.createdAt) / 1_000_000).toLocaleString()}</p>
                    <p><span className="font-medium">Bid End Time:</span> {new Date(Number(listing.bidEndTime) / 1_000_000).toLocaleString()}</p>
                  </div>
                </div>
                {listing.highestBid.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Highest Bid</h4>
                    <p className="text-blue-700">Amount: {listing.highestBid[0]?.amount.toString() ?? 'N/A'}</p>
                    <p className="text-blue-700">Bidder: {listing.highestBid[0]?.bidder.toString() ?? 'N/A'}</p>
                    {BigInt(Date.now() * 1_000_000) > listing.bidEndTime && 'active' in listing.status && (
                      <button
                        onClick={() => handleFinalizeBid(listing.id)}
                        className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      >
                        Finalize Bid
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {myListings.length === 0 && (
            <p className="text-gray-500 text-center py-8">You don't have any listings yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MyItems;
