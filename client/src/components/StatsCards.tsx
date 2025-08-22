import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Coins, ArrowUpRight } from 'lucide-react';
import { contractService } from '@/lib/contracts';

export function StatsCards() {
  const { address } = useAccount();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/portfolio-stats', address],
    queryFn: async () => {
      if (!address) return null;
      
      const tokenAddresses = await contractService.getFactoryTokens();
      const tokenPromises = tokenAddresses.map(addr => 
        contractService.getTokenInfo(addr, address)
      );
      const tokens = await Promise.all(tokenPromises);
      
      let totalValue = 0;
      let activeTokens = 0;
      
      tokens.forEach(token => {
        const balance = parseFloat(token.balance);
        if (balance > 0) {
          activeTokens++;
          totalValue += balance * 0.5;
        }
      });

      return {
        portfolioValue: totalValue.toFixed(2),
        portfolioChange: '+12.5%',
        activeTokens,
        transactionCount: 43,
      };
    },
    enabled: !!address,
  });

  if (!address) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-dark-card border-dark-border">
            <CardContent className="p-6 text-center">
              <p className="text-gray-400">Connect wallet to view stats</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Portfolio Value */}
      <Card className="bg-dark-card border-dark-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Portfolio Value</p>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mt-1" />
              ) : (
                <p className="text-2xl font-bold text-white" data-testid="text-portfolio-value">
                  ${stats?.portfolioValue || '0.00'}
                </p>
              )}
              {isLoading ? (
                <Skeleton className="h-4 w-16 mt-2" />
              ) : (
                <p className="text-green-400 text-sm mt-1" data-testid="text-portfolio-change">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  {stats?.portfolioChange || '+0.0%'} (24h)
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Tokens */}
      <Card className="bg-dark-card border-dark-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Tokens</p>
              {isLoading ? (
                <Skeleton className="h-8 w-12 mt-1" />
              ) : (
                <p className="text-2xl font-bold text-white" data-testid="text-active-tokens">
                  {stats?.activeTokens || 0}
                </p>
              )}
              <p className="text-blue-400 text-sm mt-1">
                <Coins className="h-3 w-3 inline mr-1" />
                With Balance
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Coins className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card className="bg-dark-card border-dark-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Transactions</p>
              {isLoading ? (
                <Skeleton className="h-8 w-12 mt-1" />
              ) : (
                <p className="text-2xl font-bold text-white" data-testid="text-transaction-count">
                  {stats?.transactionCount || 0}
                </p>
              )}
              <p className="text-purple-400 text-sm mt-1">
                <ArrowUpRight className="h-3 w-3 inline mr-1" />
                This Month
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
