# Neptune Investment Platform - Frontend

## 🚀 Project Overview

Neptune is a modern, secure, and user-friendly investment platform with comprehensive features for users and administrators, featuring Binance integration and a robust investment ecosystem.

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Authentication Flow](#authentication-flow)
- [Investment Process](#investment-process)
- [Pages and Components](#pages-and-components)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Security Considerations](#security-considerations)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Features

### User Features

- 🔐 Secure Authentication
- 💰 Multi-Wallet System
- 📈 Compound Interest Investments
- 🤝 Referral Program
- 📤 USDT Deposits and Withdrawals
- 📋 KYC Verification

### Admin Features

- 🖥️ Comprehensive Dashboard
- 📊 Real-time Transaction Monitoring
- 👥 User Management
- 💸 Withdrawal Approvals
- 📈 Investment Tracking

## 🗂️ Project Structure

```
src/
├── app/
│   ├── (routes)/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── verify-otp/
│   │   │   │   └── page.tsx
│   │   │   └── reset-password/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (user)/
│   │   │   ├── [userId]/
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── wallet/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   ├── account/
│   │   │   │   │   │   ├── trading/
│   │   │   │   │   │   └── referral/
│   │   │   │   │   ├── investments/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── [investmentId]/
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   ├── deposits/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── [depositId]/
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   └── withdrawals/
│   │   │   │   │       ├── page.tsx
│   │   │   │   │       └── [withdrawalId]/
│   │   │   │   │           └── page.tsx
│   │   │   │   │
│   │   │   │   └── referral/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   ├── (admin)/
│   │   │   │   ├── [adminId]/
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── users/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── [userId]/
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   ├── transactions/
│   │   │   │   │   │   ├── deposits/
│   │   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   │   └── [depositId]/
│   │   │   │   │   │   └── withdrawals/
│   │   │   │   │   │       ├── page.tsx
│   │   │   │   │   │       └── [withdrawalId]/
│   │   │   │   │   │           └── page.tsx
│   │   │   │   │   └── investments/
│   │   │   │   │       ├── page.tsx
│   │   │   │   │       └── [investmentId]/
│   │   │   │   │           └── page.tsx
│   │   │   │   │
│   │   │   │   └── analytics/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── OtpVerification.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   │
│   │   ├── wallet/
│   │   │   ├── WalletBalance.tsx
│   │   │   └── TransactionHistory.tsx
│   │   │
│   │   └── investments/
│   │       ├── InvestmentCard.tsx
│   │       └── InvestmentDetails.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useWallet.ts
│   │   ├── useInvestment.ts
│   │   └── useAdmin.ts
│   │
│   ├── providers/
│   │   ├── AuthProvider.tsx
│   │   └── ThemeProvider.tsx
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── services/
│   │   │   │   ├── loginService.ts
│   │   │   │   ├── registerService.ts
│   │   │   │   └── otpService.ts
│   │   │   │
│   │   │   └── validators/
│   │   │       ├── loginValidator.ts
│   │   │       └── registerValidator.ts
│   │   │
│   │   ├── user/
│   │   │   ├── services/
│   │   │   │   ├── walletService.ts
│   │   │   │   └── investmentService.ts
│   │   │   │
│   │   │   └── validators/
│   │   │       └── investmentValidator.ts
│   │   │
│   │   ├── admin/
│   │   │   ├── services/
│   │   │   │   ├── userManagementService.ts
│   │   │   │   └── transactionService.ts
│   │   │   │
│   │   │   └── validators/
│   │   │       └── adminActionValidator.ts
│   │   │
│   │   └── investments/
│   │       ├── services/
│   │       │   └── investmentCalculatorService.ts
│   │       │
│   │       └── utils/
│   │           └── interestCalculator.ts
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── axiosConfig.ts
│   │   │   └── apiClient.ts
│   │   │
│   │   └── middleware/
│   │       ├── authMiddleware.ts
│   │       └── errorHandler.ts
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   ├── theme.ts
│   │   └── variables.css
│   │
│   ├── types/
│   │   ├── user.ts
│   │   ├── wallet.ts
│   │   ├── investment.ts
│   │   └── transaction.ts
│   │
│   └── utils/
│       ├── formatters/
│       │   ├── currencyFormatter.ts
│       │   └── dateFormatter.ts
│       │
│       ├── validators/
│       │   └── commonValidators.ts
│       │
│       └── helpers/
│           └── storageHelper.ts
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── public/
│   ├── images/
│   └── icons/
│
├── config/
│   ├── next.config.js
│   ├── tsconfig.json
│   └── eslintrc.js
│
├── scripts/
│   ├── setup.sh
│   └── deploy.sh
│
├── .env
├── .env.example
├── package.json
├── README.md
└── LICENSE
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Backend API running

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/neptune-investment-frontend.git

# Navigate to project directory
cd neptune-investment-frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start development server
npm run dev
```

## 🔐 Authentication Flow

### User Registration

1. User fills registration form
2. Submit email/phone
3. OTP verification
4. Optional KYC document upload

```typescript
// Example registration interface
interface RegistrationData {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  otpPreference: "email" | "sms";
}
```

### Login Process

1. Enter credentials
2. Validate credentials
3. Receive JWT tokens
4. Access protected routes

## 💰 Investment Process

### Deposit Workflow

1. Copy admin USDT address
2. Send USDT transaction
3. Submit transaction hash
4. Admin verifies transaction
5. Funds credited to account wallet

### Investment Steps

1. Transfer funds to trading wallet
2. Start investment (min $10)
3. Earn 0.25% daily compound interest
4. Withdraw profits after 7 days
5. Withdraw principal after 30 days

## 🖥️ Pages and Components

### Authentication Pages

- Login
- Register
- OTP Verification
- KYC Upload

### User Dashboard

- Wallet Overview
- Deposit Funds
- Start Investment
- Investment History
- Referral Program

### Admin Dashboard

- Transaction Monitoring
- User Management
- Withdrawal Approvals
- Investment Analytics

## 🔗 API Integration

### Key API Endpoints

- `/api/auth/login`
- `/api/deposit/submit`
- `/api/investment/start`
- `/api/withdraw/request`

```typescript
// Example API call hook
function useDeposit() {
  const submitDeposit = async (transactionHash: string) => {
    try {
      const response = await axios.post("/api/deposit/submit", {
        transactionHash,
      });
      return response.data;
    } catch (error) {
      // Handle error
    }
  };

  return { submitDeposit };
}
```

## 🛡️ Security Considerations

- JWT Token Management
- Protected Routes
- Input Validation
- Rate Limiting
- Secure Storage of Credentials

## 🚢 Deployment

### Recommended Platforms

- Vercel
- Netlify
- AWS Amplify

### Deployment Steps

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit changes
4. Push to the branch
5. Create Pull Request

## 📄 License

MIT License

## 📞 Support

For support, contact:

- Email: support@neptuneinvestments.com
- Discord: [Support Channel]


## 🎯 Homepage Design & Features

### Hero Section Components
- Dynamic Trading View Widget Integration
- Real-time Market Data Display
- Interactive Investment Calculator
- Animated Feature Showcases

### Performance Optimization Algorithms
1. **Lazy Loading Algorithm**
   ```typescript
   // Benefits: Improved initial load time, reduced bandwidth
   // Complexity: O(n) where n is number of components
   const lazyLoadComponent = {
     threshold: 0.5,
     rootMargin: '50px',
     triggerOnce: true
   }
   ```

2. **Real-time Data Processing**
   ```typescript
   // Benefits: Efficient updates, minimal re-renders
   // Complexity: O(log n) for price updates
   const priceUpdateAlgorithm = {
     debounceTime: 500,
     batchSize: 10
   }
   ```

3. **Compound Interest Calculator**
   ```typescript
   // Benefits: Accurate investment projections
   // Complexity: O(1) for single calculations
   const compoundInterestParams = {
     dailyRate: 0.0025,
     minimumInvestment: 10,
     lockPeriod: 30
   }
   ```

### Data Structure Implementations

1. **User Portfolio Management**
```typescript
interface Portfolio {
  wallets: {
    account: WalletState,
    trading: WalletState,
    referral: WalletState
  },
  investments: Investment[],
  transactions: Transaction[]
}
// Benefit: O(1) access to wallet states
```

2. **Transaction History**
```typescript
type TransactionTree = {
  timestamp: number,
  type: 'deposit' | 'withdrawal' | 'investment',
  amount: number,
  children: TransactionTree[]
}
// Benefit: O(log n) search for transaction history
```

### Performance Optimizations

1. **Caching Strategy**
- Implementation: LRU Cache for API responses
- Benefit: O(1) access time for frequent data
- Use Case: Trading view data, wallet balances

2. **State Management**
- Implementation: Redux with selective updates
- Benefit: O(1) state access, minimal re-renders
- Use Case: Real-time price updates

### UI/UX Algorithms

1. **Dynamic Layout Algorithm**
```typescript
interface LayoutConfig {
  breakpoints: number[],
  columns: number[],
  spacing: number[]
}
// Benefit: Responsive design with O(1) calculation
```

2. **Animation Performance**
```typescript
interface AnimationConfig {
  threshold: number,
  rootMargin: string,
  triggerOnce: boolean
}
// Benefit: Optimized animation triggers
```

### Security Implementations

1. **Rate Limiting**
```typescript
interface RateLimitConfig {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}
// Benefit: O(1) request validation
```

2. **JWT Validation**
```typescript
interface JWTConfig {
  expiresIn: '15m',
  refreshIn: '7d',
  algorithm: 'HS256'
}
// Benefit: Secure authentication with minimal overhead
```

### Footer Organization

1. **Company Information**
   - About Neptune
   - Mission & Vision
   - Team
   - Careers

2. **Legal Documentation**
   - Terms of Service
   - Privacy Policy
   - KYC Policy
   - Risk Disclosure

3. **Support Resources**
   - Help Center
   - FAQ
   - Contact
   - Support Tickets

4. **Community Links**
   - Social Media
   - Blog
   - Newsletter
   - Community Forum

### Benefits of Implementation

1. **Performance**
   - Optimized initial load time
   - Efficient real-time updates
   - Smooth animations
   - Responsive design

2. **Security**
   - Protected routes
   - Secure data transmission
   - Rate limiting
   - Input validation

3. **User Experience**
   - Intuitive navigation
   - Real-time feedback
   - Interactive elements
   - Mobile responsiveness

4. **Maintainability**
   - Modular code structure
   - Clear documentation
   - Type safety
   - Testing coverage

### Technical Stack Benefits

1. **Next.js**
   - Server-side rendering
   - Optimized routing
   - Built-in optimization

2. **TypeScript**
   - Type safety
   - Better IDE support
   - Reduced runtime errors

3. **TradingView Integration**
   - Professional charts
   - Real-time data
   - Technical indicators

4. **State Management**
   - Predictable state updates
   - Developer tools
   - Performance optimization
---
# Restructured Frontend Architecture

## Core Structure

```
src/
├── app/
│   ├── (auth)/                       # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   │
│   └── (dashboard)/                  # Protected dashboard routes
│       ├── layout.tsx                # Main dashboard layout
│       │
│       ├── overview/                 # Dashboard home
│       │   └── page.tsx
│       │
│       ├── deposits/                 # Deposit management
│       │   ├── page.tsx
│       │   ├── [depositId]/
│       │   │   └── page.tsx
│       │   └── new/
│       │       └── page.tsx
│       │
│       ├── withdrawals/              # Withdrawal management
│       │   ├── page.tsx
│       │   ├── [withdrawalId]/
│       │   │   └── page.tsx
│       │   └── new/
│       │       └── page.tsx
│       │
│       ├── investments/              # Investment management
│       │   ├── page.tsx
│       │   ├── [investmentId]/
│       │   │   └── page.tsx
│       │   └── new/
│       │       └── page.tsx
│       │
│       ├── transfers/                # Internal transfers
│       │   ├── page.tsx
│       │   ├── [transferId]/
│       │   │   └── page.tsx
│       │   └── new/
│       │       └── page.tsx
│       │
│       ├── transactions/             # All transactions view
│       │   ├── page.tsx
│       │   └── [transactionId]/
│       │       └── page.tsx
│       │
│       └── referrals/                # Referral system
│           ├── page.tsx
│           └── [referralId]/
│               └── page.tsx

├── features/                         # Feature-based modules
│   ├── deposits/
│   │   ├── components/
│   │   │   ├── DepositAddressCard.tsx
│   │   │   ├── DepositForm.tsx
│   │   │   ├── DepositHistoryTable.tsx
│   │   │   ├── DepositStatusBadge.tsx
│   │   │   └── TransactionHashForm.tsx
│   │   ├── hooks/
│   │   │   ├── useDepositAddress.ts
│   │   │   ├── useDepositHistory.ts
│   │   │   └── useSubmitDeposit.ts
│   │   ├── services/
│   │   │   └── deposit.service.ts
│   │   ├── types/
│   │   │   └── deposit.types.ts
│   │   └── utils/
│   │       └── deposit.utils.ts
│   │
│   ├── withdrawals/
│   │   ├── components/
│   │   │   ├── WithdrawalForm.tsx
│   │   │   ├── WithdrawalHistoryTable.tsx
│   │   │   ├── WithdrawalStatusBadge.tsx
│   │   │   ├── AdminApprovalStatus.tsx
│   │   │   └── WithdrawalTimer.tsx
│   │   ├── hooks/
│   │   │   ├── useWithdrawalHistory.ts
│   │   │   ├── useWithdrawalRequest.ts
│   │   │   └── useWithdrawalStatus.ts
│   │   ├── services/
│   │   │   └── withdrawal.service.ts
│   │   ├── types/
│   │   │   └── withdrawal.types.ts
│   │   └── utils/
│   │       └── withdrawal.utils.ts
│   │
│   ├── investments/
│   │   ├── components/
│   │   │   ├── InvestmentCard.tsx
│   │   │   ├── InvestmentForm.tsx
│   │   │   ├── InvestmentHistoryTable.tsx
│   │   │   ├── CompoundInterestCalculator.tsx
│   │   │   ├── ProfitChart.tsx
│   │   │   └── InvestmentStatusBadge.tsx
│   │   ├── hooks/
│   │   │   ├── useInvestmentHistory.ts
│   │   │   ├── useStartInvestment.ts
│   │   │   └── useInvestmentProfits.ts
│   │   ├── services/
│   │   │   └── investment.service.ts
│   │   ├── types/
│   │   │   └── investment.types.ts
│   │   └── utils/
│   │       └── investment.utils.ts
│   │
│   ├── transfers/
│   │   ├── components/
│   │   │   ├── TransferForm.tsx
│   │   │   ├── TransferHistoryTable.tsx
│   │   │   ├── WalletBalanceCards.tsx
│   │   │   └── TransferConfirmation.tsx
│   │   ├── hooks/
│   │   │   ├── useWalletBalances.ts
│   │   │   ├── useTransferFunds.ts
│   │   │   └── useTransferHistory.ts
│   │   ├── services/
│   │   │   └── transfer.service.ts
│   │   ├── types/
│   │   │   └── transfer.types.ts
│   │   └── utils/
│   │       └── transfer.utils.ts
│   │
│   ├── transactions/
│   │   ├── components/
│   │   │   ├── TransactionList.tsx
│   │   │   ├── TransactionFilters.tsx
│   │   │   ├── TransactionDetailCard.tsx
│   │   │   ├── TransactionTimeline.tsx
│   │   │   └── TransactionSearch.tsx
│   │   ├── hooks/
│   │   │   ├── useTransactionHistory.ts
│   │   │   ├── useTransactionById.ts
│   │   │   └── useTransactionFilters.ts
│   │   ├── services/
│   │   │   └── transaction.service.ts
│   │   ├── types/
│   │   │   └── transaction.types.ts
│   │   └── utils/
│   │       └── transaction.utils.ts
│   │
│   ├── referrals/
│   │   ├── components/
│   │   │   ├── ReferralStats.tsx
│   │   │   ├── ReferralLink.tsx
│   │   │   ├── ReferralHistoryTable.tsx
│   │   │   └── ReferralWithdrawForm.tsx
│   │   ├── hooks/
│   │   │   ├── useReferralCode.ts
│   │   │   ├── useReferralEarnings.ts
│   │   │   └── useReferralWithdraw.ts
│   │   ├── services/
│   │   │   └── referral.service.ts
│   │   ├── types/
│   │   │   └── referral.types.ts
│   │   └── utils/
│   │       └── referral.utils.ts
│   │
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── AuthGuard.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useSession.ts
│   │   ├── services/
│   │   │   └── auth.service.ts
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   └── utils/
│   │       └── auth.utils.ts
│   │
│   └── dashboard/
│       ├── components/
│       │   ├── DashboardHeader.tsx
│       │   ├── DashboardSidebar.tsx
│       │   ├── InvestmentOverview.tsx
│       │   ├── WalletSummary.tsx
│       │   └── RecentActivity.tsx
│       ├── hooks/
│       │   ├── useDashboardData.ts
│       │   └── useUserStats.ts
│       ├── services/
│       │   └── dashboard.service.ts
│       └── types/
│           └── dashboard.types.ts

├── shared/                           # Shared components & utilities
│   ├── components/
│   │   ├── ui/                       # Basic UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Loading.tsx
│   │   │
│   │   ├── forms/                    # Form components
│   │   │   ├── FormField.tsx
│   │   │   ├── FormError.tsx
│   │   │   └── FormSuccess.tsx
│   │   │
│   │   ├── data/                     # Data display components
│   │   │   ├── DataTable.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── AmountDisplay.tsx
│   │   │   └── DateDisplay.tsx
│   │   │
│   │   └── layout/                   # Layout components
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       ├── Footer.tsx
│   │       └── Container.tsx
│   │
│   ├── hooks/                        # Shared hooks
│   │   ├── useApi.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useDebounce.ts
│   │   └── usePermissions.ts
│   │
│   ├── services/                     # Core services
│   │   ├── api.service.ts
│   │   ├── storage.service.ts
│   │   └── notification.service.ts
│   │
│   ├── utils/                        # Utility functions
│   │   ├── format.utils.ts
│   │   ├── validation.utils.ts
│   │   ├── crypto.utils.ts
│   │   └── date.utils.ts
│   │
│   └── types/                        # Shared types
│       ├── api.types.ts
│       ├── common.types.ts
│       └── user.types.ts

├── lib/                              # Core libraries & configs
│   ├── api/
│   │   ├── client.ts                 # API client configuration
│   │   ├── endpoints.ts              # API endpoints
│   │   └── interceptors.ts           # Request/response interceptors
│   │
│   ├── validation/
│   │   ├── schemas.ts                # Validation schemas
│   │   └── rules.ts                  # Validation rules
│   │
│   └── constants/
│       ├── routes.ts                 # Route constants
│       ├── api.ts                    # API constants
│       └── app.ts                    # App constants

├── store/                            # State management
│   ├── slices/
│   │   ├── authSlice.ts
│   │   ├── walletSlice.ts
│   │   ├── investmentSlice.ts
│   │   └── transactionSlice.ts
│   │
│   ├── providers/
│   │   ├── AuthProvider.tsx
│   │   ├── WalletProvider.tsx
│   │   └── NotificationProvider.tsx
│   │
│   └── index.ts                      # Store configuration

└── styles/                           # Styling
    ├── globals.css
    ├── components.css
    └── utilities.css
```


Key Improvements

Feature-Based Organization - Each transaction type (deposits, withdrawals, investments, transfers) is self-contained with its own components, hooks, services, and types.
Clear Separation of Concerns - Business logic in services, UI logic in components, state management in hooks.
Reusable Shared Components - Common UI elements, utilities, and types are centralized.
Scalable Structure - Easy to add new transaction types or features without affecting existing code.
Type Safety - Each feature has its own type definitions while sharing common types.

Transaction ID Handling
Each feature can fetch transactions by ID through:

Dedicated hooks (useTransactionById, useDepositById, etc.)
Unified service layer that handles all transaction types
Consistent routing (/transactions/[id], /deposits/[id], etc.)

The structure is definitely worthy and manageable - it promo  tes maintainability, testability, and follows modern React/Next.js best practices while supporting your complex investment platform requirements.

## Key Benefits of This Structure

### 1. **Single Responsibility Principle (SRP)**
- Each feature module handles only its specific domain
- Components have single, focused purposes
- Services are separated by functionality

### 2. **Open/Closed Principle (OCP)**
- Easy to extend features without modifying existing code
- Plugin-like architecture for new transaction types
- Extensible component system

### 3. **Liskov Substitution Principle (LSP)**
- Consistent interfaces across similar components
- Interchangeable service implementations
- Standardized hook patterns

### 4. **Interface Segregation Principle (ISP)**
- Focused, specific interfaces for each domain
- No unnecessary dependencies
- Granular hook compositions

### 5. **Dependency Inversion Principle (DIP)**
- Services depend on abstractions, not concrete implementations
- Easily mockable for testing
- Configurable API endpoints

## Feature-Specific Transaction Handling

Each transaction type (deposits, withdrawals, transfers) has:
- **Dedicated components** for UI concerns
- **Specific hooks** for state management
- **Isolated services** for API interactions
- **Typed interfaces** for data contracts
- **Utility functions** for business logic

## Getting Transaction by ID

```typescript
// In any transaction feature
const { transaction, loading, error } = useTransactionById(transactionId);

// Centralized transaction service handles all types
const transaction = await transactionService.getById(id);
```

This structure provides excellent separation of concerns, maintainability, and scalability for your investment platform.


//users folder structure 
# Simplified User-Focused Structure

```
src/
├── app/(Admin)/
          |
          |__[userId]


│   └── (users)/
│       └── [userId]/                 # Dynamic user routes
│           ├── layout.tsx            # User dashboard layout
│           │
│           ├── page.tsx              # User dashboard home
│           │
│           ├── deposits/             # User deposits
│           │   ├── page.tsx          # Deposits list
│           │   ├── [depositId]/
│           │   │   └── page.tsx      # Single deposit view
│           │   └── new/
│           │       └── page.tsx      # Create new deposit
│           │
│           ├── withdrawals/          # User withdrawals
│           │   ├── page.tsx          # Withdrawals list
│           │   ├── [withdrawalId]/
│           │   │   └── page.tsx      # Single withdrawal view
│           │   └── new/
│           │       └── page.tsx      # Create withdrawal request
│           │
│           ├── investments/          # User investments
│           │   ├── page.tsx          # Investments list
│           │   ├── [investmentId]/
│           │   │   └── page.tsx      # Single investment view
│           │   └── new/
│           │       └── page.tsx      # Start new investment
│           │
│           │
│           │  
│           │
│           └── referrals/            # Referral management
│              
├── components/
│   └── users/                        # User-specific components
│       ├── layout/
│       │  
│       │
│       ├── dashboard/
│       │
│       ├── deposits/
│       │   
│       │
│       ├── withdrawals/
│       │  
│       │
│       ├── investments/
│       │   
│       │
│       ├── transfers/
│       │  
│       ├── transactions/
│       │   
│       ├── referrals/
│       │  
│       │
│       └── shared/
│           

├── hooks/
│   └── users/
│  

├── services/
│   └── users/
│     

├── types/
│   └── users/
│      

├── utils/
│   └── users/
│    

└── lib/
    └── users/
      
```

## Key Features of This Structure

### 1. **User-Centric Routing**
- All user activities under `(users)/[userId]`
- Clean URLs: `/users/123/deposits`, `/users/123/investments/456`
- Dynamic routing for user-specific content

### 2. **Activity-Based Organization**
- Each user activity (deposits, withdrawals, etc.) has its own folder
- Consistent structure across all activities
- Easy to add new user activities

### 3. **Component Organization**
- Components grouped by user activities
- Shared components for common UI elements
- Reusable across different user pages

### 4. **Hooks for State Management**
- Dedicated hooks for each user activity
- Centralized user data management
- Easy to test and maintain

### 5. **API Service Layer**
- Separate API services for each activity
- Clean separation of concerns
- Easy to mock for testing

### 6. **Type Safety**
- TypeScript types for each activity
- Consistent data structures
- Better developer experience

## Example Usage

```typescript
// In a user deposit page
const { deposits, loading, error } = useUserDeposits(userId);
const { submitDeposit } = useUserDeposits(userId);

// In a transaction detail page
const { transaction } = useTransactionById(transactionId);

// URL structure
/users/user123/deposits           // All deposits
/users/user123/deposits/dep456    // Specific deposit
/users/user123/transactions       // All transactions
/users/user123/transactions/tx789 // Specific transaction
```

This structure is clean, maintainable, and focused specifically on user activities while following Next.js 13+ app router conventions.

**Happy Investing with Neptune! 🚀💰**
