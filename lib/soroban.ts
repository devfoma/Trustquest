import { isConnected, signTransaction } from "@stellar/freighter-api";
import {
  Contract,
  Networks,
  TransactionBuilder,
  Transaction,
  rpc,
  xdr,
} from "stellar-sdk";
import { kit } from "@/stellar-wallet-connect/src/core/kit";
import { loadedProvider, toKitWalletId } from "@/stellar-wallet-connect/src/core/walletService";

const DRIP_POOL_CONTRACT_ID = process.env.NEXT_PUBLIC_DRIP_POOL_CONTRACT_ID || "CA_PLACEHOLDER_DRIP_POOL_CONTRACT_ID";
export const SOROBAN_NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_SOROBAN_NETWORK_PASSPHRASE || Networks.TESTNET;
export const SOROBAN_RPC_URL =
  process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";

export type SorobanInvocationResult = {
  hash: string;
  status: string;
  latestLedger?: number;
  signedTxXdr: string;
};

const isPlaceholderContract = (contractId: string) =>
  !contractId || contractId === "CA_PLACEHOLDER_DRIP_POOL_CONTRACT_ID";

export const isDripPoolConfigured = () => !isPlaceholderContract(DRIP_POOL_CONTRACT_ID);

export async function signTransactionXdr(
  transactionXdr: string,
  userPublicKey: string
): Promise<string> {
  const provider = loadedProvider();

  if (provider) {
    kit.setWallet(toKitWalletId(provider));
    const signed = await kit.signTransaction(transactionXdr, {
      networkPassphrase: SOROBAN_NETWORK_PASSPHRASE,
      address: userPublicKey,
    });

    if (!signed?.signedTxXdr) {
      throw new Error("Wallet did not return a signed transaction");
    }

    return signed.signedTxXdr;
  }

  const connection = await isConnected();
  if (!connection.isConnected) {
    throw new Error("Freighter wallet is not connected");
  }
  if (connection.error) {
    throw new Error(connection.error.message || "Unable to verify Freighter connection");
  }

  const signed = await signTransaction(transactionXdr, {
    networkPassphrase: SOROBAN_NETWORK_PASSPHRASE,
    address: userPublicKey,
  });

  if (signed.error) {
    throw new Error(signed.error.message || "Wallet rejected the transaction");
  }
  if (!signed.signedTxXdr) {
    throw new Error("Wallet did not return a signed transaction");
  }

  return signed.signedTxXdr;
}

export async function invokeDripPoolContract(
  methodName: string,
  args: xdr.ScVal[],
  userPublicKey: string
): Promise<SorobanInvocationResult> {
  if (isPlaceholderContract(DRIP_POOL_CONTRACT_ID)) {
    throw new Error("NEXT_PUBLIC_DRIP_POOL_CONTRACT_ID must be set to the deployed testnet contract id");
  }

  const server = new rpc.Server(SOROBAN_RPC_URL, { allowHttp: SOROBAN_RPC_URL.startsWith("http://") });
  const sourceAccount = await server.getAccount(userPublicKey);
  const contract = new Contract(DRIP_POOL_CONTRACT_ID);

  const tx = new TransactionBuilder(sourceAccount, {
    fee: "100000",
    networkPassphrase: SOROBAN_NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(methodName, ...args))
    .setTimeout(30)
    .build();

  const preparedTx = await server.prepareTransaction(tx);
  const signedTxXdr = await signTransactionXdr(preparedTx.toXDR(), userPublicKey);

  const signedTx = new Transaction(signedTxXdr, SOROBAN_NETWORK_PASSPHRASE);
  const submission = await server.sendTransaction(signedTx);

  if (submission.status === "ERROR") {
    throw new Error("Soroban RPC rejected the transaction");
  }
  if (submission.status === "TRY_AGAIN_LATER") {
    throw new Error("Soroban RPC is busy. Please try again in a moment.");
  }

  return {
    hash: submission.hash,
    status: submission.status,
    latestLedger: submission.latestLedger,
    signedTxXdr,
  };
}
