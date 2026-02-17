import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Wallet, Home, FileText, DollarSign, BookOpen, ExternalLink } from 'lucide-react';
import ConnectWallet from './ConnectWallet';
import { CONTRACTS } from '../config/contracts';
import { getChainConfig } from '../config/chains';
import { formatAddress } from '../utils/format';

export default function Layout() {
  const chainId = parseInt(import.meta.env.VITE_CHAIN_ID || '80002');
  const chainConfig = getChainConfig(chainId);

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Top Navigation */}
      <nav className="bg-dark-card border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Title */}
            <div className="flex items-center space-x-3">
              <Wallet className="w-8 h-8 text-emerald-500" />
              <div>
                <h1 className="text-xl font-bold text-white">Ryegate Yield Engine</h1>
                <p className="text-xs text-gray-400">Security Token Dashboard</p>
              </div>
            </div>

            {/* Wallet Connect */}
            <ConnectWallet />
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="space-y-2">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    isActive ? 'bg-emerald-600 text-white' : 'nav-link hover:bg-dark-card'
                  }`
                }
              >
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                to="/subscribe"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    isActive ? 'bg-emerald-600 text-white' : 'nav-link hover:bg-dark-card'
                  }`
                }
              >
                <FileText className="w-5 h-5" />
                <span>Subscribe</span>
              </NavLink>

              <NavLink
                to="/claim"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    isActive ? 'bg-emerald-600 text-white' : 'nav-link hover:bg-dark-card'
                  }`
                }
              >
                <DollarSign className="w-5 h-5" />
                <span>Claim Yield</span>
              </NavLink>

              <NavLink
                to="/documents"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    isActive ? 'bg-emerald-600 text-white' : 'nav-link hover:bg-dark-card'
                  }`
                }
              >
                <BookOpen className="w-5 h-5" />
                <span>Documents</span>
              </NavLink>
            </nav>

            {/* Contract Info */}
            <div className="mt-8 card text-xs">
              <h3 className="font-semibold text-gray-300 mb-2">Contract Address</h3>
              <a
                href={`${chainConfig.blockExplorerUrls[0]}/address/${CONTRACTS.RYEGATE_NOTES}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300"
              >
                <span>{formatAddress(CONTRACTS.RYEGATE_NOTES)}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark-card border-t border-dark-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-400">
            <p>Ryegate Yield Engine © 2026 | {chainConfig.chainName}</p>
            <p className="mt-1">
              Securities offered through registered broker-dealer | Not FDIC Insured
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
