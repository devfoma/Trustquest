"use client";

import WalletConnectionButton from "@/components/app/WalletConnectionButton";

export default function ConnectWallet() {
  return (
    <div id="connect-wrap">
      <WalletConnectionButton
        size="default"
        showAddress
        showNetwork
        className="rounded-full shadow-lg"
      />
    </div>
  );
}
