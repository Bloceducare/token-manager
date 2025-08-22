import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Flame, User, AlertTriangle } from 'lucide-react';
import { contractService } from '@/lib/contracts';
import { useToast } from '@/hooks/use-toast';
import type { TokenInfo } from '@shared/schema';

interface BurnTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: TokenInfo | null;
}

export function BurnTokenModal({ isOpen, onClose, token }: BurnTokenModalProps) {
  const { address } = useAccount();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    fromAddress: '',
    amount: '',
  });

  const burnTokenMutation = useMutation({
    mutationFn: async (data: { fromAddress: string; amount: string }) => {
      if (!token) throw new Error('No token selected');
      return contractService.burnTokens(
        token.address,
        data.fromAddress,
        data.amount,
        token.decimals
      );
    },
    onSuccess: (hash) => {
      toast({
        title: 'Tokens Burned Successfully',
        description: `${formData.amount} ${token?.symbol} tokens have been burned from ${formData.fromAddress.slice(0, 6)}...${formData.fromAddress.slice(-4)}. Transaction: ${hash.slice(0, 6)}...${hash.slice(-4)}`,
      });
      
      // Reset form
      setFormData({ fromAddress: '', amount: '' });
      
      // Close modal
      onClose();
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
      queryClient.invalidateQueries({ queryKey: ['/api/factory-info'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to Burn Tokens',
        description: error instanceof Error ? error.message : 'An error occurred while burning tokens',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fromAddress.trim() || !formData.amount.trim()) {
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

    burnTokenMutation.mutate(formData);
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
            <Flame className="h-5 w-5 text-red-500" />
            Burn {token.symbol} Tokens
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Burn soulbound tokens from a student address. Only token owner can burn tokens.
          </DialogDescription>
        </DialogHeader>

        {/* Warning Alert */}
        <Alert className="bg-red-500/10 border-red-500/20">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-400">
            This action is irreversible. Burning tokens will permanently remove them from the student's balance.
          </AlertDescription>
        </Alert>

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
            <Label htmlFor="fromAddress" className="text-white flex items-center gap-2">
              <User className="h-4 w-4" />
              Student Address
            </Label>
            <Input
              id="fromAddress"
              type="text"
              placeholder="0x..."
              value={formData.fromAddress}
              onChange={(e) => handleInputChange('fromAddress', e.target.value)}
              className="bg-dark-bg border-dark-border text-white placeholder:text-gray-500 font-mono"
              disabled={burnTokenMutation.isPending}
            />
            {formData.fromAddress && !validateAddress(formData.fromAddress) && (
              <p className="text-red-400 text-sm">Please enter a valid Ethereum address</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-white">Amount to Burn</Label>
            <Input
              id="amount"
              type="number"
              step="0.000001"
              min="0"
              placeholder="e.g., 1.0"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className="bg-dark-bg border-dark-border text-white placeholder:text-gray-500"
              disabled={burnTokenMutation.isPending}
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
              disabled={burnTokenMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={
                burnTokenMutation.isPending || 
                !formData.fromAddress || 
                !formData.amount ||
                !validateAddress(formData.fromAddress)
              }
            >
              {burnTokenMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Burning...
                </>
              ) : (
                <>
                  <Flame className="mr-2 h-4 w-4" />
                  Burn Tokens
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
