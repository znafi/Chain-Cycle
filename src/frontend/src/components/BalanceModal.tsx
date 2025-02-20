import React, { useState } from 'react';
import { Actor, HttpAgent } from '@dfinity/agent';
import { useAuth } from '../contexts/AuthContext';
import { idlFactory as userProfileIdlFactory } from '../../../declarations/user_profile/user_profile.did.js';
import type { _SERVICE as UserProfileService } from '../../../declarations/user_profile/user_profile.did';

interface BalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'topup' | 'cashout';
  onSuccess: () => void;
}

const BalanceModal: React.FC<BalanceModalProps> = ({ isOpen, onClose, mode, onSuccess }) => {
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { identity } = useAuth();

  const showNotification = (message: string, isError: boolean = false) => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-md ${
      isError ? 'bg-red-500' : 'bg-green-500'
    } text-white shadow-lg z-50 transition-opacity duration-500`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Fade out and remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccessMessage(null);
    console.log(`Initiating ${mode} operation for amount: ${amount} CYC`);

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

      if (mode === 'topup') {
        console.log('Creating/updating profile for top-up...');
        // Create profile first to ensure it exists
        await userProfileActor.createProfile();
        console.log('Profile created/updated successfully');

        // Use updateProfile for balance
        console.log('Updating balance...');
        const result = await userProfileActor.updateProfile({
          greenScore: [],
          listings: [],
          bids: [],
          votedProposals: [],
          balance: [BigInt(amount)]
        });

        console.log('Balance update result:', result);
        if ('ok' in result) {
          const successMsg = `Successfully topped up ${amount} CYC`;
          setSuccessMessage(successMsg);
          showNotification(successMsg);
          onSuccess();
          onClose();
        } else {
          const errorMsg = `Failed to top up: ${result.err}`;
          console.error(errorMsg);
          setError(errorMsg);
          showNotification(errorMsg, true);
        }
      } else {
        console.log('Fetching profile for cash-out...');
        const profile = await userProfileActor.getProfile(identity.getPrincipal());
        console.log('Profile:', profile);
        
        if (!profile || profile.length === 0) {
          const errorMsg = 'Profile not found';
          console.error(errorMsg);
          setError(errorMsg);
          showNotification(errorMsg, true);
          return;
        }
        
        const currentBalance = Number(profile[0].balance || 0);
        console.log('Current balance:', currentBalance);
        
        if (currentBalance < Number(amount)) {
          const errorMsg = 'Insufficient balance';
          console.error(errorMsg, { currentBalance, requestedAmount: amount });
          setError(errorMsg);
          showNotification(errorMsg, true);
          return;
        }

        console.log('Processing cash-out...');
        const result = await userProfileActor.updateProfile({
          greenScore: [],
          listings: [],
          bids: [],
          votedProposals: [],
          balance: [BigInt(currentBalance - Number(amount))]
        });
        
        console.log('Cash-out result:', result);
        if ('ok' in result) {
          const successMsg = `Successfully cashed out ${amount} CYC`;
          setSuccessMessage(successMsg);
          showNotification(successMsg);
          onSuccess();
          onClose();
        } else {
          const errorMsg = `Failed to cash out: ${result.err}`;
          console.error(errorMsg);
          setError(errorMsg);
          showNotification(errorMsg, true);
        }
      }
    } catch (err) {
      const errorMsg = `An error occurred: ${err.message}`;
      console.error(errorMsg, err);
      setError(errorMsg);
      showNotification(errorMsg, true);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4 text-gray-900">
          {mode === 'topup' ? 'Top Up Balance' : 'Cash Out'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (CYC)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Enter amount"
              min="1"
              required
            />
          </div>
          {error && (
            <div className="mb-4 text-red-500 text-sm">{error}</div>
          )}
          {successMessage && (
            <div className="mb-4 text-green-500 text-sm">{successMessage}</div>
          )}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                mode === 'topup'
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : mode === 'topup' ? 'Top Up' : 'Cash Out'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BalanceModal;
