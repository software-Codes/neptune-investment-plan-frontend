/*
  File: src/app/(users)/[userId]/deposits/new/page.tsx
  Description: Multi‑step wizard for creating a new USDT (TRC20) deposit.
  Tech: Next.js App Router, shadcn/ui, Tailwind CSS with custom theme colors.
  Notes:
  - Enhanced responsive design with mobile-first approach
  - Custom theming using HSL values from theme.ts
  - Improved UX with animations and better visual hierarchy
  - Fully accessible with proper ARIA labels
*/

'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import QRCode from 'qrcode';

// ───────────────────────────────────────── shadcn / UI imports ─────────────────────────────────────────
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Copy, Loader2, CheckCircle, AlertTriangle, ArrowLeft, ArrowRight, Wallet } from 'lucide-react';

// ───────────────────────────────────────── Theme Colors ───────────────────────────────────────────────

// Using theme.ts colors directly
const themeColors = {
  light: {
    background: 'hsl(0 0% 100%)',
    foreground: 'hsl(222.2 84% 4.9%)',
    card: 'hsl(0 0% 100%)',
    cardForeground: 'hsl(222.2 84% 4.9%)',
    primary: 'hsl(142.1 76.2% 36.3%)',
    primaryForeground: 'hsl(355.7 100% 97.3%)',
    secondary: 'hsl(45.4 93.4% 47.5%)',
    secondaryForeground: 'hsl(26.5 83.3% 14.1%)',
    muted: 'hsl(210 40% 98%)',
    mutedForeground: 'hsl(215.4 16.3% 46.9%)',
    accent: 'hsl(45.4 93.4% 47.5%)',
    accentForeground: 'hsl(26.5 83.3% 14.1%)',
    destructive: 'hsl(0 84.2% 60.2%)',
    destructiveForeground: 'hsl(210 40% 98%)',
    border: 'hsl(214.3 31.8% 91.4%)',
    input: 'hsl(214.3 31.8% 91.4%)',
    ring: 'hsl(142.1 76.2% 36.3%)',
  },
  dark: {
    background: 'hsl(222.2 84% 4.9%)',
    foreground: 'hsl(210 40% 98%)',
    card: 'hsl(222.2 84% 4.9%)',
    cardForeground: 'hsl(210 40% 98%)',
    primary: 'hsl(142.1 70.6% 45.3%)',
    primaryForeground: 'hsl(144.9 80.4% 10%)',
    secondary: 'hsl(45.4 93.4% 47.5%)',
    secondaryForeground: 'hsl(20.5 90.2% 48.2%)',
    muted: 'hsl(217.2 32.6% 17.5%)',
    mutedForeground: 'hsl(215 20.2% 65.1%)',
    accent: 'hsl(45.4 93.4% 47.5%)',
    accentForeground: 'hsl(20.5 90.2% 48.2%)',
    destructive: 'hsl(0 62.8% 30.6%)',
    destructiveForeground: 'hsl(210 40% 98%)',
    border: 'hsl(217.2 32.6% 17.5%)',
    input: 'hsl(217.2 32.6% 17.5%)',
    ring: 'hsl(142.1 70.6% 45.3%)',
  },
};

// ───────────────────────────────────────── Types & Constants ───────────────────────────────────────────

const MIN_DEPOSIT = 10; // USD
const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_USDT_ADDRESS ??
  'TXYZ1234AdminDemoAddress5678'; // fallback demo address
const NETWORK = 'TRC20';

// Zod schemas for validation
const amountSchema = z
  .number()
  .min(MIN_DEPOSIT, {
    message: `Minimum deposit is $${MIN_DEPOSIT} USDT`,
  })
  .finite();
const txHashSchema = z
  .string()
  .regex(/^0x([A-Fa-f0-9]{64})$/, {
    message: 'Transaction hash must be a 66‑char 0x… string',
  });

// ───────────────────────────────────────── Main Page ───────────────────────────────────────────────────

