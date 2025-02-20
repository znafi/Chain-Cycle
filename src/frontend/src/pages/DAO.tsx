import React, { useState, useEffect, useRef } from 'react';
import { useBackendActor } from '../hooks/useBackendActor';
import { useAuth } from '../contexts/AuthContext';
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { idlFactory as backendIdlFactory } from '../../../declarations/chaincycle_backend/chaincycle_backend.did.js';
import { idlFactory as userProfileIdlFactory } from '../../../declarations/user_profile/user_profile.did.js';
import type { _SERVICE as BackendService } from '../../../declarations/chaincycle_backend/chaincycle_backend.did';
import type { _SERVICE as UserProfileService } from '../../../declarations/user_profile/user_profile.did';

interface Proposal {
  id: bigint;
  creator: Principal;
  title: string;
  description: string;
  voteEndTime: bigint;
  status: { active: null } | { passed: null } | { rejected: null };
  yesVotes: bigint;
  noVotes: bigint;
}

const DAO: React.FC = () => {
  const { isAuthenticated, identity } = useAuth();
  const { actor: backendActor, error: actorError } = useBackendActor();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [votingLoading, setVotingLoading] = useState<Record<string, boolean>>({});
  const [newProposal, setNewProposal] = useState({ title: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ensureBackendActor = async () => {
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const host = import.meta.env.VITE_DFX_NETWORK === "ic" ? "https://ic0.app" : "http://127.0.0.1:4943";
    const agent = new HttpAgent({
      identity,
      host,
    });

    if (import.meta.env.VITE_DFX_NETWORK !== "ic") {
      await agent.fetchRootKey();
    }

    const canisterId = import.meta.env.VITE_CHAINCYCLE_BACKEND_CANISTER_ID;
    if (!canisterId) {
      throw new Error("Backend canister ID not found");
    }

    return Actor.createActor<BackendService>(backendIdlFactory, {
      agent,
      canisterId,
    });
  };

  const ensureUserProfile = async () => {
    if (!identity) {
      throw new Error("Not authenticated");
    }

    try {
      const host = import.meta.env.VITE_DFX_NETWORK === "ic" ? "https://ic0.app" : "http://127.0.0.1:4943";
      const agent = new HttpAgent({
        identity,
        host,
      });

      if (import.meta.env.VITE_DFX_NETWORK !== "ic") {
        await agent.fetchRootKey();
      }

      const userProfileCanisterId = import.meta.env.VITE_USER_PROFILE_CANISTER_ID;
      if (!userProfileCanisterId) {
        throw new Error("User profile canister ID not found");
      }

      const userProfileActor = Actor.createActor<UserProfileService>(userProfileIdlFactory, {
        agent,
        canisterId: userProfileCanisterId,
      });

      const principal = identity.getPrincipal();
      console.log("Checking profile for principal:", principal.toString());
      
      const hasProfile = await userProfileActor.hasProfile(principal);
      console.log("Has profile check result:", hasProfile);
      
      if (!hasProfile) {
        console.log("Profile doesn't exist, creating...");
        const result = await userProfileActor.createProfile();
        console.log("Create profile result:", result);
      } else {
        console.log("Profile already exists");
      }
    } catch (err) {
      console.error("Error in ensureUserProfile:", err);
      throw err;
    }
  };

  const fetchProposals = async () => {
    if (!identity) {
      setError("Please login first");
      return;
    }
    
    try {
      const actor = await ensureBackendActor();
      console.log("Fetching proposals...");
      const result = await actor.getAllProposals();
      console.log("Raw proposals result:", result);
      
      // Check if result is an array (old format) or Result type
      if (Array.isArray(result)) {
        console.log("Handling direct array response");
        const typedProposals = result
          .map((p: any): Proposal => {
            const processed = {
              id: p.id,
              creator: Principal.fromText(p.creator.toString()),
              title: p.title,
              description: p.description,
              voteEndTime: p.voteEndTime,
              status: p.status,
              yesVotes: p.yesVotes,
              noVotes: p.noVotes
            };
            console.log("Processed proposal:", {
              ...processed,
              creator: processed.creator.toString(),
              voteEndTime: new Date(Number(processed.voteEndTime) / 1_000_000).toLocaleString()
            });
            return processed;
          })
          .sort((a, b) => Number(b.id - a.id)); // Sort by ID descending (newest first)
        
        console.log(`Fetched and sorted ${typedProposals.length} proposals`);
        setProposals(typedProposals);
        setError(null);
      } else if ('ok' in result) {
        console.log("Handling Result.ok response");
        const typedProposals = result.ok
          .map((p: any): Proposal => {
            const processed = {
              id: p.id,
              creator: Principal.fromText(p.creator.toString()),
              title: p.title,
              description: p.description,
              voteEndTime: p.voteEndTime,
              status: p.status,
              yesVotes: p.yesVotes,
              noVotes: p.noVotes
            };
            console.log("Processed proposal:", {
              ...processed,
              creator: processed.creator.toString(),
              voteEndTime: new Date(Number(processed.voteEndTime) / 1_000_000).toLocaleString()
            });
            return processed;
          })
          .sort((a, b) => Number(b.id - a.id)); // Sort by ID descending (newest first)
        
        console.log(`Fetched and sorted ${typedProposals.length} proposals`);
        setProposals(typedProposals);
        setError(null);
      } else if ('err' in result) {
        if (result.err === "No proposals found") {
          console.log("No proposals found");
          setProposals([]);
          setError(null);
        } else {
          console.error("Failed to fetch proposals:", result.err);
          setError('Error fetching proposals: ' + result.err);
        }
      } else {
        console.error("Unexpected response format:", result);
        setError('Unexpected response format from backend');
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
      setError(error instanceof Error ? error.message : "Failed to fetch proposals");
    }
  };

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && identity && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchProposals();
    }
  }, [isAuthenticated, identity]);

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity) {
      setError("Please login first");
      return;
    }

    setIsSubmitting(true);
    try {
      const actor = await ensureBackendActor();
      console.log("Creating proposal:", {
        title: newProposal.title,
        description: newProposal.description
      });
      
      const result = await actor.createProposal(newProposal.title, newProposal.description);
      console.log("Create proposal result:", result);
      
      if ('ok' in result) {
        const createdProposal = result.ok;
        console.log("Proposal created successfully:", {
          id: createdProposal.id.toString(),
          title: createdProposal.title,
          creator: createdProposal.creator.toString(),
          status: createdProposal.status
        });
        setNewProposal({ title: '', description: '' });
        await fetchProposals(); // Refresh the list
        setError(null);
      } else {
        console.error("Failed to create proposal:", result.err);
        setError('Failed to create proposal: ' + result.err);
      }
    } catch (error) {
      console.error('Error creating proposal:', error);
      setError(error instanceof Error ? error.message : "Failed to create proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (proposalId: bigint, voteYes: boolean) => {
    if (!identity) {
      setError("Please login first");
      return;
    }

    setVotingLoading(prev => ({ ...prev, [proposalId.toString()]: true }));
    try {
      const actor = await ensureBackendActor();
      console.log("Casting vote:", {
        proposalId: proposalId.toString(),
        vote: voteYes ? 'yes' : 'no',
        voter: identity.getPrincipal().toString()
      });
      
      const result = await actor.castVote(proposalId, voteYes);
      console.log("Vote result:", result);
      
      if ('ok' in result) {
        const updatedProposal = result.ok;
        console.log("Vote cast successfully:", {
          proposalId: updatedProposal.id.toString(),
          newYesVotes: updatedProposal.yesVotes.toString(),
          newNoVotes: updatedProposal.noVotes.toString(),
          status: updatedProposal.status
        });
        await fetchProposals(); // Refresh the list
        setError(null);
      } else {
        console.error("Failed to cast vote:", result.err);
        setError('Failed to cast vote: ' + result.err);
      }
    } catch (error) {
      console.error('Error casting vote:', error);
      setError(error instanceof Error ? error.message : "Failed to cast vote");
    } finally {
      setVotingLoading(prev => ({ ...prev, [proposalId.toString()]: false }));
    }
  };

  const getStatusText = (status: Proposal['status']): string => {
    if ('active' in status) return 'Active';
    if ('passed' in status) return 'Passed';
    if ('rejected' in status) return 'Rejected';
    return 'Unknown';
  };

  const getTimeAgo = (time: bigint): string => {
    const now = new Date();
    const timestamp = new Date(Number(time) / 1_000_000);
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const getVoteProgress = (yes: bigint, no: bigint): number => {
    const total = Number(yes) + Number(no);
    if (total === 0) return 0;
    return (Number(yes) / total) * 100;
  };

  const getTimeRemaining = (endTime: bigint): string => {
    const now = new Date();
    const end = new Date(Number(endTime) / 1_000_000);
    const diffInSeconds = Math.floor((end.getTime() - now.getTime()) / 1000);
    
    if (diffInSeconds <= 0) return 'Ended';
    if (diffInSeconds < 3600) return `${Math.ceil(diffInSeconds / 60)} minutes left`;
    if (diffInSeconds < 86400) return `${Math.ceil(diffInSeconds / 3600)} hours left`;
    return `${Math.ceil(diffInSeconds / 86400)} days left`;
  };

  if (actorError) {
    return <div className="text-red-500">Error: {actorError}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">ChainCycle DAO</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Proposal</h2>
        <form onSubmit={handleCreateProposal}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={newProposal.title}
              onChange={(e) => setNewProposal(prev => ({ ...prev, title: e.target.value }))}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              value={newProposal.description}
              onChange={(e) => setNewProposal(prev => ({ ...prev, description: e.target.value }))}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Creating...' : 'Create Proposal'}
          </button>
        </form>
      </div>

      {proposals.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
          No proposals found. Create one to get started!
        </div>
      ) : (
        <div className="grid gap-6">
          {proposals.map((proposal) => (
            <div key={proposal.id.toString()} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{proposal.title}</h2>
                  <div className="text-sm text-gray-500 mt-1">
                    Created by: {proposal.creator.toString().slice(0, 5)}...{proposal.creator.toString().slice(-5)}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-3 py-1 rounded-full text-sm mb-2 ${
                    'active' in proposal.status ? 'bg-blue-100 text-blue-800' :
                    'passed' in proposal.status ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {getStatusText(proposal.status)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {getTimeRemaining(proposal.voteEndTime)}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">{proposal.description}</p>
              
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${getVoteProgress(proposal.yesVotes, proposal.noVotes)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <div className="text-green-600">
                    <span className="font-semibold">Yes:</span> {proposal.yesVotes.toString()}
                  </div>
                  <div className="text-red-600">
                    <span className="font-semibold">No:</span> {proposal.noVotes.toString()}
                  </div>
                </div>
              </div>

              {'active' in proposal.status && (
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={() => handleVote(proposal.id, true)}
                    disabled={votingLoading[proposal.id.toString()]}
                    className={`flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
                  >
                    {votingLoading[proposal.id.toString()] ? 'Voting...' : 'Vote Yes'}
                  </button>
                  <button
                    onClick={() => handleVote(proposal.id, false)}
                    disabled={votingLoading[proposal.id.toString()]}
                    className={`flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
                  >
                    {votingLoading[proposal.id.toString()] ? 'Voting...' : 'Vote No'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DAO;
