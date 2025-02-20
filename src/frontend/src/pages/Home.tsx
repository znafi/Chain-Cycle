import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated, login } = useAuth();

  return (
    <div className="bg-black text-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-black to-gray-900 z-0"></div>
        <div className="container mx-auto px-4 z-10">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-green-400">Revolutionizing</span> Material Recycling with Blockchain
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Join our decentralized marketplace for sustainable material trading and recycling.
              Make a difference while earning rewards.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/marketplace"
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Explore Marketplace
              </Link>
              {!isAuthenticated && (
                <button
                  onClick={() => login()}
                  className="bg-transparent border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Why Choose <span className="text-green-400">ChainCycle</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
              <div className="text-green-400 text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold mb-4">Sustainable Trading</h3>
              <p className="text-gray-300">
                Trade materials sustainably while contributing to a circular economy.
                Every transaction helps reduce waste and environmental impact.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
              <div className="text-green-400 text-4xl mb-4">⛓️</div>
              <h3 className="text-xl font-semibold mb-4">Blockchain Powered</h3>
              <p className="text-gray-300">
                Secure, transparent, and decentralized trading platform built on
                the Internet Computer blockchain.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
              <div className="text-green-400 text-4xl mb-4">🏛️</div>
              <h3 className="text-xl font-semibold mb-4">DAO Governance</h3>
              <p className="text-gray-300">
                Be part of our community-driven governance. Vote on proposals
                and shape the future of material recycling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20" id="about">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
              About <span className="text-green-400">ChainCycle</span>
            </h2>
            <p className="text-gray-300 text-lg mb-8 text-center">
              ChainCycle is a revolutionary platform that combines blockchain technology
              with sustainable material trading. Our mission is to create a more
              sustainable future by facilitating the efficient recycling and reuse
              of materials through a decentralized marketplace.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-green-400">Our Mission</h3>
                <p className="text-gray-300">
                  To revolutionize the material recycling industry by creating a
                  transparent, efficient, and sustainable marketplace powered by
                  blockchain technology.
                </p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-green-400">Our Vision</h3>
                <p className="text-gray-300">
                  A world where material recycling is seamless, transparent, and
                  beneficial for both the environment and participants.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-400">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Ready to Join the Revolution?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Start trading materials, earn rewards, and make a positive impact
            on the environment today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/marketplace"
              className="bg-black hover:bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Start Trading
            </Link>
            <Link
              to="/dao"
              className="bg-transparent border-2 border-black text-black hover:bg-black hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Join DAO
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
