import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Send, Check, Plus } from 'lucide-react';
import { contractService } from '@/lib/contracts';
import type { TokenInfo } from '@shared/schema';
import { useState } from 'react';

interface TokenListProps {
  onSendToken: (token: TokenInfo) => void;
  onApproveToken: (token: TokenInfo) => void;
}

export function TokenList({ onSendToken, onApproveToken }: TokenListProps) {
  const { address } = useAccount();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: tokens, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/tokens', address],
    queryFn: async () => {
      if (!address) return [];
      
      const tokenAddresses = await contractService.getFactoryTokens();
      const tokenPromises = tokenAddresses.map(addr => 
        contractService.getTokenInfo(addr, address)
      );
      
      return Promise.all(tokenPromises);
    },
    enabled: !!address,
  });

  const filteredTokens = (tokens || []).filter(token => 
    token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = () => {
    refetch();
  };

  if (!address) {
    return (
      <Card className="bg-dark-card border-dark-border">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">Connect your wallet to view tokens</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-dark-card border-dark-border">
        <CardContent className="p-6 text-center">
          <p className="text-red-400 mb-4">Failed to load tokens</p>
          <Button onClick={handleRefresh} variant="outline" data-testid="button-retry-tokens">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-dark-card border-dark-border">
      <div className="p-6 border-b border-dark-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-semibold text-white">Token Management</h2>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search tokens..."
                className="bg-dark-bg border-dark-border pl-10 pr-4 py-2 text-sm focus:border-optimism-blue"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-tokens"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <Button
              onClick={handleRefresh}
              className="bg-optimism-blue hover:bg-optimism-blue/80"
              size="sm"
              data-testid="button-refresh-tokens"
            >
              <Plus className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-4 w-16 mb-2" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredTokens.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400" data-testid="text-no-tokens">
              {searchTerm ? 'No tokens match your search' : 'No tokens found from factory'}
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {filteredTokens.map((token) => (
              <div
                key={token.address}
                className="flex items-center justify-between p-4 hover:bg-dark-bg rounded-lg transition-colors duration-200 border-b border-dark-border/50 last:border-b-0"
                data-testid={`card-token-${token.symbol}`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-optimism-blue to-optimism-red rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {token.symbol.slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white" data-testid={`text-token-name-${token.symbol}`}>
                      {token.name}
                    </h3>
                    <p className="text-gray-400 text-sm" data-testid={`text-token-symbol-${token.symbol}`}>
                      {token.symbol}
                    </p>
                    <p className="text-xs text-gray-500 font-mono" data-testid={`text-token-address-${token.symbol}`}>
                      {token.address.slice(0, 6)}...{token.address.slice(-4)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white" data-testid={`text-token-balance-${token.symbol}`}>
                    {parseFloat(token.balance).toLocaleString(undefined, {
                      maximumFractionDigits: 4
                    })} {token.symbol}
                  </p>
                  {token.usdValue && (
                    <p className="text-gray-400 text-sm" data-testid={`text-token-usd-${token.symbol}`}>
                      ${token.usdValue}
                    </p>
                  )}
                  <div className="flex items-center space-x-2 mt-2">
                    <Button
                      size="sm"
                      className="bg-green-500/10 hover:bg-green-500/20 text-green-400"
                      onClick={() => onSendToken(token)}
                      disabled={parseFloat(token.balance) === 0}
                      data-testid={`button-send-${token.symbol}`}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Send
                    </Button>
                    <Button
                      size="sm"
                      className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400"
                      onClick={() => onApproveToken(token)}
                      data-testid={`button-approve-${token.symbol}`}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Approve
                    </Button>
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
