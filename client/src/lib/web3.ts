import { http, createConfig } from 'wagmi';
import { optimism } from 'wagmi/chains';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';
import { createPublicClient } from 'viem';

// Fallback if wagmi/chains import fails
const optimismFallback = {
  id: 10,
  name: 'OP Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet.optimism.io'] },
  },
  blockExplorers: {
    default: { name: 'Optimistic Etherscan', url: 'https://optimistic.etherscan.io' },
  },
} as const;

// Get project ID from environment variables
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

// Use optimism from wagmi/chains or fallback
const optimismChain = typeof optimism !== 'undefined' ? optimism : optimismFallback;

export const config = createConfig({
  chains: [optimismChain],
  connectors: [
    injected(),
    metaMask(),
    ...(projectId ? [walletConnect({ projectId })] : []),
  ],
  transports: {
    [optimismChain.id]: http(),
  },
});

// Export optimism chain for use in components
export { optimismChain as optimism };

// Factory contract address on Optimism mainnet
export const FACTORY_CONTRACT_ADDRESS = '0x270b62Cd3bCa5a62307Fa182F974DBbF2E009c9A' as const;

// Re-export ABIs from the dedicated abis file
export { FACTORY_ABI, ROLEBASEDSBT_ABI } from './abis';

// Legacy export for compatibility - using import syntax to fix reference
import { ROLEBASEDSBT_ABI } from './abis';
export const ERC20_ABI = ROLEBASEDSBT_ABI;

// Public client for read-only blockchain operations (logs/events)
export const publicClient = createPublicClient({
  chain: optimismChain as any,
  transport: http(),
});
