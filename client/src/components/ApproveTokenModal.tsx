import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Check } from 'lucide-react';
import { contractService } from '@/lib/contracts';
import { isAddress } from 'viem';
import type { TokenInfo } from '@shared/schema';

const approveTokenSchema = z.object({
  spender: z.string().min(1, 'Spender address is required').refine(
    (val) => isAddress(val),
    'Invalid Ethereum address'
  ),
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => val === 'unlimited' || (!isNaN(Number(val)) && Number(val) > 0),
    'Amount must be a positive number or "unlimited"'
  ),
});

type ApproveTokenFormData = z.infer<typeof approveTokenSchema>;

interface ApproveTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: TokenInfo | null;
}

export function ApproveTokenModal({ isOpen, onClose, token }: ApproveTokenModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ApproveTokenFormData>({
    resolver: zodResolver(approveTokenSchema),
    defaultValues: {
      spender: '',
      amount: '',
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (data: ApproveTokenFormData) => {
      if (!token) throw new Error('No token selected');
      
      return contractService.approveToken(
        token.address,
        data.spender,
        data.amount,
        token.decimals
      );
    },
    onSuccess: (hash) => {
      toast({
        title: 'Approval submitted',
        description: `Transaction hash: ${hash.slice(0, 10)}...`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Approval failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (data: ApproveTokenFormData) => {
    if (!token) return;
    
    setIsSubmitting(true);
    try {
      const hash = await approveMutation.mutateAsync(data);
      toast({
        title: 'Approval submitted',
        description: `Mock transaction hash: ${hash.slice(0, 10)}...`,
      });
      onClose();
      form.reset();
    } catch (error) {
      toast({
        title: 'Approval failed',
        description: 'Demo error',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlimited = () => {
    form.setValue('amount', 'unlimited');
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-dark-card border-dark-border">
        <DialogHeader>
          <DialogTitle className="text-white">Approve Token</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label className="text-gray-400 mb-2 block">Token</Label>
            <div className="bg-dark-bg border border-dark-border rounded-lg p-3">
              {token ? (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-optimism-blue to-optimism-red rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {token.symbol.slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium" data-testid="text-approve-token-name">
                      {token.name} ({token.symbol})
                    </p>
                    <p className="text-gray-400 text-sm" data-testid="text-approve-token-balance">
                      Balance: {parseFloat(token.balance).toLocaleString()} {token.symbol}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">No token selected</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="spender" className="text-gray-400 mb-2 block">
              Spender Address
            </Label>
            <Input
              id="spender"
              placeholder="0x..."
              className="bg-dark-bg border-dark-border text-white focus:border-optimism-blue"
              {...form.register('spender')}
              data-testid="input-spender-address"
            />
            {form.formState.errors.spender && (
              <p className="text-red-400 text-sm mt-1">
                {form.formState.errors.spender.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="amount" className="text-gray-400 mb-2 block">
              Allowance Amount
            </Label>
            <div className="relative">
              <Input
                id="amount"
                placeholder="0.00 or 'unlimited'"
                className="bg-dark-bg border-dark-border text-white focus:border-optimism-blue pr-24"
                {...form.register('amount')}
                data-testid="input-approve-amount"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleUnlimited}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-optimism-blue hover:text-optimism-blue/80 text-sm font-medium bg-transparent hover:bg-transparent p-0"
                data-testid="button-unlimited-approval"
              >
                UNLIMITED
              </Button>
            </div>
            {form.formState.errors.amount && (
              <p className="text-red-400 text-sm mt-1">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="text-gray-400 hover:text-white"
              data-testid="button-cancel-approve"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !token}
              className="bg-gradient-to-r from-optimism-red to-optimism-blue hover:from-optimism-red/80 hover:to-optimism-blue/80"
              data-testid="button-confirm-approve"
            >
              <Check className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Approving...' : 'Approve'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