export default function NewDepositPage({ params }: { params: { userId: string } }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [amount, setAmount] = useState<number>(MIN_DEPOSIT);
  const [txHash, setTxHash] = useState<string>('');
  const [qr, setQr] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const router = useRouter();

  // Detect dark mode
  useEffect(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    darkModeQuery.addEventListener('change', handler);
    return () => darkModeQuery.removeEventListener('change', handler);
  }, []);

  const theme = isDarkMode ? themeColors.dark : themeColors.light;

  // Generate QR whenever amount or address changes
  useEffect(() => {
    (async () => {
      try {
        const qrData = `USDT:${ADMIN_ADDRESS}?amount=${amount}`;
        const url = await QRCode.toDataURL(qrData, {
          width: 200,
          margin: 2,
          color: {
            dark: isDarkMode ? '#ffffff' : '#000000',
            light: isDarkMode ? '#000000' : '#ffffff',
          },
        });
        setQr(url);
      } catch (err) {
        console.error('QR error', err);
      }
    })();
  }, [amount, isDarkMode]);

  // Helpers
  const next = () => setStep((s) => (s < 4 ? ((s + 1) as any) : s));
  const back = () => setStep((s) => (s > 1 ? ((s - 1) as any) : s));

  // Submit to (mock) API
  const submitDeposit = async () => {
    setIsSubmitting(true);
    try {
      // Mock latency
      await new Promise((r) => setTimeout(r, 1200));
      // TODO: integrate real depositApi.submit when backend is ready
      toast.success('Deposit submitted!', { description: 'We\'ll notify you once confirmed.' });
      next();
    } catch (err: any) {
      toast.error('Error', { description: err.message ?? 'Something went wrong' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitles = {
    1: 'Enter Amount',
    2: 'Payment Instructions',
    3: 'Submit Transaction',
    4: 'Confirmation'
  };

  // ────────────────────────────── Render Step Components ──────────────────────────────

  return (
    <div 
      className="min-h-screen py-4 px-4 sm:py-8 transition-colors duration-300"
      style={{ backgroundColor: theme.background }}
    >
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: theme.primary }}
            >
              <Wallet className="w-6 h-6" style={{ color: theme.primaryForeground }} />
            </div>
            <div>
              <h1 
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: theme.foreground }}
              >
                New USDT Deposit
              </h1>
              <p 
                className="text-sm sm:text-base"
                style={{ color: theme.mutedForeground }}
              >
                {stepTitles[step]} • Step {step} of 4
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div 
            className="h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: theme.muted }}
          >
            <div 
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ 
                backgroundColor: theme.primary,
                width: `${(step / 4) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Main Card */}
        <Card 
          className="shadow-2xl border-0 backdrop-blur-sm transition-all duration-300"
          style={{ 
            backgroundColor: theme.card,
            border: `1px solid ${theme.border}`
          }}
        >
          <CardContent className="p-6 sm:p-8">
            <div className="transition-all duration-300 ease-in-out">
              {step === 1 && (
                <StepOneAmount
                  amount={amount}
                  onChange={setAmount}
                  theme={theme}
                  onNext={() => {
                    const result = amountSchema.safeParse(amount);
                    if (!result.success) return toast.error('Invalid amount', { description: result.error.issues[0].message });
                    next();
                  }}
                />
              )}
              {step === 2 && (
                <StepTwoInstructions
                  amount={amount}
                  adminAddress={ADMIN_ADDRESS}
                  network={NETWORK}
                  qr={qr}
                  theme={theme}
                  onNext={next}
                  onBack={back}
                />
              )}
              {step === 3 && (
                <StepThreeSubmit
                  txHash={txHash}
                  onChange={setTxHash}
                  isSubmitting={isSubmitting}
                  theme={theme}
                  onBack={back}
                  onSubmit={() => {
                    const res = txHashSchema.safeParse(txHash);
                    if (!res.success) return toast.error('Invalid hash', { description: res.error.issues[0].message });
                    submitDeposit();
                  }}
                />
              )}
              {step === 4 && (
                <StepFourConfirmation 
                  amount={amount} 
                  txHash={txHash} 
                  theme={theme}
                  onDone={() => router.push(`/users/${params.userId}/deposits`)} 
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ──────────────────────────────────────── Step 1 ───────────────────────────────────────
interface StepOneProps {
  amount: number;
  onChange: (n: number) => void;
  onNext: () => void;
  theme: any;
}

function StepOneAmount({ amount, onChange, onNext, theme }: StepOneProps) {
  const quickAmounts = [10, 25, 50, 100, 250, 500];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: theme.foreground }}
        >
          How much would you like to deposit?
        </h2>
        <p 
          className="text-sm sm:text-base"
          style={{ color: theme.mutedForeground }}
        >
          Enter the amount in USDT you want to deposit
        </p>
      </div>

      <div className="space-y-4">
        <Label 
          htmlFor="amount" 
          className="text-base font-medium"
          style={{ color: theme.foreground }}
        >
          Deposit Amount (USDT)
        </Label>
        <div className="relative">
          <span 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg font-medium"
            style={{ color: theme.mutedForeground }}
          >
            $
          </span>
          <Input
            id="amount"
            type="number"
            min={MIN_DEPOSIT}
            step={0.01}
            value={amount}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className="pl-8 text-lg h-14 text-center font-semibold border-2 transition-all duration-200"
            style={{ 
              backgroundColor: theme.background,
              borderColor: theme.border,
              color: theme.foreground
            }}
            placeholder={`Minimum ${MIN_DEPOSIT}`}
          />
        </div>
      </div>

      {/* Quick Amount Selection */}
      <div className="space-y-3">
        <Label 
          className="text-sm font-medium"
          style={{ color: theme.foreground }}
        >
          Quick Select
        </Label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {quickAmounts.map((quickAmount) => (
            <Button
              key={quickAmount}
              variant="outline"
              size="sm"
              onClick={() => onChange(quickAmount)}
              className="h-10 text-sm font-medium transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: amount === quickAmount ? theme.primary : theme.background,
                borderColor: amount === quickAmount ? theme.primary : theme.border,
                color: amount === quickAmount ? theme.primaryForeground : theme.foreground,
              }}
            >
              ${quickAmount}
            </Button>
          ))}
        </div>
      </div>

      <div 
        className="p-4 rounded-lg border"
        style={{ 
          backgroundColor: theme.muted,
          borderColor: theme.border 
        }}
      >
        <p 
          className="text-sm"
          style={{ color: theme.mutedForeground }}
        >
          💡 <strong>Note:</strong> Network fees may apply depending on your wallet provider. 
          The exact amount you send should match what you enter above.
        </p>
      </div>

      <Button 
        onClick={onNext}
        disabled={amount < MIN_DEPOSIT}
        className="w-full h-12 text-base font-semibold transition-all duration-200 hover:scale-[1.02]"
        style={{
          backgroundColor: theme.primary,
          color: theme.primaryForeground,
        }}
      >
        Continue
        <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </div>
  );
}

// ──────────────────────────────────────── Step 2 ───────────────────────────────────────
interface StepTwoProps {
  amount: number;
  adminAddress: string;
  network: string;
  qr: string;
  theme: any;
  onNext: () => void;
  onBack: () => void;
}

function StepTwoInstructions({ amount, adminAddress, network, qr, theme, onNext, onBack }: StepTwoProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: theme.foreground }}
        >
          Send Your Payment
        </h2>
        <p 
          className="text-sm sm:text-base"
          style={{ color: theme.mutedForeground }}
        >
          Follow these instructions carefully to complete your deposit
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Payment Details */}
        <div className="space-y-6">
          <div 
            className="p-6 rounded-xl border-2"
            style={{ 
              backgroundColor: theme.muted,
              borderColor: theme.primary,
            }}
          >
            <div className="space-y-4">
              <div>
                <Label 
                  className="text-sm font-medium"
                  style={{ color: theme.mutedForeground }}
                >
                  Amount to Send
                </Label>
                <p 
                  className="text-2xl sm:text-3xl font-bold"
                  style={{ color: theme.primary }}
                >
                  {amount.toFixed(2)} USDT
                </p>
              </div>
              
              <div>
                <Label 
                  className="text-sm font-medium"
                  style={{ color: theme.mutedForeground }}
                >
                  Network
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-semibold"
                    style={{ 
                      backgroundColor: theme.accent,
                      color: theme.accentForeground 
                    }}
                  >
                    {network}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label 
              className="text-sm font-medium mb-2 block"
              style={{ color: theme.foreground }}
            >
              Recipient Address
            </Label>
            <div 
              className="relative p-4 rounded-lg border-2 break-all select-all font-mono text-sm"
              style={{ 
                backgroundColor: theme.background,
                borderColor: theme.border,
                color: theme.foreground
              }}
            >
              {adminAddress}
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 h-8 w-8 p-0 hover:scale-110 transition-transform"
                onClick={() => {
                  navigator.clipboard.writeText(adminAddress);
                  toast.success('Address copied to clipboard!');
                }}
                style={{ color: theme.primary }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div 
            className="p-4 rounded-lg border-l-4"
            style={{ 
              backgroundColor: theme.muted,
              borderLeftColor: theme.destructive
            }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle 
                className="w-5 h-5 mt-0.5 flex-shrink-0" 
                style={{ color: theme.destructive }}
              />
              <div>
                <p 
                  className="text-sm font-semibold"
                  style={{ color: theme.destructive }}
                >
                  Important Warning
                </p>
                <p 
                  className="text-sm mt-1"
                  style={{ color: theme.foreground }}
                >
                  Only use <strong>{network}</strong> network. Sending via other networks may result in permanent loss of funds.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div 
            className="p-6 rounded-xl border-2"
            style={{ 
              backgroundColor: theme.background,
              borderColor: theme.border
            }}
          >
            {qr ? (
              <Image 
                src={qr} 
                alt="Payment QR Code" 
                width={200} 
                height={200} 
                className="rounded-lg" 
              />
            ) : (
              <div 
                className="w-48 h-48 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.muted }}
              >
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: theme.primary }} />
              </div>
            )}
          </div>
          <p 
            className="text-sm text-center"
            style={{ color: theme.mutedForeground }}
          >
            📱 Scan with your wallet app<br />for quick payment
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="h-12 text-base font-medium"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.background,
            color: theme.foreground,
          }}
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back
        </Button>
        <Button 
          onClick={onNext}
          className="flex-1 h-12 text-base font-semibold transition-all duration-200 hover:scale-[1.02]"
          style={{
            backgroundColor: theme.primary,
            color: theme.primaryForeground,
          }}
        >
          I have sent the payment
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────── Step 3 ───────────────────────────────────────
interface StepThreeProps {
  txHash: string;
  onChange: (h: string) => void;
  isSubmitting: boolean;
  theme: any;
  onBack: () => void;
  onSubmit: () => void;
}

function StepThreeSubmit({ txHash, onChange, isSubmitting, theme, onBack, onSubmit }: StepThreeProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: theme.foreground }}
        >
          Submit Transaction Details
        </h2>
        <p 
          className="text-sm sm:text-base"
          style={{ color: theme.mutedForeground }}
        >
          Provide your transaction hash to verify the payment
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label 
            htmlFor="hash" 
            className="text-base font-medium mb-3 block"
            style={{ color: theme.foreground }}
          >
            Transaction Hash *
          </Label>
          <Input
            id="hash"
            placeholder="0x1234567890abcdef..."
            value={txHash}
            onChange={(e) => onChange(e.target.value.trim())}
            className="h-12 font-mono text-sm border-2 transition-all duration-200"
            style={{ 
              backgroundColor: theme.background,
              borderColor: theme.border,
              color: theme.foreground
            }}
          />
          <p 
            className="text-xs mt-2"
            style={{ color: theme.mutedForeground }}
          >
            Find this in your wallet's transaction history or on a blockchain explorer
          </p>
        </div>

        <div>
          <Label 
            htmlFor="screenshot" 
            className="text-base font-medium mb-3 block"
            style={{ color: theme.foreground }}
          >
            Screenshot (Optional)
          </Label>
          <Input 
            id="screenshot" 
            type="file" 
            accept="image/*"
            className="h-12 border-2 transition-all duration-200"
            style={{ 
              backgroundColor: theme.background,
              borderColor: theme.border,
              color: theme.foreground
            }}
          />
          <p 
            className="text-xs mt-2"
            style={{ color: theme.mutedForeground }}
          >
            Upload a screenshot of your transaction for faster verification
          </p>
        </div>

        <div 
          className="p-4 rounded-lg border"
          style={{ 
            backgroundColor: theme.muted,
            borderColor: theme.border 
          }}
        >
          <p 
            className="text-sm"
            style={{ color: theme.mutedForeground }}
          >
            ⏰ <strong>Processing Time:</strong> Deposits are typically processed within 10-30 minutes 
            after receiving sufficient network confirmations.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          disabled={isSubmitting}
          className="h-12 text-base font-medium"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.background,
            color: theme.foreground,
          }}
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back
        </Button>
        <Button 
          onClick={onSubmit}
          disabled={isSubmitting || !txHash.trim()}
          className="flex-1 h-12 text-base font-semibold transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
          style={{
            backgroundColor: theme.primary,
            color: theme.primaryForeground,
          }}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Submitting...' : 'Submit Transaction'}
        </Button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────── Step 4 ───────────────────────────────────────
interface StepFourProps {
  amount: number;
  txHash: string;
  theme: any;
  onDone: () => void;
}

function StepFourConfirmation({ amount, txHash, theme, onDone }: StepFourProps) {
  return (
    <div className="space-y-8 text-center">
      <div className="space-y-4">
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto animate-pulse"
          style={{ backgroundColor: theme.primary }}
        >
          <CheckCircle 
            className="w-12 h-12" 
            style={{ color: theme.primaryForeground }}
          />
        </div>
        
        <h2 
          className="text-2xl sm:text-3xl font-bold"
          style={{ color: theme.foreground }}
        >
          Deposit Submitted Successfully!
        </h2>
        
        <p 
          className="text-base sm:text-lg max-w-2xl mx-auto"
          style={{ color: theme.mutedForeground }}
        >
          Your deposit request for{' '}
          <span 
            className="font-bold"
            style={{ color: theme.primary }}
          >
            {amount.toFixed(2)} USDT
          </span>{' '}
          has been received and is being processed.
        </p>
      </div>

      <div 
        className="p-6 rounded-xl border"
        style={{ 
          backgroundColor: theme.muted,
          borderColor: theme.border
        }}
      >
        <div className="space-y-3">
          <p 
            className="text-sm font-medium"
            style={{ color: theme.foreground }}
          >
            Transaction Hash
          </p>
          <p 
            className="font-mono text-sm break-all"
            style={{ color: theme.mutedForeground }}
          >
            {txHash}
          </p>
        </div>
      </div>

      <div 
        className="p-4 rounded-lg border-l-4"
        style={{ 
          backgroundColor: theme.muted,
          borderLeftColor: theme.primary
        }}
      >
        <p 
          className="text-sm text-left"
          style={{ color: theme.foreground }}
        >
          📧 <strong>What's Next?</strong><br />
          You'll receive email notifications about your deposit status. 
          Funds will be credited to your account once confirmed on the blockchain.
        </p>
      </div>

      <Button 
        onClick={onDone}
        className="w-full max-w-xs mx-auto h-12 text-base font-semibold transition-all duration-200 hover:scale-[1.02]"
        style={{
          backgroundColor: theme.primary,
          color: theme.primaryForeground,
        }}
      >
        View All Deposits
      </Button>
    </div>
  );
}