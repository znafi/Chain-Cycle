import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Identity } from '@dfinity/agent';

interface AuthContextType {
  isAuthenticated: boolean;
  identity: Identity | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;

    const initAuth = async () => {
      console.log("Starting auth initialization...");
      try {
        // Create a new AuthClient without any storage options first
        console.log("Creating basic AuthClient...");
        const client = await AuthClient.create();
        console.log("Basic AuthClient created successfully");
        
        // Set the client immediately so we can use it
        setAuthClient(client);
        
        console.log("Checking authentication status...");
        const isAuthenticated = await client.isAuthenticated();
        console.log("Authentication status:", isAuthenticated);
        setIsAuthenticated(isAuthenticated);

        if (isAuthenticated) {
          const identity = client.getIdentity();
          console.log("Retrieved identity:", identity.getPrincipal().toString());
          setIdentity(identity);
        }
        
        setIsInitialized(true);
      } catch (err) {
        console.error("Error during auth initialization:", err);
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying initialization (attempt ${retryCount}/${maxRetries})...`);
          setTimeout(initAuth, 1000); // Wait 1 second before retrying
        } else {
          console.error("Max retries reached. Auth initialization failed.");
          setIsInitialized(true); // Set to true even on error so UI can show error state
        }
      }
    };

    initAuth();

    // Cleanup function
    return () => {
      retryCount = maxRetries; // Prevent any pending retries
    };
  }, []);

  const login = async () => {
    if (!isInitialized) {
      console.error("Auth system not yet initialized");
      return;
    }
    
    if (!authClient) {
      console.error("Auth client not initialized");
      return;
    }

    console.log("Starting login process...");
    const identityProvider = import.meta.env.VITE_DFX_NETWORK === "ic" 
      ? "https://identity.ic0.app"
      : `http://127.0.0.1:4943/?canisterId=${import.meta.env.VITE_INTERNET_IDENTITY_CANISTER_ID}`;

    console.log("Network:", import.meta.env.VITE_DFX_NETWORK);
    console.log("Internet Identity Canister ID:", import.meta.env.VITE_INTERNET_IDENTITY_CANISTER_ID);
    console.log("Using identity provider:", identityProvider);

    try {
      console.log("Initiating login with Internet Identity...");
      await new Promise<void>((resolve, reject) => {
        authClient.login({
          identityProvider,
          maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days in nanoseconds
          derivationOrigin: import.meta.env.VITE_DFX_NETWORK !== "ic" 
            ? "http://localhost:5173"  // Use the Vite dev server URL with localhost
            : undefined,
          onSuccess: () => {
            console.log("Login callback received: success");
            try {
              const identity = authClient.getIdentity();
              console.log("Login successful, identity:", identity.getPrincipal().toString());
              setIsAuthenticated(true);
              setIdentity(identity);
              resolve();
            } catch (err) {
              console.error("Error getting identity after successful login:", err);
              reject(err);
            }
          },
          onError: (error) => {
            console.error("Login callback received: error");
            console.error("Login error details:", error);
            reject(error);
          }
        });
      });
    } catch (err) {
      console.error("Error during login:", err);
      throw err;
    }
  };

  const logout = async () => {
    if (!authClient) return;
    await authClient.logout();
    setIsAuthenticated(false);
    setIdentity(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, identity, login, logout, isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
