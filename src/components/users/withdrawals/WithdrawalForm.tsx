// components/withdrawals/WithdrawalForm.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Wallet,
  DollarSign,
  Clock,
  Shield,
  AlertTriangle,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react';
import { WalletType } from '@/types/withdrawals/withdrawal.types';
import { NotificationService } from '@/app/(user)/[userId]/withdrawals/services/notifications.service';
import { useApiError, useFormState } from '@/app/(user)/[userId]/withdrawals/states/formState/form_state_management';
import { WithdrawalValidator } from '@/app/(user)/[userId]/withdrawals/services/form-validations/form.validations';
import { useWalletBalances } from '@/hooks/wallet/wallet.hooks';
import { useCreateWithdrawal } from '@/hooks/withrawal/withdrawal.hooks';
import { formatCurrency } from '@/app/(user)/[userId]/withdrawals/utils/shared.utilities';
import { SecurityUtils } from '@/app/(user)/[userId]/withdrawals/utils/security.utils';
import { toast } from 'sonner';



const MINIMUM_WITHDRAWAL = 0;
const MAXIMUM_WITHDRAWAL = 10000;
const ESTIMATED_PROCESSING_TIME = "10-20 minutes";

interface WithdrawalFormProps {
  onSuccess?: () => void;
  defaultWalletType?: WalletType;
}

// Define the form state type
interface WithdrawalFormType {
  wallet_type: WalletType;
  amount: number;
  receiving_address: string;
}

