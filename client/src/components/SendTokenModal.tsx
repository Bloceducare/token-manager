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
import { Send } from 'lucide-react';
// import { contractService } from '@/lib/contracts';
// Mock isAddress function
const isAddress = (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address);
import type { TokenInfo } from '@shared/schema';

const sendTokenSchema = z.object({
  recipient: z.string().min(1, 'Recipient address is required').refine(
    (val) => isAddress(val),
    'Invalid Ethereum address'
  ),
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Amount must be a positive number'
  ),
});

type SendTokenFormData = z.infer<typeof sendTokenSchema>;

interface SendTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: TokenInfo | null;
}

export function SendTokenModal({ isOpen, onClose, token }: SendTokenModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SendTokenFormData>({
    resolver: zodResolver(sendTokenSchema),
    defaultValues: {
      recipient: '',
      amount: '',
    },
  });

  // Mock mutation for demo
  const sendMutation = {
    mutateAsync: async (data: SendTokenFormData) => {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 1000));
      return '0xabcdef1234567890';
    }
  };

  const onSubmit = async (data: SendTokenFormData) => {
    if (!token) return;
    
    setIsSubmitting(true);
    try {
      const hash = await sendMutation.mutateAsync(data);
      toast({
        title: 'Transaction submitted',
        description: `Mock transaction hash: ${hash.slice(0, 10)}...`,
      });
      onClose();
      form.reset();
    } catch (error) {
      toast({
        title: 'Transaction failed',
        description: 'Demo error',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMaxAmount = () => {
    if (token) {
      form.setValue('amount', token.balance);
    }
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-dark-card border-dark-border">
        <DialogHeader>
          <DialogTitle className="text-white">Send Token</DialogTitle>
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
                    <p className="text-white font-medium" data-testid="text-selected-token-name">
                      {token.name} ({token.symbol})
                    </p>
                    <p className="text-gray-400 text-sm" data-testid="text-selected-token-balance">
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
            <Label htmlFor="recipient" className="text-gray-400 mb-2 block">
              Recipient Address
            </Label>
            <Input
              id="recipient"
              placeholder="0x..."
              className="bg-dark-bg border-dark-border text-white focus:border-optimism-blue"
              {...form.register('recipient')}
              data-testid="input-recipient-address"
            />
            {form.formState.errors.recipient && (
              <p className="text-red-400 text-sm mt-1">
                {form.formState.errors.recipient.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="amount" className="text-gray-400 mb-2 block">
              Amount
            </Label>
            <div className="relative">
              <Input
                id="amount"
                placeholder="0.00"
                className="bg-dark-bg border-dark-border text-white focus:border-optimism-blue pr-16"
                {...form.register('amount')}
                data-testid="input-send-amount"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleMaxAmount}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-optimism-blue hover:text-optimism-blue/80 text-sm font-medium bg-transparent hover:bg-transparent p-0"
                data-testid="button-max-amount"
              >
                MAX
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
              data-testid="button-cancel-send"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !token}
              className="bg-gradient-to-r from-optimism-red to-optimism-blue hover:from-optimism-red/80 hover:to-optimism-blue/80"
              data-testid="button-confirm-send"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
