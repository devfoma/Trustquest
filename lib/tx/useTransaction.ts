import { useState } from "react";

declare global {
  interface Window {
    wallet?: { sign: (tx: unknown) => Promise<unknown> };
    submitTx?: (signedTx: unknown) => Promise<string>;
    waitForConfirmation?: (hash: string) => Promise<void>;
  }
}

export type TxState =
  | "idle"
  | "preparing"
  | "signing"
  | "submitting"
  | "pending"
  | "success"
  | "failed"
  | "rejected";

interface UseTransactionResult {
  state: TxState;
  execute: (txBuilder: () => Promise<any>) => Promise<void>;
}

export function useTransaction(): UseTransactionResult {
  const [state, setState] = useState<TxState>("idle");

  async function execute(txBuilder: () => Promise<any>) {
    if (state !== "idle") return;
    try {
      setState("preparing");
      const tx = await txBuilder();
      setState("signing");
      // Replace with your wallet integration
      if (!window.wallet?.sign || !window.submitTx || !window.waitForConfirmation) {
        throw new Error("Wallet transaction helpers are not available");
      }
      const signed = await window.wallet.sign(tx);
      setState("submitting");
      // Replace with your tx submission logic
      const hash = await window.submitTx(signed);
      setState("pending");
      // Replace with your confirmation logic
      await window.waitForConfirmation(hash);
      setState("success");
    } catch (err: any) {
      if (err?.code === "USER_REJECTED") {
        setState("rejected");
      } else {
        setState("failed");
      }
    }
  }

  return { state, execute };
}
