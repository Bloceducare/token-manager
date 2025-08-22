# OptimismDeFi Token Dashboard

## Overview

This is a DeFi token dashboard application built for the Optimism blockchain. The application allows users to interact with tokens created through a factory contract, providing functionality to view, send, and approve ERC20 tokens. It features a modern React frontend with Web3 integration through Wagmi, connected to a minimal Express backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built using React with TypeScript and follows a component-based architecture:

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with a custom design system using CSS variables
- **UI Components**: Radix UI primitives wrapped in custom components (shadcn/ui pattern)
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (TanStack Query) for server state and caching

### Web3 Integration

The application uses modern Web3 libraries for blockchain interaction:

- **Wallet Connection**: Wagmi for React hooks and wallet management
- **Blockchain Library**: Viem for low-level Ethereum interactions
- **Network**: Configured for Optimism mainnet
- **Contract Interactions**: Direct smart contract calls using wagmi/viem (no backend proxy)

### Backend Architecture

The backend follows a minimal API-first approach:

- **Framework**: Express.js with TypeScript
- **Architecture**: RESTful API design with minimal endpoints
- **Database**: Drizzle ORM configured for PostgreSQL (Neon Database)
- **Authentication**: No authentication system (wallet-based identity)
- **Session Management**: Basic in-memory storage for development

### Database Design

The application uses PostgreSQL with the following schema design:

- **tokens**: Stores token metadata (address, name, symbol, decimals, total supply)
- **transactions**: Transaction history and status tracking
- **userBalances**: User token balance caching for performance

All database interactions use Drizzle ORM with type-safe queries and schema validation through Zod.

### Build System

- **Frontend Build**: Vite for fast development and optimized production builds
- **Backend Build**: ESBuild for server compilation
- **Development**: Hot module reloading with Vite dev server
- **TypeScript**: Shared type definitions between frontend and backend

### Component Architecture

The UI follows a atomic design pattern with reusable components:

- **Base Components**: Typography, buttons, inputs, cards (shadcn/ui)
- **Feature Components**: Token lists, transaction history, wallet connection
- **Page Components**: Dashboard layout and routing
- **Modal Components**: Send/approve token functionality

### Design System

The application uses a comprehensive design system with:

- **Color Palette**: Custom CSS variables supporting light/dark themes
- **Typography**: Inter font family with consistent sizing scale
- **Spacing**: Tailwind's spacing system with custom radius variables
- **Icons**: Lucide React for consistent iconography

## External Dependencies

### Blockchain Infrastructure

- **Optimism Mainnet**: Primary blockchain network for token interactions
- **Factory Contract**: Smart contract at `0x270b62Cd3bCa5a62307Fa182F974DBbF2E009c9A` for token creation
- **RPC Provider**: Default Optimism RPC endpoints through Wagmi

### Database Services

- **Neon Database**: PostgreSQL hosting service configured through `DATABASE_URL`
- **Connection**: Serverless PostgreSQL with connection pooling

### Development Tools

- **Replit Integration**: Custom plugins for development environment
- **Runtime Error Handling**: Replit error modal overlay for development
- **Cartographer**: Replit's file mapping tool for code intelligence

### Package Dependencies

- **Web3 Stack**: @neondatabase/serverless, wagmi, viem
- **UI Framework**: @radix-ui components, @tanstack/react-query
- **Form Handling**: react-hook-form with @hookform/resolvers
- **Validation**: Zod for schema validation
- **Styling**: Tailwind CSS, class-variance-authority, clsx
- **Build Tools**: Vite, ESBuild, TypeScript

### Font Resources

- **Google Fonts**: Inter, Architects Daughter, DM Sans, Fira Code, Geist Mono
- **Loading Strategy**: Preconnect optimization for performance