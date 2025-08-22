import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Coins, ArrowUpRight, Users, Building2 } from 'lucide-react';
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
      
      let totalTokens = 0;
      let activeRoles = 0;
      let totalSupply = 0;
      
      tokens.forEach(token => {
        const balance = parseFloat(token.balance);
        const supply = parseFloat(token.totalSupply);
        totalTokens += supply;
        if (balance > 0) {
          activeRoles++;
        }
      });

      return {
        totalTokens: totalTokens.toFixed(0),
        activeRoles,
        totalRoles: tokens.length,
        totalSupply: totalTokens.toFixed(0),
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
      {/* Total Roles */}
      <Card className="bg-dark-card border-dark-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Roles</p>
              {isLoading ? (
                <Skeleton className="h-8 w-12 mt-1" />
              ) : (
                <p className="text-2xl font-bold text-white" data-testid="text-total-roles">
                  {stats?.totalRoles || 0}
                </p>
              )}
              <p className="text-blue-400 text-sm mt-1">
                <Building2 className="h-3 w-3 inline mr-1" />
                Role Types
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Roles */}
      <Card className="bg-dark-card border-dark-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Roles</p>
              {isLoading ? (
                <Skeleton className="h-8 w-12 mt-1" />
              ) : (
                <p className="text-2xl font-bold text-white" data-testid="text-active-roles">
                  {stats?.activeRoles || 0}
                </p>
              )}
              <p className="text-green-400 text-sm mt-1">
                <Users className="h-3 w-3 inline mr-1" />
                With Balance
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Supply */}
      <Card className="bg-dark-card border-dark-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Supply</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-bold text-white" data-testid="text-total-supply">
                  {parseInt(stats?.totalSupply || '0').toLocaleString()}
                </p>
              )}
              <p className="text-purple-400 text-sm mt-1">
                <Coins className="h-3 w-3 inline mr-1" />
                All Tokens
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Coins className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
