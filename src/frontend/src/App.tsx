import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Marketplace from './pages/Marketplace';
import Profile from './pages/Profile';
import DAO from './pages/DAO';
import MyItems from './pages/MyItems';
import MyBids from './pages/MyBids';
import Home from './pages/Home';
import Footer from './components/Footer';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-black text-white flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route path="/my-items" element={<MyItems />} />
              <Route path="/my-bids" element={<MyBids />} />
              <Route 
                path="/dao" 
                element={
                  <ProtectedRoute>
                    <DAO />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
