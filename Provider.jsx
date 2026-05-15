"use client"

import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

import { useEffect } from "react";
import { initializeConnection } from "./stellar-wallet-connect/src/core/walletService";

const queryClient = new QueryClient();

export const Provider = ({ children }) => {
  useEffect(() => {
    initializeConnection();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
