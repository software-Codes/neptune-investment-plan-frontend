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
  otpPreference: 'email' | 'sms';
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
      const response = await axios.post('/api/deposit/submit', { 
        transactionHash 
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

---

**Happy Investing with Neptune! 🚀💰**
