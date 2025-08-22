import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Download, ExternalLink, Copy } from 'lucide-react';
import { contractService } from '@/lib/contracts';
import { FACTORY_CONTRACT_ADDRESS } from '@/lib/web3';
import { useToast } from '@/hooks/use-toast';

export function FactorySidebar() {
  const { address } = useAccount();
  const { toast } = useToast();

  const { data: factoryData, isLoading, refetch } = useQuery({
    queryKey: ['/api/factory-info', address],
    queryFn: async () => {
      const tokenAddresses = await contractService.getFactoryTokens();
      
      let userHoldings = 0;
      
      if (address) {
        const tokenPromises = tokenAddresses.map(addr => 
          contractService.getTokenInfo(addr, address)
        );
        const tokens = await Promise.all(tokenPromises);
        
        tokens.forEach(token => {
          const balance = parseFloat(token.balance);
          if (balance > 0) {
            userHoldings += balance * 0.5;
          }
        });
      }

      return {
        factoryAddress: FACTORY_CONTRACT_ADDRESS,
        totalTokens: tokenAddresses.length,
        userHoldings: userHoldings.toFixed(2),
        tokenAddresses,
      };
    },
    enabled: !!address,
  });

  const copyFactoryAddress = () => {
    navigator.clipboard.writeText(FACTORY_CONTRACT_ADDRESS);
    toast({
      title: 'Address copied',
      description: 'Factory address copied to clipboard',
    });
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleExportData = () => {
    if (factoryData) {
      const data = {
        factoryAddress: factoryData.factoryAddress,
        totalTokens: factoryData.totalTokens,
        userHoldings: factoryData.userHoldings,
        tokenAddresses: factoryData.tokenAddresses,
        exportedAt: new Date().toISOString(),
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'optimism-tokens-data.json';
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Data exported',
        description: 'Token data has been exported as JSON file',
      });
    }
  };

  return (
    <Card className="bg-dark-card border-dark-border sticky top-8">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-6 text-white">Factory Overview</h2>
        
        {/* Factory Information */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Factory Address</span>
            <div className="flex items-center space-x-2">
              <span 
                className="text-xs font-mono bg-dark-bg px-2 py-1 rounded cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={copyFactoryAddress}
                data-testid="text-factory-address"
              >
                {FACTORY_CONTRACT_ADDRESS.slice(0, 6)}...{FACTORY_CONTRACT_ADDRESS.slice(-4)}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-auto p-1"
                onClick={copyFactoryAddress}
                data-testid="button-copy-factory-address"
              >
                <Copy className="h-3 w-3 text-gray-400" />
              </Button>
              <a
                href={`https://optimistic.etherscan.io/address/${FACTORY_CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-optimism-blue transition-colors"
                data-testid="link-factory-explorer"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Total Tokens</span>
            {isLoading ? (
              <Skeleton className="h-4 w-6" />
            ) : (
              <span className="font-semibold text-white" data-testid="text-total-tokens">
                {factoryData?.totalTokens || 0}
              </span>
            )}
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Your Holdings</span>
            {isLoading ? (
              <Skeleton className="h-4 w-16" />
            ) : (
              <span className="font-semibold text-green-400" data-testid="text-user-holdings">
                ${factoryData?.userHoldings || '0.00'}
              </span>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
            Quick Actions
          </h3>
          
          <Button
            variant="ghost"
            className="w-full justify-between bg-dark-bg hover:bg-gray-700 p-3 h-auto transition-colors duration-200 group"
            onClick={handleRefresh}
            disabled={isLoading}
            data-testid="button-refresh-factory-tokens"
          >
            <div className="flex items-center space-x-3">
              <RefreshCw className={`h-4 w-4 text-optimism-blue group-hover:text-optimism-blue/80 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="text-white">Refresh Tokens</span>
            </div>
            <div className="text-gray-500 text-sm">
              <span>→</span>
            </div>
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-between bg-dark-bg hover:bg-gray-700 p-3 h-auto transition-colors duration-200 group"
            onClick={handleExportData}
            disabled={!factoryData}
            data-testid="button-export-data"
          >
            <div className="flex items-center space-x-3">
              <Download className="h-4 w-4 text-optimism-blue group-hover:text-optimism-blue/80" />
              <span className="text-white">Export Data</span>
            </div>
            <div className="text-gray-500 text-sm">
              <span>→</span>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
