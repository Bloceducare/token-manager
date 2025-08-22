import { useQuery } from '@tanstack/react-query';
// Mock wallet hook for development
const useAccount = () => ({ address: null });
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Check, ExternalLink, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface Transaction {
  hash: string;
  type: 'send' | 'receive' | 'approve';
  amount: string;
  tokenSymbol: string;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
  from?: string;
  to?: string;
}

export function TransactionHistory() {
  const { address } = useAccount();
  const [showAll, setShowAll] = useState(false);

  // Mock data for now - in real app this would fetch from blockchain
  const { data: transactions, isLoading, error } = useQuery({
    queryKey: ['/api/transactions', address],
    queryFn: async (): Promise<Transaction[]> => {
      // This would be replaced with actual blockchain transaction fetching
      return [
        {
          hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          type: 'send',
          amount: '250.00',
          tokenSymbol: 'DGT',
          timestamp: '2 hours ago',
          status: 'confirmed',
          to: '0x1234...5678',
        },
        {
          hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          type: 'approve',
          amount: '∞',
          tokenSymbol: 'UNT',
          timestamp: '5 hours ago',
          status: 'confirmed',
        },
        {
          hash: '0x9999aaaabbbbccccddddeeeefffff000011112222333344445555666677778888',
          type: 'receive',
          amount: '500.00',
          tokenSymbol: 'YFT',
          timestamp: '1 day ago',
          status: 'confirmed',
          from: '0x9999...aaaa',
        },
      ];
    },
    enabled: !!address,
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <ArrowUp className="h-4 w-4 text-green-400" />;
      case 'receive':
        return <ArrowDown className="h-4 w-4 text-purple-400" />;
      case 'approve':
        return <Check className="h-4 w-4 text-blue-400" />;
      default:
        return <ArrowUp className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      confirmed: 'bg-green-500/10 text-green-400 border-green-500/20',
      pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      failed: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    return (
      <Badge 
        className={variants[status as keyof typeof variants] || variants.pending}
        data-testid={`badge-status-${status}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'send':
        return 'Send';
      case 'receive':
        return 'Receive';
      case 'approve':
        return 'Approve';
      default:
        return 'Transaction';
    }
  };

  const displayedTransactions = showAll ? transactions : transactions?.slice(0, 3);

  if (!address) {
    return (
      <Card className="bg-dark-card border-dark-border">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">Connect your wallet to view transaction history</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-dark-card border-dark-border">
      <CardHeader className="border-b border-dark-border pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-white">
            Recent Transactions
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="text-optimism-blue hover:text-optimism-blue/80"
            data-testid="button-view-all-transactions"
          >
            {showAll ? 'Show Less' : 'View All'}
            <ExternalLink className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-5 w-24 mb-2" />
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-5 w-20 mb-2" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">Failed to load transactions</p>
            <Button variant="outline" size="sm" data-testid="button-retry-transactions">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : !transactions || transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400" data-testid="text-no-transactions">
              No transactions found
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {displayedTransactions?.map((tx) => (
              <div
                key={tx.hash}
                className="flex items-center justify-between p-4 hover:bg-dark-bg rounded-lg transition-colors duration-200 border-b border-dark-border/50 last:border-b-0"
                data-testid={`card-transaction-${tx.hash.slice(0, 8)}`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-500/10 rounded-lg flex items-center justify-center">
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div>
                    <p className="font-medium text-white" data-testid={`text-tx-type-${tx.hash.slice(0, 8)}`}>
                      {formatTransactionType(tx.type)} {tx.tokenSymbol}
                    </p>
                    <p className="text-gray-400 text-sm" data-testid={`text-tx-time-${tx.hash.slice(0, 8)}`}>
                      {tx.timestamp}
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-gray-500 font-mono">
                        {tx.hash.slice(0, 8)}...{tx.hash.slice(-4)}
                      </p>
                      <a
                        href={`https://optimistic.etherscan.io/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-optimism-blue hover:text-optimism-blue/80"
                        data-testid={`link-tx-explorer-${tx.hash.slice(0, 8)}`}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p 
                    className={`font-semibold ${
                      tx.type === 'receive' ? 'text-green-400' : 'text-white'
                    }`}
                    data-testid={`text-tx-amount-${tx.hash.slice(0, 8)}`}
                  >
                    {tx.type === 'receive' ? '+' : tx.type === 'send' ? '-' : ''}
                    {tx.amount} {tx.tokenSymbol}
                  </p>
                  <div className="mt-2">
                    {getStatusBadge(tx.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
