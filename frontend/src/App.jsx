import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Subscribe from './pages/Subscribe';
import Claim from './pages/Claim';
import Documents from './pages/Documents';

function App() {
  return (
    <WalletProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="subscribe" element={<Subscribe />} />
            <Route path="claim" element={<Claim />} />
            <Route path="documents" element={<Documents />} />
          </Route>
        </Routes>
      </Router>
    </WalletProvider>
  );
}

export default App;
