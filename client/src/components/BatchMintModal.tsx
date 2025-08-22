import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, CheckCircle2 } from 'lucide-react';
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

  const [input, setInput] = useState('');

  const parseInput = (): { to: string; amount: string }[] => {
    return input
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [to, amount] = line.replace(/,/g, ' ').split(/\s+/);
        return { to, amount };
      });
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('No token selected');
      const rows = parseInput();
      if (rows.length === 0) throw new Error('No rows to mint');
      return contractService.batchMint(token.address, rows, token.decimals);
    },
    onSuccess: (hashes) => {
      toast({
        title: 'Batch Mint Complete',
        description: `${hashes.length} transactions submitted successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
      queryClient.invalidateQueries({ queryKey: ['/api/token-holders', token?.address] });
      setInput('');
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
            Paste list of address and amount pairs. Supported formats:
            <br />
            - 0xabc..., 1.5
            <br />
            - 0xabc... 1.5
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label className="text-white">Addresses and Amounts</Label>
          <Textarea
            className="bg-dark-bg border-dark-border min-h-[180px] text-white placeholder:text-gray-500"
            placeholder={"0x1234..., 1.5\n0xabcd..., 2\n0x9876..., 0.25"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={mutation.isPending}
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <Button variant="outline" className="flex-1 border-dark-border text-white hover:bg-dark-bg" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button className="flex-1 bg-optimism-blue hover:bg-optimism-blue/80" onClick={() => mutation.mutate()} disabled={mutation.isPending || !input.trim()}>
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
