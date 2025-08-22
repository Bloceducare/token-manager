import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload } from 'lucide-react';
import { contractService } from '@/lib/contracts';
import type { TokenInfo } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface BatchMintModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: TokenInfo | null;
}

export function BatchMintModal({ isOpen, onClose, token }: BatchMintModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [addressesInput, setAddressesInput] = useState('');
  const [amount, setAmount] = useState('');

  const parseAddresses = (): string[] => {
    return addressesInput
      .split(/\r?\n|,|\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('No token selected');
      const addrs = parseAddresses();
      if (addrs.length === 0) throw new Error('No addresses provided');
      const amtNum = parseFloat(amount);
      if (!amount || isNaN(amtNum) || amtNum <= 0) throw new Error('Enter a valid positive amount');
      const mints = addrs.map((to) => ({ to, amount }));
      return contractService.batchMint(token.address, mints, token.decimals);
    },
    onSuccess: (hashes) => {
      toast({
        title: 'Batch Mint Complete',
        description: `${hashes.length} transactions submitted successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
      queryClient.invalidateQueries({ queryKey: ['/api/token-holders', token?.address] });
      setAddressesInput('');
      setAmount('');
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Batch Mint Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  if (!token) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-dark-card border-dark-border text-white sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">Batch Mint {token.symbol}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Paste a list of addresses (newline, comma, or space separated). All will receive the same amount.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Addresses</Label>
            <Textarea
              className="bg-dark-bg border-dark-border min-h-[160px] text-white placeholder:text-gray-500"
              placeholder={"0x1234...\n0xabcd...\n0x9876..."}
              value={addressesInput}
              onChange={(e) => setAddressesInput(e.target.value)}
              disabled={mutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Amount per Address</Label>
            <Input
              type="number"
              step="0.000001"
              min="0"
              placeholder="e.g., 1.5"
              className="bg-dark-bg border-dark-border text-white placeholder:text-gray-500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={mutation.isPending}
            />
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button variant="outline" className="flex-1 border-dark-border text-white hover:bg-dark-bg" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button className="flex-1 bg-optimism-blue hover:bg-optimism-blue/80" onClick={() => mutation.mutate()} disabled={mutation.isPending || !addressesInput.trim() || !amount.trim()}>
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Minting...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Submit Batch
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
