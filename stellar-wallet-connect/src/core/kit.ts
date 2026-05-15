import {
  allowAllModules,
  StellarWalletsKit,
} from "@creit.tech/stellar-wallets-kit";
import { LedgerModule } from "@creit.tech/stellar-wallets-kit/modules/ledger.module";

// Use a getter or a function to allow dynamic network passphrase if needed
export const createKit = (networkPassphrase?: string) => {
  return new StellarWalletsKit({
    modules: [...allowAllModules(), new LedgerModule()],
    network: networkPassphrase || 
             (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SOROBAN_NETWORK_PASSPHRASE : "") ||
             (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.PUBLIC_SOROBAN_NETWORK_PASSPHRASE : ""),
  });
};

// Lazy-initialized kit instance to avoid SSR "window is not defined" errors
let _kit: StellarWalletsKit;

export const kit = new Proxy({} as StellarWalletsKit, {
  get(_, prop) {
    if (typeof window === 'undefined') {
      return undefined;
    }
    if (!_kit) {
      _kit = createKit();
    }
    const value = (_kit as any)[prop];
    return typeof value === 'function' ? value.bind(_kit) : value;
  },
});

