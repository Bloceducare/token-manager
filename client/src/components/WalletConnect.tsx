import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: 'Address copied',
        description: 'Wallet address copied to clipboard',
      });
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            className="bg-gradient-to-r from-optimism-red to-optimism-blue hover:from-optimism-red/80 hover:to-optimism-blue/80"
            disabled={isPending}
            data-testid="button-connect-wallet"
          >
            <Wallet className="h-4 w-4 mr-2" />
            {isPending ? 'Connecting...' : 'Connect Wallet'}
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-dark-card border-dark-border">
          {connectors.map((connector) => (
            <DropdownMenuItem
              key={connector.id}
              onClick={() => connect({ connector })}
              className="cursor-pointer text-white hover:bg-dark-bg focus:bg-dark-bg"
              data-testid={`button-connect-${connector.name.toLowerCase()}`}
            >
              <Wallet className="h-4 w-4 mr-2" />
              {connector.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-dark-card border-dark-border hover:bg-dark-bg text-white"
          data-testid="button-wallet-menu"
        >
          <Wallet className="h-4 w-4 mr-2" />
          <span data-testid="text-wallet-address">{formatAddress(address!)}</span>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-dark-card border-dark-border">
        <DropdownMenuItem 
          onClick={copyAddress} 
          className="text-white hover:bg-dark-bg focus:bg-dark-bg cursor-pointer"
          data-testid="button-copy-address"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={`https://optimistic.etherscan.io/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer text-white hover:bg-dark-bg focus:bg-dark-bg flex items-center"
            data-testid="link-view-explorer"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View on Explorer
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-dark-border" />
        <DropdownMenuItem 
          onClick={() => disconnect()}
          className="text-red-400 hover:bg-dark-bg focus:bg-dark-bg cursor-pointer"
          data-testid="button-disconnect"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
