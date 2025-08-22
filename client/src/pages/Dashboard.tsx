import { useState } from 'react';
import { WalletConnect } from '@/components/WalletConnect';
import { TokenList } from '@/components/TokenList';
import { TransactionHistory } from '@/components/TransactionHistory';
import { FactorySidebar } from '@/components/FactorySidebar';
import { StatsCards } from '@/components/StatsCards';
import { Coins, Wifi } from 'lucide-react';
import type { TokenInfo } from '@shared/schema';

export default function Dashboard() {
  // Placeholder handlers for backward compatibility
  const handleSendToken = (token: TokenInfo) => {
    // This is now handled within TokenList component
  };

  const handleApproveToken = (token: TokenInfo) => {
    // This is now handled within TokenList component
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* Navigation Header */}
      <nav className="bg-dark-card border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-optimism-red to-optimism-blue rounded-lg flex items-center justify-center">
                  <Coins className="text-white h-5 w-5" />
                </div>
                <h1 className="text-xl font-bold text-white">Role-Based Token Manager</h1>
              </div>
              <div className="hidden md:flex items-center space-x-1 bg-dark-bg rounded-lg p-1">
                <span className="bg-optimism-red/10 text-optimism-red px-3 py-1 rounded text-sm font-medium">
                  Optimism Mainnet
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Network Status */}
              <div className="hidden lg:flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <Wifi className="h-4 w-4 text-green-400" />
                <span className="text-gray-400">Connected</span>
              </div>
              
              <WalletConnect />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <FactorySidebar />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Summary Cards */}
            <StatsCards />

            {/* Token Management Section */}
            <TokenList 
              onSendToken={handleSendToken}
              onApproveToken={handleApproveToken}
            />

            {/* Recent Transactions */}
            <TransactionHistory />
          </div>
        </div>
      </div>

      {/* Modals are now handled within individual components */}
    </div>
  );
}
