import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus } from 'lucide-react';
import { contractService } from '@/lib/contracts';
import { useToast } from '@/hooks/use-toast';

interface CreateTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTokenModal({ isOpen, onClose }: CreateTokenModalProps) {
  const { address } = useAccount();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    role: '',
  });

  const createTokenMutation = useMutation({
    mutationFn: async (data: { name: string; symbol: string; role: string }) => {
      return contractService.createRoleToken(data.name, data.symbol, data.role);
    },
    onSuccess: (hash) => {
      toast({
        title: 'Token Created Successfully',
        description: `Role token "${formData.name}" has been created. Transaction: ${hash.slice(0, 6)}...${hash.slice(-4)}`,
      });
      
      // Reset form
      setFormData({ name: '', symbol: '', role: '' });
      
      // Close modal
      onClose();
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/factory-info'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tokens'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to Create Token',
        description: error instanceof Error ? error.message : 'An error occurred while creating the token',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.symbol.trim() || !formData.role.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    createTokenMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-dark-card border-dark-border text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Create New Role Token
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Deploy a new soulbound token for a specific role. Only factory owner can create tokens.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Token Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Student Role Token"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="bg-dark-bg border-dark-border text-white placeholder:text-gray-500"
              disabled={createTokenMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="symbol" className="text-white">Token Symbol</Label>
            <Input
              id="symbol"
              type="text"
              placeholder="e.g., STUDENT"
              value={formData.symbol}
              onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
              className="bg-dark-bg border-dark-border text-white placeholder:text-gray-500"
              disabled={createTokenMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-white">Role Description</Label>
            <Textarea
              id="role"
              placeholder="e.g., Student enrolled in Web3 Development course"
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="bg-dark-bg border-dark-border text-white placeholder:text-gray-500 min-h-[80px]"
              disabled={createTokenMutation.isPending}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-dark-border text-white hover:bg-dark-bg"
              disabled={createTokenMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-optimism-blue hover:bg-optimism-blue/80"
              disabled={createTokenMutation.isPending || !formData.name || !formData.symbol || !formData.role}
            >
              {createTokenMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Token
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
