import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-400">ChainCycle</h3>
            <p className="text-gray-300 text-sm">
              Revolutionizing material recycling through blockchain technology. Join us in creating a sustainable future.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-green-400">Home</Link></li>
              <li><Link to="/marketplace" className="text-gray-300 hover:text-green-400">Marketplace</Link></li>
              <li><Link to="/dao" className="text-gray-300 hover:text-green-400">DAO</Link></li>
              <li><Link to="/my-items" className="text-gray-300 hover:text-green-400">My Items</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-green-400">Documentation</a></li>
              <li><a href="#" className="text-gray-300 hover:text-green-400">API</a></li>
              <li><a href="#" className="text-gray-300 hover:text-green-400">Support</a></li>
              <li><a href="#" className="text-gray-300 hover:text-green-400">Community</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-4">Connect</h3>
            <ul className="space-y-2">
              <li><a href="https://github.com" className="text-gray-300 hover:text-green-400">GitHub</a></li>
              <li><a href="https://twitter.com" className="text-gray-300 hover:text-green-400">Twitter</a></li>
              <li><a href="https://discord.com" className="text-gray-300 hover:text-green-400">Discord</a></li>
              <li><a href="https://telegram.org" className="text-gray-300 hover:text-green-400">Telegram</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} ChainCycle. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
