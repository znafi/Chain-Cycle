import { useEffect, useState } from 'react';
import { Actor, HttpAgent } from '@dfinity/agent';
import { useAuth } from '../contexts/AuthContext';
import { idlFactory } from '../../../declarations/chaincycle_backend/chaincycle_backend.did.js';
import type { _SERVICE } from '../../../declarations/chaincycle_backend/chaincycle_backend.did';

export const useBackendActor = () => {
  const { isAuthenticated, identity } = useAuth();
  const [actor, setActor] = useState<_SERVICE | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initActor = async () => {
      try {
        if (!identity) {
          console.log("No identity available");
          setActor(null);
          return;
        }

        console.log("Initializing actor with identity:", identity.getPrincipal().toString());

        const host = import.meta.env.VITE_DFX_NETWORK === "ic" 
          ? "https://ic0.app" 
          : `http://127.0.0.1:4943/?canisterId=${import.meta.env.VITE_CHAINCYCLE_BACKEND_CANISTER_ID}`;
        
        console.log("Using host:", host);

        // Create agent with proper configuration
        const agent = new HttpAgent({
          identity,
          host
        });

        // Only fetch root key in local development
        if (import.meta.env.VITE_DFX_NETWORK !== "ic") {
          console.log("Fetching root key for local development");
          await agent.fetchRootKey().catch(e => {
            console.error("Error fetching root key:", e);
            throw e;
          });
        }

        const canisterId = import.meta.env.VITE_CHAINCYCLE_BACKEND_CANISTER_ID;
        if (!canisterId) {
          throw new Error("Backend canister ID not found in environment variables");
        }

        console.log("Using backend canister ID:", canisterId);

        const newActor = Actor.createActor<_SERVICE>(idlFactory, {
          agent,
          canisterId,
        });

        // Test the actor connection
        try {
          console.log("Testing actor connection...");
          await newActor.getAllListings();
          console.log("Actor connection test successful");
        } catch (e) {
          console.error("Actor connection test failed:", e);
          throw e;
        }

        console.log("Actor created successfully");
        setActor(newActor);
        setError(null);
      } catch (err) {
        console.error("Error initializing actor:", err);
        const errObj = err as Error;
        setError(errObj.message || "Failed to initialize actor");
        setActor(null);
      }
    };

    if (isAuthenticated) {
      console.log("Authentication detected, initializing actor...");
      initActor();
    } else {
      console.log("No authentication, clearing actor...");
      setActor(null);
    }
  }, [isAuthenticated, identity]);

  return { actor, error };
};
