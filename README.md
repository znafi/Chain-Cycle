# ChainCycle: Revolutionizing Material Trading with Blockchain

ChainCycle is a blockchain marketplace rewarding sustainable trading. Users earn CYC tokens and green scores for recycling materials. Built on Internet Computer, we make environmental responsibility profitable while building a greener future.

## 💡 Inspiration

During my time working with local recycling centers, I noticed a significant disconnect between material suppliers and potential buyers. Many valuable recyclable materials often ended up in landfills simply because there wasn't an efficient way to connect sellers with interested buyers. This observation led to the creation of ChainCycle, a decentralized marketplace that aims to bridge this gap while promoting sustainable practices.

## 🛠️ What it does

ChainCycle is a decentralized marketplace built on the Internet Computer blockchain where users can:
- List recyclable materials for sale
- Place bids on available materials
- Manage transactions with CYC tokens
- Track their trading history

The platform features:
- Secure authentication using Internet Identity
- Real-time bidding system
- Built-in token-based economy
- User profile management

## 🔨 How I built it

The project is built using:
- **Frontend**: React with TypeScript, Tailwind CSS for styling
- **Backend**: Motoko for Internet Computer canisters
- **Authentication**: Internet Identity
- **State Management**: Custom hooks and context
- **Token System**: Native CYC token implementation

The architecture follows a modular approach with separate canisters for:
- User profiles and balance management
- Marketplace listings and bids
- Token transactions

## 🏆 Challenges I ran into

1. **Blockchain Integration**: Implementing secure token transfers and balance management required careful consideration of edge cases and race conditions.

2. **Authentication Flow**: Getting Internet Identity to work smoothly with the frontend required solving several CORS and routing issues.

3. **State Management**: Ensuring consistent state across multiple canisters while maintaining good user experience was challenging.

4. **Bidding System**: Implementing a reliable bidding system that handles concurrent bids and updates in real-time required careful design.

## 📚 What I learned

- Deep understanding of Internet Computer's architecture and Motoko programming
- Best practices for building decentralized applications
- Token economy design and implementation
- Importance of user experience in blockchain applications
- State management in distributed systems

## 🚀 What's next for ChainCycle

Future plans include:
1. **Material Verification**: Implementing a verification system for material quality
2. **Smart Contracts**: Adding automated escrow and dispute resolution
3. **Mobile App**: Developing a native mobile application
4. **Analytics Dashboard**: Creating insights for trading patterns and market trends
5. **Integration**: Partnering with recycling centers and material processors

## 🔧 Technical Implementation

The project uses:
- React 18 with TypeScript
- Tailwind CSS for styling
- Internet Computer SDK (dfx version 0.24.3)
- Motoko for backend logic
- Internet Identity for authentication
- Vite for frontend tooling

## 💻 Development Setup

```bash
# Clone the repository
git clone https://github.com/safirhabib/chaincycle.git
cd chaincycle

# Install root dependencies
npm install

# Install frontend dependencies
cd src/frontend
npm install
npm install framer-motion  # Required for animations
cd ../..

# Start the local replica (in a new terminal)
dfx stop  # Stop any running replica
pkill dfx  # Kill any existing dfx processes
dfx start --clean

# Generate canister declarations
dfx generate

# Deploy Internet Identity canister first
dfx deploy internet_identity

# Build and deploy all canisters
dfx build
dfx canister install --all --mode reinstall

# Create frontend environment file
cd src/frontend
echo "DFX_NETWORK=local" > .env.local
echo "VITE_DFX_NETWORK=local" >> .env.local

# Start the frontend development server
npm run dev
```

Make sure you have the following installed:
- Node.js (v16 or higher)
- npm (v8 or higher)
- dfx (v0.24.3 or higher)

The application will be available at:
- Frontend: http://localhost:5173
- Internet Identity: http://localhost:4943/?canisterId=[identity-canister-id]

### Troubleshooting

If you encounter any issues:

1. **Port in Use Error**
```bash
dfx stop
pkill dfx
dfx start --clean
```

2. **Missing Dependencies**
```bash
cd src/frontend
npm install
npm install framer-motion
```

3. **Type Errors**
```bash
# Regenerate canister declarations
dfx generate
```

4. **Canister Installation Errors**
```bash
# Clean build and reinstall all canisters
dfx stop
dfx start --clean
dfx deploy internet_identity
dfx build
dfx canister install --all --mode reinstall
```

5. **Clean Start**
```bash
# Remove all build artifacts and dependencies
rm -rf .dfx node_modules dist src/declarations package-lock.json
cd src/frontend
rm -rf node_modules dist .env.local package-lock.json
cd ../..

# Start fresh
npm install
cd src/frontend
npm install
cd ../..
dfx start --clean
dfx deploy internet_identity
dfx build
dfx canister install --all --mode reinstall
```

### Verifying Installation

To verify that all canisters are properly installed:

```bash
# Check canister status
dfx canister status --all

# Expected output should show all canisters as 'Running'
```

If any canister shows as not running or installed, try the reinstall command:
```bash
dfx canister install --all --mode reinstall
