import React, { useState, useEffect } from 'react';
import { useBackendActor } from '../hooks/useBackendActor';
import { useAuth } from '../contexts/AuthContext';
import { Principal } from '@dfinity/principal';
import { MaterialListing } from '../../../declarations/chaincycle_backend/chaincycle_backend.did';

const Marketplace: React.FC = () => {
  const [listings, setListings] = useState<MaterialListing[]>([]);
  const [bidAmounts, setBidAmounts] = useState<Record<string, string>>({});
  const { identity } = useAuth();
  const { actor } = useBackendActor();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // New state for create listing form
  const [newListing, setNewListing] = useState({
    materialType: '',
    quantity: '',
    location: '',
    price: '',
    bidEndTime: '',
  });

  useEffect(() => {
    if (identity && actor) {
      fetchListings();
    }
  }, [identity, actor]);

  const fetchListings = async () => {
    if (!identity || !actor) {
      console.log("No identity or actor available");
      return;
    }
    setLoading(true);
    try {
      console.log("Fetching listings...");
      const result = await actor.getAllListings();
      console.log("Listings result:", result);
      
      // Ensure we have an array of listings
      const listingsArray = Array.isArray(result) ? result : 
                          'ok' in result && Array.isArray(result.ok) ? result.ok : [];
      
      // Sort listings by creation time (newest first)
      const sortedListings = [...listingsArray].sort((a, b) => {
        return Number(b.createdAt - a.createdAt);
      });
      
      console.log("Sorted listings:", sortedListings);
      setListings(sortedListings);
      setError(null);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError(err instanceof Error ? err.message : 'Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) {
      setError("Not connected to backend");
      return;
    }

    try {
      console.log("Creating new listing:", newListing);
      const bidEndTimeMs = new Date(newListing.bidEndTime).getTime();
      const result = await actor.createListing(
        newListing.materialType,
        BigInt(newListing.quantity),
        newListing.location,
        BigInt(newListing.price),
        [], // ipfsHash optional
        BigInt(bidEndTimeMs * 1_000_000) // Convert to nanoseconds
      );

      console.log("Create listing result:", result);

      if ('ok' in result) {
        await fetchListings();
        setNewListing({
          materialType: '',
          quantity: '',
          location: '',
          price: '',
          bidEndTime: '',
        });
        setError(null);
      } else {
        console.error("Error creating listing:", result.err);
        setError(result.err);
      }
    } catch (err) {
      console.error("Error in create listing:", err);
      setError(err instanceof Error ? err.message : 'Failed to create listing');
    }
  };

  const handleBid = async (listingId: bigint) => {
    if (!actor) {
      setError("Not connected to backend");
      return;
    }

    const bidAmount = bidAmounts[listingId.toString()];
    if (!bidAmount) {
      setError("Please enter a bid amount");
      return;
    }

    try {
      console.log("Placing bid:", { listingId: listingId.toString(), amount: bidAmount });
      const result = await actor.createBid(listingId, BigInt(bidAmount));
      console.log("Bid result:", result);

      if ('ok' in result) {
        await fetchListings();
        setBidAmounts(prev => ({ ...prev, [listingId.toString()]: '' }));
        setError(null);
      } else {
        console.error("Error creating bid:", result.err);
        setError(result.err);
      }
    } catch (err) {
      console.error("Error in place bid:", err);
      setError(err instanceof Error ? err.message : 'Failed to place bid');
    }
  };

  const getStatusColor = (status: { active: null } | { sold: null } | { cancelled: null }) => {
    if ('active' in status) return 'text-blue-600';
    if ('sold' in status) return 'text-green-600';
    return 'text-red-600';
  };

  const isListingExpired = (bidEndTime: bigint) => {
    return BigInt(Date.now() * 1_000_000) > bidEndTime;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Marketplace</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Create Listing Form */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Create New Listing</h2>
        <form onSubmit={handleCreateListing} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Material Type</label>
            <input
              type="text"
              value={newListing.materialType}
              onChange={(e) => setNewListing({ ...newListing, materialType: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              value={newListing.quantity}
              onChange={(e) => setNewListing({ ...newListing, quantity: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              value={newListing.location}
              onChange={(e) => setNewListing({ ...newListing, location: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              value={newListing.price}
              onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bid End Time</label>
            <input
              type="datetime-local"
              value={newListing.bidEndTime}
              onChange={(e) => setNewListing({ ...newListing, bidEndTime: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
              required
            />
          </div>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Listing
          </button>
        </form>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-lg text-gray-600">Loading...</span>
        </div>
      ) : (
        <div className="grid gap-4">
          {listings.map(listing => (
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
                {listing.highestBid && Array.isArray(listing.highestBid) && listing.highestBid.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800">Current Highest Bid</h4>
                    <p className="text-blue-700">{listing.highestBid[0]?.amount.toString() ?? 'N/A'}</p>
                  </div>
                )}
              </div>
              {'active' in listing.status && !isListingExpired(listing.bidEndTime) && (
                <div className="mt-4">
                  <input
                    type="number"
                    value={bidAmounts[listing.id.toString()] || ''}
                    onChange={(e) => setBidAmounts(prev => ({ ...prev, [listing.id.toString()]: e.target.value }))}
                    placeholder="Enter bid amount"
                    className="mr-2 px-3 py-2 border rounded"
                  />
                  <button
                    onClick={() => handleBid(listing.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    disabled={!bidAmounts[listing.id.toString()]}
                  >
                    Place Bid
                  </button>
                </div>
              )}
            </div>
          ))}
          {listings.length === 0 && (
            <p className="text-gray-500 text-center py-8">No listings available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
