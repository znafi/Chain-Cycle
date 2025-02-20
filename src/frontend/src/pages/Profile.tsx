import React, { useState, useEffect } from 'react';

const Profile = () => {
  const [profile, setProfile] = useState({
    greenScore: 0,
    tokenBalance: 0,
    listings: [],
    bids: []
  });

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Green Score</h2>
          <span className="text-2xl text-green-600">{profile.greenScore}</span>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Token Balance</h2>
          <span className="text-2xl text-blue-600">{profile.tokenBalance} CYC</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">My Activity</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">My Listings</h3>
            {profile.listings.length === 0 ? (
              <p className="text-gray-500">No active listings</p>
            ) : (
              <div className="space-y-2">
                {/* Listing items would go here */}
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">My Bids</h3>
            {profile.bids.length === 0 ? (
              <p className="text-gray-500">No active bids</p>
            ) : (
              <div className="space-y-2">
                {/* Bid items would go here */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
