import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { contractService } from '@/lib/contracts';
import type { TokenInfo } from '@shared/schema';
import { Coins, Flame, Users } from 'lucide-react';

interface TokenDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: TokenInfo | null;
  onMint: (token: TokenInfo) => void;
  onBurn: (token: TokenInfo, holderAddress?: string) => void;
}

export function TokenDetailsModal({ isOpen, onClose, token, onMint, onBurn }: TokenDetailsModalProps) {
  const queryClient = useQueryClient();

  const { data: holders, isLoading, refetch } = useQuery({
    queryKey: ['/api/token-holders', token?.address],
    queryFn: async () => {
      if (!token) return [];
      return contractService.getTokenHolders(token.address);
    },
    enabled: isOpen && !!token,
  });

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  if (!token) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-dark-card border-dark-border text-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-optimism-blue" />
            {token.name} Holders
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Review current holders and perform mint/burn operations.
          </DialogDescription>
        </DialogHeader>

        {/* Token Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-dark-bg rounded-lg p-3">
            <div className="text-gray-400 text-xs">Symbol</div>
            <div className="text-white font-semibold">
              <Badge className="bg-optimism-blue/20 text-optimism-blue">{token.symbol}</Badge>
            </div>
          </div>
          <div className="bg-dark-bg rounded-lg p-3">
            <div className="text-gray-400 text-xs">Total Supply</div>
            <div className="text-white font-semibold">{parseFloat(token.totalSupply).toLocaleString()}</div>
          </div>
          <div className="bg-dark-bg rounded-lg p-3">
            <div className="text-gray-400 text-xs">Decimals</div>
            <div className="text-white font-semibold">{token.decimals}</div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-3">
          <div className="text-sm text-gray-400">Role: <span className="text-white">{token.role}</span></div>
          <div className="space-x-2">
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => onMint(token)}>
              <Coins className="h-3 w-3 mr-1" /> Mint
            </Button>
          </div>
        </div>

        {/* Holders List */}
        <div className="border border-dark-border rounded-lg overflow-hidden">
          <div className="bg-dark-bg px-4 py-2 text-sm text-gray-400">Holders</div>
          <ScrollArea className="max-h-[320px]">
            <div className="divide-y divide-dark-border/50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4 flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-8 w-28" />
                  </div>
                ))
              ) : holders && holders.length > 0 ? (
                holders.map((h) => (
                  <div key={h.address} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-mono text-sm text-white">{h.address.slice(0, 6)}...{h.address.slice(-4)}</div>
                      <div className="text-gray-400 text-xs">Balance: {h.balance} {token.symbol}</div>
                    </div>
                    <div className="space-x-2">
                      <Button size="sm" variant="outline" className="border-dark-border text-white hover:bg-dark-bg" onClick={() => onBurn(token, h.address)}>
                        <Flame className="h-3 w-3 mr-1 text-red-400" /> Burn
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-gray-400 text-sm">No holders yet.</div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
