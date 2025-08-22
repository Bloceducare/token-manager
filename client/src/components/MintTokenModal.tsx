import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Coins, User } from 'lucide-react';
import { contractService } from '@/lib/contracts';
import { useToast } from '@/hooks/use-toast';
import type { TokenInfo } from '@shared/schema';

interface MintTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: TokenInfo | null;
}

export function MintTokenModal({ isOpen, onClose, token }: MintTokenModalProps) {
  const { address } = useAccount();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    recipientAddress: '',
    amount: '',
  });

  const mintTokenMutation = useMutation({
    mutationFn: async (data: { recipientAddress: string; amount: string }) => {
      if (!token) throw new Error('No token selected');
      return contractService.mintTokens(
        token.address,
        data.recipientAddress,
        data.amount,
        token.decimals
      );
    },
    onSuccess: (hash) => {
      toast({
        title: 'Tokens Minted Successfully',
        description: `${formData.amount} ${token?.symbol} tokens have been minted to ${formData.recipientAddress.slice(0, 6)}...${formData.recipientAddress.slice(-4)}. Transaction: ${hash.slice(0, 6)}...${hash.slice(-4)}`,
      });
      
      // Reset form
      setFormData({ recipientAddress: '', amount: '' });
      
      // Close modal
      onClose();
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
      queryClient.invalidateQueries({ queryKey: ['/api/factory-info'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to Mint Tokens',
        description: error instanceof Error ? error.message : 'An error occurred while minting tokens',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.recipientAddress.trim() || !formData.amount.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid positive number',
        variant: 'destructive',
      });
      return;
    }

    mintTokenMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  if (!token) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-dark-card border-dark-border text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <Coins className="h-5 w-5 text-optimism-blue" />
            Mint {token.symbol} Tokens
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Mint soulbound tokens to a student address. Only token owner can mint tokens.
          </DialogDescription>
        </DialogHeader>

        {/* Token Info */}
        <div className="bg-dark-bg rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Token:</span>
            <span className="font-semibold text-white">{token.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Symbol:</span>
            <Badge variant="secondary" className="bg-optimism-blue/20 text-optimism-blue">
              {token.symbol}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Role:</span>
            <span className="text-white text-sm">{token.role}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Total Supply:</span>
            <span className="text-white">{parseFloat(token.totalSupply).toLocaleString()} {token.symbol}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipientAddress" className="text-white flex items-center gap-2">
              <User className="h-4 w-4" />
              Student Address
            </Label>
            <Input
              id="recipientAddress"
              type="text"
              placeholder="0x..."
              value={formData.recipientAddress}
              onChange={(e) => handleInputChange('recipientAddress', e.target.value)}
              className="bg-dark-bg border-dark-border text-white placeholder:text-gray-500 font-mono"
              disabled={mintTokenMutation.isPending}
            />
            {formData.recipientAddress && !validateAddress(formData.recipientAddress) && (
              <p className="text-red-400 text-sm">Please enter a valid Ethereum address</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-white">Amount to Mint</Label>
            <Input
              id="amount"
              type="number"
              step="0.000001"
              min="0"
              placeholder="e.g., 1.0"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className="bg-dark-bg border-dark-border text-white placeholder:text-gray-500"
              disabled={mintTokenMutation.isPending}
            />
            <p className="text-gray-400 text-sm">
              Decimals: {token.decimals}
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-dark-border text-white hover:bg-dark-bg"
              disabled={mintTokenMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={
                mintTokenMutation.isPending || 
                !formData.recipientAddress || 
                !formData.amount ||
                !validateAddress(formData.recipientAddress)
              }
            >
              {mintTokenMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Minting...
                </>
              ) : (
                <>
                  <Coins className="mr-2 h-4 w-4" />
                  Mint Tokens
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