export function WithdrawalForm({ onSuccess, defaultWalletType = 'account' }: WithdrawalFormProps) {
  const [showAddress, setShowAddress] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const notificationService = NotificationService.getInstance();
  const validator = new WithdrawalValidator();
  const { error, handleError, clearError } = useApiError();

  const { data: walletsResponse, isLoading: walletsLoading } = useWalletBalances();
  const createWithdrawalMutation = useCreateWithdrawal();

  const { formData, errors, updateField } = useFormState<WithdrawalFormType>(
    {
      wallet_type: defaultWalletType,
      amount: 0,
      receiving_address: ''
    },
    (data) => {
      const allErrors: string[] = [];
      Object.keys(data).forEach(key => {
        const fieldErrors = validator.validate(key as keyof WithdrawalFormType, data[key as keyof WithdrawalFormType]);
        allErrors.push(...fieldErrors);
      });
      return allErrors;
    }
  );

  const wallets = walletsResponse || [];
  const selectedWallet = wallets.find(w => w.wallet_type === formData.wallet_type);
  const availableBalance = selectedWallet?.balance || 0;
  const lockedBalance = selectedWallet?.locked_balance || 0;
  const canProceed = availableBalance >= formData.amount && formData.amount >= MINIMUM_WITHDRAWAL;

  // Real-time validation
  useEffect(() => {
    clearError();
    if (formData.amount > 0 && formData.amount > availableBalance) {
      notificationService.insufficientBalance(formData.amount, availableBalance);
    }
  }, [formData.amount, availableBalance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (errors.length > 0) {
      notificationService.validationError(errors);
      return;
    }

    if (!canProceed) {
      notificationService.insufficientBalance(formData.amount, availableBalance);
      return;
    }

    setIsSubmitting(true);

    try {
      // Sanitize inputs before submission
      const sanitizedData = {
        ...formData,
        receiving_address: SecurityUtils.sanitizeInput(formData.receiving_address)
      };

      await createWithdrawalMutation.mutateAsync(sanitizedData);

      notificationService.withdrawalRequested(formData.amount, ESTIMATED_PROCESSING_TIME);

      // Reset form
      updateField('amount', 0);
      updateField('receiving_address', '');

      onSuccess?.();
    } catch (error: any) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyAddress = async () => {
    await navigator.clipboard.writeText(formData.receiving_address);
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2000);
    toast.success('Address copied to clipboard!', {
      duration: 2000,
      position: 'top-right',
      style: {
        background: '#f0f4f8',
        color: '#333',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '14px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }
    });
  clearError();
  updateField('receiving_address', formData.receiving_address.trim());
  };

  const getWalletTypeDisplay = (type: WalletType) => {
    const displays = {
      account: { label: 'Account Wallet', icon: '💳', color: 'bg-green-100 text-green-800' },
      trading: { label: 'Trading Wallet', icon: '📈', color: 'bg-blue-100 text-blue-800' },
      referral: { label: 'Referral Wallet', icon: '🎁', color: 'bg-purple-100 text-purple-800' }
    };
    return displays[type];
  };

  if (walletsLoading) {
    return (
      <Card className="w-full  mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
            <span className="text-gray-600">Loading wallet information...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-0 bg-white dark:bg-gray-900">
      <CardHeader className="bg-gradient-to-r from-green-500 rounded-md to-emerald-50 dark:from-gray-800 dark:to-gray-800 border-b">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Withdraw Funds
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Transfer your funds to your Binance wallet
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Security Notice */}
        <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <strong>Security Notice:</strong>             Processing time: {ESTIMATED_PROCESSING_TIME}. Only withdraw to addresses you control.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Wallet Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Wallet
            </Label>
            <Select
              value={formData.wallet_type}
              onValueChange={(value: WalletType) => updateField('wallet_type', value)}
            > 
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose wallet type" />
              </SelectTrigger>
              <SelectContent>
                {wallets
                  .filter((wallet: { wallet_type: WalletType }) => ['account', 'referral'].includes(wallet.wallet_type))
                  .map((wallet: { wallet_id: string; wallet_type: WalletType; balance: number }) => {
                    const display = getWalletTypeDisplay(wallet.wallet_type);
                    return (
                      <SelectItem key={wallet.wallet_id} value={wallet.wallet_type}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-2">
                            <span>{display.icon}</span>
                            <span>{display.label}</span>
                          </div>
                          <Badge variant="secondary" className={display.color}>
                            {formatCurrency(wallet.balance)}
                          </Badge>
                        </div>
                      </SelectItem>
                    );
                  })}
              </SelectContent>
            </Select>
          </div>

          {/* Balance Display */}
          {selectedWallet && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Available Balance
                </span>
                <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(availableBalance)}
                </span>
              </div>
              {lockedBalance > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Locked Balance</span>
                  <span className="text-yellow-600">{formatCurrency(lockedBalance)}</span>
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Minimum withdrawal: {formatCurrency(MINIMUM_WITHDRAWAL)}</span>
                <span>Maximum withdrawal: {formatCurrency(MAXIMUM_WITHDRAWAL)}</span>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-3">
            <Label htmlFor="amount" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Withdrawal Amount (USD)
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="amount"
                type="number"
                min={MINIMUM_WITHDRAWAL}
                max={Math.min(availableBalance, MAXIMUM_WITHDRAWAL)}
                step="0.01"
                value={formData.amount || ''}
                onChange={(e) => updateField('amount', parseFloat(e.target.value) || 0)}
                className="pl-10 text-lg"
                placeholder="0.00"
              />
            </div>
            {formData.amount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className={`${canProceed ? 'text-green-600' : 'text-red-600'}`}>
                  {canProceed ? '✓ Amount is valid' : '✗ Insufficient balance or invalid amount'}
                </span>
                {formData.amount > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => updateField('amount', Math.min(availableBalance, MAXIMUM_WITHDRAWAL))}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Use Maximum
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Receiving Address */}
          <div className="space-y-3">
            <Label htmlFor="address" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Binance Receiving Address
            </Label>
            <div className="relative">
              <Input
                id="address"
                type={showAddress ? "text" : "password"}
                value={formData.receiving_address}
                onChange={(e) => updateField('receiving_address', e.target.value)}
                className="pr-20"
                placeholder="Enter your Binance wallet address"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                {formData.receiving_address && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={copyAddress}
                    className="h-8 w-8 p-0"
                  >
                    {addressCopied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddress(!showAddress)}
                  className="h-8 w-8 p-0"
                >
                  {showAddress ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Only send to Binance addresses. Sending to other addresses may result in permanent loss of funds.
            </p>
          </div>

          {/* Processing Information */}
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  Processing Information
                </p>
                <ul className="text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• Estimated processing time: {ESTIMATED_PROCESSING_TIME}</li>
                  <li>• Withdrawals are processed manually during business hours</li>
                  <li>• You'll receive email updates on status changes</li>
                  <li>• Minimum withdrawal: {formatCurrency(MINIMUM_WITHDRAWAL)}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {(error || errors.length > 0) && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error || errors.join('. ')}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!canProceed || isSubmitting || errors.length > 0}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 text-lg"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Processing Request...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Wallet className="h-5 w-5" />
                <span>Submit Withdrawal Request</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}