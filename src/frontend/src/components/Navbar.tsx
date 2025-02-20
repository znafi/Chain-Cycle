import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory as userProfileIdlFactory } from '../../../declarations/user_profile/user_profile.did.js';
import type { _SERVICE as UserProfileService } from '../../../declarations/user_profile/user_profile.did';
import BalanceModal from './BalanceModal';

const Navbar: React.FC = () => {
  const { isAuthenticated, identity, login, logout } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'topup' | 'cashout'>('topup');

  const fetchBalance = async () => {
    if (!identity) return;

    try {
      const host = import.meta.env.VITE_DFX_NETWORK === "ic" ? "https://ic0.app" : "http://127.0.0.1:4943";
      const agent = new HttpAgent({
        identity,
        host,
      });

      if (import.meta.env.VITE_DFX_NETWORK !== "ic") {
        await agent.fetchRootKey();
      }

      const userProfileActor = Actor.createActor<UserProfileService>(userProfileIdlFactory, {
        agent,
        canisterId: import.meta.env.VITE_USER_PROFILE_CANISTER_ID,
      });

      // First try to get the profile
      const profile = await userProfileActor.getProfile(identity.getPrincipal());
      console.log('Fetched profile:', profile);
      
      if (!profile || profile.length === 0) {
        console.log('No profile found, creating new profile...');
        // If no profile exists, create one
        const createResult = await userProfileActor.createProfile();
        console.log('Create profile result:', createResult);
        
        if ('ok' in createResult) {
          const newBalance = Number(createResult.ok.balance);
          console.log('Setting new balance:', newBalance);
          setBalance(newBalance);
        } else {
          console.error('Error creating profile:', createResult.err);
        }
      } else {
        // Profile exists, get the balance
        const currentBalance = Number(profile[0].balance);
        console.log('Setting existing balance:', currentBalance);
        setBalance(currentBalance);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBalance();
    }
  }, [isAuthenticated]);

  const handleTopUp = () => {
    setModalMode('topup');
    setModalOpen(true);
  };

  const handleCashOut = () => {
    setModalMode('cashout');
    setModalOpen(true);
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-white font-bold text-xl">
            ChainCycle
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/marketplace" className="text-gray-300 hover:text-white">
                Marketplace
              </Link>
              <Link to="/dao" className="text-gray-300 hover:text-white">
                DAO
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <div className="text-white">
                <span className="mr-2">Balance: {isNaN(balance) ? 0 : balance} CYC</span>
                <button
                  onClick={handleTopUp}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm mr-2"
                >
                  Top Up
                </button>
                <button
                  onClick={handleCashOut}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                >
                  Cash Out
                </button>
              </div>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={login}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Login
            </button>
          )}
        </div>
      </div>

      <BalanceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        onSuccess={fetchBalance}
      />
    </nav>
  );
};

export default Navbar;
