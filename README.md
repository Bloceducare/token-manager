# Role-Based Token Manager

A comprehensive web application for managing Role-Based Soulbound Tokens (SBTs) on the Optimism network. This application allows administrators to create, mint, and burn role-based tokens for students and other participants.

## Features

### 🏭 Factory Management
- **Create Role Tokens**: Deploy new soulbound tokens for specific roles (e.g., Student, Instructor, Alumni)
- **Factory Overview**: View all deployed tokens and factory statistics
- **Dynamic Token Discovery**: Automatically fetch all tokens from the factory contract

### 🪙 Token Management
- **Mint Tokens**: Issue role-based tokens to student addresses
- **Burn Tokens**: Remove tokens from student addresses (irreversible)
- **Token Information**: View detailed token information including role descriptions
- **Real-time Updates**: Automatic refresh of token data after transactions

### 📊 Analytics Dashboard
- **Total Roles**: Number of different role types deployed
- **Active Roles**: Roles with current token holders
- **Total Supply**: Combined supply across all tokens
- **Transaction History**: Track all mint/burn operations

### 🔐 Security Features
- **Owner-only Operations**: Only factory owner can create tokens, only token owners can mint/burn
- **Soulbound Tokens**: Tokens cannot be transferred between addresses
- **Address Validation**: Proper Ethereum address validation for all operations

## Smart Contracts

### RoleBasedSBT
- ERC20-like soulbound token with role association
- Mint/burn functionality (owner only)
- Transfer functions disabled (soulbound)
- Role description storage

### RoleBasedSBTFactory
- Deploy new role-based tokens
- Track all deployed tokens
- Owner-only token creation

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Web3**: Wagmi + Viem
- **State Management**: TanStack Query
- **Blockchain**: Optimism Mainnet

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file with:
   ```
   VITE_WALLETCONNECT_PROJECT_ID=your_project_id
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Connect Wallet**
   - Use MetaMask or any Web3 wallet
   - Ensure you're connected to Optimism Mainnet
   - Factory owner can create tokens, token owners can mint/burn

## Usage

### For Administrators
1. **Create Role Token**: Use the "Create Token" button in the sidebar
2. **Mint Tokens**: Select a token and click "Mint" to issue tokens to students
3. **Burn Tokens**: Select a token and click "Burn" to remove tokens from students

### For Students
- View your token balances
- Tokens are soulbound and cannot be transferred
- Role information is displayed for each token

## Contract Addresses

- **Factory Contract**: `0x270b62Cd3bCa5a62307Fa182F974DBbF2E009c9A` (Optimism Mainnet)
- **Token Contracts**: Dynamically deployed through the factory

## Security Notes

- Only factory owner can create new role tokens
- Only token owner can mint/burn tokens
- All transactions require wallet confirmation
- Token transfers are permanently disabled (soulbound)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details
