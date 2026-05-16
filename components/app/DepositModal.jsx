"use client";

import { useState, useEffect } from "react";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, AlertCircle, Check, Droplets, Wallet, TrendingUp, RefreshCw, Clock, Info } from "lucide-react";
import { createTransaction } from "@/lib/api";
import { useTrustQuest } from "@/hooks/useTrustQuest";
import { ErrorStateDisplay, InlineError, LoadingState as LoadingDisplay } from "@/components/ui/error-state";
import { errorManager } from "@/lib/error-handling";

export default function DepositModal({
  isOpen,
  onClose,
  selectedPool: initialPool,
}) {
  const { state: walletConnectionState } = useWalletConnection();
  const { address, isConnected } = walletConnectionState;
  const { 
    validateAction, 
    checkPrerequisites, 
    errorState, 
    dismissError,
    clearErrors,
    pools
  } = useTrustQuest();
  
  // State management
  const [selectedPool, setSelectedPool] = useState(initialPool);
  const [depositAmount, setDepositAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Sync selected pool when initialPool changes or pools are loaded
  useEffect(() => {
    if (initialPool) {
      const poolId = initialPool.id;
      const foundPool = pools.find(p => p.id === poolId);
      setSelectedPool(foundPool || initialPool);
    }
  }, [initialPool, pools]);

  // Clear errors when modal closes
  useEffect(() => {
    if (!isOpen) {
      clearErrors();
      setValidationErrors([]);
      setRetryCount(0);
      setDepositAmount("");
      setError("");
      setSuccess(false);
    }
  }, [isOpen, clearErrors]);

  const handleDeposit = async () => {
    // Clear previous errors
    setError("");
    setValidationErrors([]);
    
    if (!selectedPool) {
      setError("No pool selected");
      return;
    }

    // Validate prerequisites
    const prerequisites = checkPrerequisites('deposit', selectedPool, "1000000"); // Mock balance for validation
    if (!prerequisites.prerequisitesMet) {
      if (!prerequisites.walletConnected) {
        errorManager.addError('WALLET_NOT_CONNECTED');
        return;
      }
      if (!prerequisites.networkSupported) {
        errorManager.addError('UNSUPPORTED_NETWORK');
        return;
      }
    }

    // Prepare form data for validation
    const formData = {
      poolId: selectedPool.id,
      amount: depositAmount,
    };

    // Validate form data
    const validation = validateAction('deposit', formData, selectedPool, "1000000"); // Mock balance
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setIsPending(true);
    setIsRetrying(false);

    try {
      // Create transaction record
      const response = await createTransaction(address, "deposit", {
        pool_id: selectedPool.id,
        amount: depositAmount,
      });

      if (response.success) {
        setSuccess(true);
        clearErrors();
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        const errorMsg = response.error || "Failed to process deposit";
        setError(errorMsg);
        errorManager.addError('TRANSACTION_FAILED', { 
          error: errorMsg, 
          action: 'deposit',
          poolId: selectedPool.id
        });
      }
    } catch (err) {
      console.error('Deposit error:', err);
      errorManager.addError('TRANSACTION_FAILED', { 
        error: err.message, 
        action: 'deposit',
        poolId: selectedPool?.id
      });
      setError(err.message || "Failed to process deposit");
    } finally {
      setIsPending(false);
    }
  };

  const handleRetry = async () => {
    if (retryCount >= 3) {
      setError("Maximum retry attempts reached");
      return;
    }
    setRetryCount(prev => prev + 1);
    await handleDeposit();
  };

  const handleClose = () => {
    onClose();
  };

  const handleMaxClick = () => {
    // Mock setting max amount
    setDepositAmount("100");
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#1A0808]/90 backdrop-blur-sm border border-red-900/20 text-white sm:max-w-[425px] shadow-lg">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-400" />
            Deposit to Pool
          </DialogTitle>
          <button onClick={handleClose} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="py-4">
          {!isConnected ? (
            <div className="text-center py-8">
              <Wallet className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <p className="text-yellow-400">Connect your wallet to deposit</p>
            </div>
          ) : (
            <>
              {/* Error State Display */}
              <ErrorStateDisplay 
                errorState={errorState}
                onDismiss={dismissError}
                onRetry={handleRetry}
                className="mb-4"
              />

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="mb-4 space-y-2">
                  {validationErrors.map((validationError, index) => (
                    <InlineError
                      key={index}
                      message={validationError}
                      severity="error"
                      className="w-full"
                    />
                  ))}
                </div>
              )}

              {/* Pool Info */}
              {selectedPool && (
                <div className="bg-[#2A0A0A]/50 rounded-lg p-4 mb-4">
                  <h3 className="font-medium mb-1">{selectedPool.name}</h3>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Token: {selectedPool.token?.symbol || "XLM"}</span>
                    <span className="text-green-400">{selectedPool.interestRate || selectedPool.apy || 0}% APY</span>
                  </div>
                </div>
              )}

              {/* Amount Input */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-gray-300">
                    Amount to Deposit
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMaxClick}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    MAX
                  </Button>
                </div>
                <Input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => {
                    setDepositAmount(e.target.value);
                    setError("");
                    setValidationErrors([]);
                  }}
                  placeholder="0.00"
                  className="bg-[#2A0A0A]/70 border-red-900/20 text-white"
                  disabled={isPending || success}
                />
              </div>

              {/* Success Display */}
              {success && (
                <div className="bg-green-900/20 text-green-500 p-3 rounded-md text-sm flex items-center gap-2 mb-4">
                  <Check size={16} />
                  Deposit successful! 🎉
                </div>
              )}

              {/* Info Box */}
              <div className="bg-red-900/20 rounded-lg p-3 text-xs text-red-300 mb-4">
                <Info className="inline-block w-3 h-3 mr-1 mb-0.5" />
                Your deposit is locked until the pool ends. You earn interest and tickets for the prize draw.
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleDeposit}
                  disabled={isPending || success || !depositAmount}
                  className="flex-1 bg-red-600 hover:bg-red-700 font-bold"
                >
                  {isPending ? "Processing..." : success ? "Deposited!" : "Deposit Now"}
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="border-red-900/20 hover:bg-red-600/10"
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
