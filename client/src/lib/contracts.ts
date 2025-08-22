import { readContract, readContracts, writeContract } from 'wagmi/actions';
import { parseUnits, formatUnits, isAddress } from 'viem';
import { config, FACTORY_CONTRACT_ADDRESS, FACTORY_ABI, ROLEBASEDSBT_ABI, publicClient } from './web3';
import type { TokenInfo } from '@shared/schema';

export class ContractService {
  
  async getFactoryTokens(): Promise<string[]> {
    try {
      // Use the getAllTokens function from the factory contract
      const tokenAddresses = await readContract(config, {
        address: FACTORY_CONTRACT_ADDRESS,
        abi: FACTORY_ABI,
        functionName: 'getAllTokens',
      }) as string[];

      return tokenAddresses;
    } catch (error) {
      console.error('Error fetching factory tokens:', error);
      throw new Error('Failed to fetch tokens from factory contract');
    }
  }

  async getTokenInfo(tokenAddress: string, userAddress?: string): Promise<TokenInfo> {
    if (!isAddress(tokenAddress)) {
      throw new Error('Invalid token address');
    }

    try {
      // Prepare contract calls
      const contracts = [
        {
          address: tokenAddress as `0x${string}`,
          abi: ROLEBASEDSBT_ABI,
          functionName: 'name',
        },
        {
          address: tokenAddress as `0x${string}`,
          abi: ROLEBASEDSBT_ABI,
          functionName: 'symbol',
        },
        {
          address: tokenAddress as `0x${string}`,
          abi: ROLEBASEDSBT_ABI,
          functionName: 'decimals',
        },
        {
          address: tokenAddress as `0x${string}`,
          abi: ROLEBASEDSBT_ABI,
          functionName: 'totalSupply',
        },
        {
          address: tokenAddress as `0x${string}`,
          abi: ROLEBASEDSBT_ABI,
          functionName: 'role',
        },
      ];

      // Add balance call if user address is provided
      if (userAddress && isAddress(userAddress)) {
        contracts.push({
          address: tokenAddress as `0x${string}`,
          abi: ROLEBASEDSBT_ABI,
          functionName: 'balanceOf',
          args: [userAddress as `0x${string}`],
        } as any);
      }

      const results = await readContracts(config, {
        contracts: contracts as any,
      });

      const [nameResult, symbolResult, decimalsResult, totalSupplyResult, roleResult, balanceResult] = results;

      if (nameResult.status === 'failure' || 
          symbolResult.status === 'failure' || 
          decimalsResult.status === 'failure' ||
          totalSupplyResult.status === 'failure' ||
          roleResult.status === 'failure') {
        throw new Error('Failed to fetch token information');
      }

      const name = nameResult.result as string;
      const symbol = symbolResult.result as string;
      const decimals = Number(decimalsResult.result);
      const totalSupply = totalSupplyResult.result as bigint;
      const role = roleResult.result as string;
      
      let balance = '0';
      if (balanceResult && balanceResult.status === 'success') {
        balance = formatUnits(balanceResult.result as bigint, decimals);
      }

      return {
        address: tokenAddress,
        name,
        symbol,
        decimals,
        totalSupply: formatUnits(totalSupply, decimals),
        balance,
        role,
      };
    } catch (error) {
      console.error('Error fetching token info:', error);
      throw new Error(`Failed to fetch token information: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async transferToken(
    tokenAddress: string,
    to: string,
    amount: string,
    decimals: number
  ): Promise<string> {
    if (!isAddress(tokenAddress) || !isAddress(to)) {
      throw new Error('Invalid address provided');
    }

    try {
      const parsedAmount = parseUnits(amount, decimals);
      
      // Note: RoleBasedSBT tokens are soulbound - transfers are disabled
      // This will always fail for soulbound tokens
      const hash = await writeContract(config, {
        address: tokenAddress as `0x${string}`,
        abi: ROLEBASEDSBT_ABI,
        functionName: 'transfer',
        args: [to as `0x${string}`, parsedAmount],
      });

      return hash;
    } catch (error) {
      console.error('Error transferring token:', error);
      throw new Error(`Failed to transfer token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async approveToken(
    tokenAddress: string,
    spender: string,
    amount: string,
    decimals: number
  ): Promise<string> {
    if (!isAddress(tokenAddress) || !isAddress(spender)) {
      throw new Error('Invalid address provided');
    }

    try {
      const parsedAmount = amount === 'unlimited' 
        ? BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
        : parseUnits(amount, decimals);
      
      // Note: RoleBasedSBT tokens are soulbound - approvals are disabled
      // This will always fail for soulbound tokens
      const hash = await writeContract(config, {
        address: tokenAddress as `0x${string}`,
        abi: ROLEBASEDSBT_ABI,
        functionName: 'approve',
        args: [spender as `0x${string}`, parsedAmount],
      });

      return hash;
    } catch (error) {
      console.error('Error approving token:', error);
      throw new Error(`Failed to approve token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAllowance(
    tokenAddress: string,
    owner: string,
    spender: string
  ): Promise<string> {
    if (!isAddress(tokenAddress) || !isAddress(owner) || !isAddress(spender)) {
      throw new Error('Invalid address provided');
    }

    try {
      const allowance = await readContract(config, {
        address: tokenAddress as `0x${string}`,
        abi: ROLEBASEDSBT_ABI,
        functionName: 'allowance',
        args: [owner as `0x${string}`, spender as `0x${string}`],
      }) as bigint;

      // Get token decimals to format the allowance
      const decimals = await readContract(config, {
        address: tokenAddress as `0x${string}`,
        abi: ROLEBASEDSBT_ABI,
        functionName: 'decimals',
      }) as number;

      return formatUnits(allowance, decimals);
    } catch (error) {
      console.error('Error fetching allowance:', error);
      throw new Error(`Failed to fetch allowance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // New methods for role-based functionality
  async mintTokens(
    tokenAddress: string,
    to: string,
    amount: string,
    decimals: number
  ): Promise<string> {
    if (!isAddress(tokenAddress) || !isAddress(to)) {
      throw new Error('Invalid address provided');
    }

    try {
      const parsedAmount = parseUnits(amount, decimals);
      
      const hash = await writeContract(config, {
        address: tokenAddress as `0x${string}`,
        abi: ROLEBASEDSBT_ABI,
        functionName: 'mint',
        args: [to as `0x${string}`, parsedAmount],
      });

      return hash;
    } catch (error) {
      console.error('Error minting tokens:', error);
      throw new Error(`Failed to mint tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async burnTokens(
    tokenAddress: string,
    from: string,
    amount: string,
    decimals: number
  ): Promise<string> {
    if (!isAddress(tokenAddress) || !isAddress(from)) {
      throw new Error('Invalid address provided');
    }

    try {
      const parsedAmount = parseUnits(amount, decimals);
      
      const hash = await writeContract(config, {
        address: tokenAddress as `0x${string}`,
        abi: ROLEBASEDSBT_ABI,
        functionName: 'burn',
        args: [from as `0x${string}`, parsedAmount],
      });

      return hash;
    } catch (error) {
      console.error('Error burning tokens:', error);
      throw new Error(`Failed to burn tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createRoleToken(
    name: string,
    symbol: string,
    role: string
  ): Promise<string> {
    try {
      const hash = await writeContract(config, {
        address: FACTORY_CONTRACT_ADDRESS,
        abi: FACTORY_ABI,
        functionName: 'createRoleToken',
        args: [name, symbol, role],
      });

      return hash;
    } catch (error) {
      console.error('Error creating role token:', error);
      throw new Error(`Failed to create role token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Holders derived from Mint/Burn logs (balances reconstructed)
  async getTokenHolders(tokenAddress: string): Promise<{ address: string; balance: string }[]> {
    if (!isAddress(tokenAddress)) throw new Error('Invalid token address');

    // Topics
    // event Mint(address indexed to, uint256 amount);
    // event Burn(address indexed from, uint256 amount);
    const mintTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'; // placeholder, will decode via ABI below
    // We will not rely on hardcoded topics; use ABI log decoding

    const fromBlock = 0n; // can be optimized later
    const toBlock = 'latest' as const;

    const mintLogs = await publicClient.getLogs({
      address: tokenAddress as `0x${string}`,
      event: {
        type: 'event',
        name: 'Mint',
        inputs: [
          { indexed: true, name: 'to', type: 'address' },
          { indexed: false, name: 'amount', type: 'uint256' },
        ],
      } as any,
      fromBlock,
      toBlock,
    });

    const burnLogs = await publicClient.getLogs({
      address: tokenAddress as `0x${string}`,
      event: {
        type: 'event',
        name: 'Burn',
        inputs: [
          { indexed: true, name: 'from', type: 'address' },
          { indexed: false, name: 'amount', type: 'uint256' },
        ],
      } as any,
      fromBlock,
      toBlock,
    });

    // Aggregate balances
    const balances = new Map<string, bigint>();

    for (const log of mintLogs as any[]) {
      const to = log.args?.to as string;
      const amount = BigInt(log.args?.amount ?? 0n);
      if (!to) continue;
      balances.set(to, (balances.get(to) ?? 0n) + amount);
    }

    for (const log of burnLogs as any[]) {
      const from = log.args?.from as string;
      const amount = BigInt(log.args?.amount ?? 0n);
      if (!from) continue;
      balances.set(from, (balances.get(from) ?? 0n) - amount);
    }

    // Get decimals for formatting
    const decimals = await readContract(config, {
      address: tokenAddress as `0x${string}`,
      abi: ROLEBASEDSBT_ABI,
      functionName: 'decimals',
    }) as number;

    const holders = Array.from(balances.entries())
      .filter(([, bal]) => bal > 0n)
      .map(([addr, bal]) => ({ address: addr, balance: formatUnits(bal, decimals) }));

    // Sort by balance desc
    holders.sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));

    return holders;
  }

  // Batch mint (sequential writes)
  async batchMint(
    tokenAddress: string,
    mints: { to: string; amount: string }[],
    decimals: number
  ): Promise<string[]> {
    if (!isAddress(tokenAddress)) throw new Error('Invalid token address');
    if (!Array.isArray(mints) || mints.length === 0) throw new Error('Empty batch');

    const txHashes: string[] = [];
    for (const { to, amount } of mints) {
      if (!isAddress(to)) throw new Error(`Invalid address: ${to}`);
      const parsed = parseUnits(amount, decimals);
      const hash = await writeContract(config, {
        address: tokenAddress as `0x${string}`,
        abi: ROLEBASEDSBT_ABI,
        functionName: 'mint',
        args: [to as `0x${string}`, parsed],
      });
      txHashes.push(hash);
    }
    return txHashes;
  }
}

export const contractService = new ContractService();