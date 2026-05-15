"use client";
import { useEffect } from "react";

import { WalletStatus } from "@cosmos-kit/core";
import { useChain } from "@cosmos-kit/react";
import { chains } from "chain-registry";
import { ChainSelect } from "./Chain";
import { CHAIN_NAME, CHAIN_NAME_STORAGE_KEY } from "../config";
import {
  ButtonConnect,
  ButtonConnected,
  ButtonConnecting,
  ButtonDisconnected,
  ButtonError,
  ButtonNotExist,
  ButtonRejected,
} from "./Connect";
import {
  Box,
  ClipboardCopyText,
  Warning,
  Stack,
  useColorModeValue,
} from "@interchain-ui/react";

export function Wallet({ chainName = CHAIN_NAME, onChainChange = () => {} }) {
  const {
    chain,
    status,
    wallet,
    username,
    address,
    message,
    connect,
    openView,
  } = useChain(chainName);

  const trimWalletAddress = address?.slice(0, 4) + "..." + address?.slice(-6);
  const ConnectButton = {
    [WalletStatus.Connected]: (
      <ButtonConnected onClick={openView} text={trimWalletAddress} />
    ),
    [WalletStatus.Connecting]: <ButtonConnecting />,
    [WalletStatus.Disconnected]: <ButtonDisconnected onClick={connect} />,
    [WalletStatus.Error]: <ButtonError onClick={openView} />,
    [WalletStatus.Rejected]: <ButtonRejected onClick={connect} />,
    [WalletStatus.NotExist]: <ButtonNotExist onClick={openView} />,
  }[status] || <ButtonConnect onClick={connect} />;

  function handleChainChange(chainName) {
    if (chainName) {
      onChainChange(chainName);
      localStorage.setItem(CHAIN_NAME_STORAGE_KEY, chainName);
    }
  }

  useEffect(() => {
    const selected = localStorage.getItem(CHAIN_NAME_STORAGE_KEY);
    if (selected && selected !== chainName) {
      onChainChange(selected);
    }
  }, []);

  return (
    <div>
      <div className="hidden">
        {/* hide the select chain input field */}

        <Box mx="auto" maxWidth="28rem" attributes={{ mb: "$12" }}>
          <ChainSelect
            chains={chains}
            chainName={chain.chain_name}
            onChange={handleChainChange}
          />
        </Box>
      </div>
      <div>
        <div>{ConnectButton}</div>

        {message &&
        [WalletStatus.Error, WalletStatus.Rejected].includes(status) ? (
          <Warning text={`${wallet?.prettyName}: ${message}`} />
        ) : null}
      </div>
    </div>
  );
}
