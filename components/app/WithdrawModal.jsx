"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, AlertCircle, Check, Info } from "lucide-react";

export default function WithdrawModal({
	isOpen,
	onClose,
	selectedVault,
	onWithdraw,
	withdrawalAmount,
	setWithdrawalAmount,
	error,
	success,
	isPending,
}) {
	const handleMax = () => {
		if (selectedVault && selectedVault.balance) {
			setWithdrawalAmount(selectedVault.balance.toString());
		}
	};

	if (!isOpen || !selectedVault) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="bg-[#1A0505] border border-red-900/20 max-w-md rounded-2xl shadow-2xl">
				<DialogHeader className="border-b border-red-900/10 pb-4">
					<div className="flex items-start justify-between">
						<div>
							<DialogTitle className="text-2xl font-bold text-white tracking-tight">
								Withdraw from {selectedVault?.name || "Vault"}
							</DialogTitle>
							<p className="text-sm text-gray-400 mt-1 font-mono">
								VAULT #{selectedVault?.id}
							</p>
						</div>
						<DialogClose asChild>
							<button className="rounded-full p-1.5 opacity-70 transition-all hover:bg-red-600/20 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:pointer-events-none">
								<X className="h-4 w-4 text-white" />
								<span className="sr-only">Close</span>
							</button>
						</DialogClose>
					</div>
				</DialogHeader>

				<div className="space-y-6 py-4">
					{/* Balance Information */}
					<div className="space-y-3">
						<div className="bg-[#1A0808]/50 rounded-xl p-4 border border-red-900/10">
							<p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Your Balance</p>
							<p className="text-2xl font-bold text-white">
								{(selectedVault?.balance || 0).toFixed(4)}{" "}
								<span className="text-sm text-gray-500 font-normal">{selectedVault?.balanceToken}</span>
							</p>
							<p className="text-xs text-green-400/80 mt-2 font-medium">
								Ready to withdraw
							</p>
						</div>
					</div>

					{/* Amount Input Section */}
					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-300">
							Withdrawal Amount
						</label>
						<div className="relative">
							<Input
								type="number"
								value={withdrawalAmount}
								onChange={(e) => setWithdrawalAmount(e.target.value)}
								placeholder="0.00"
								className="bg-[#1A0808]/80 border-red-900/20 text-white text-lg rounded-xl focus:ring-1 focus:ring-red-500/50 h-14 pr-20"
								disabled={isPending}
							/>
							<button
								onClick={handleMax}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded-md transition-all"
								disabled={isPending}
							>
								MAX
							</button>
						</div>
						<div className="flex justify-between text-xs text-gray-500 mt-1">
							<span>Available: {(selectedVault?.balance || 0).toFixed(4)} {selectedVault?.balanceToken}</span>
						</div>
					</div>

					{/* Info Alert */}
					<div className="bg-red-900/20 border border-red-500/20 rounded-xl p-3 flex gap-3 items-start">
						<Info className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
						<div className="text-xs text-red-200/80 leading-relaxed">
							Withdrawing will unstake your funds. Any pending interest will be credited.
						</div>
					</div>

					{/* Error message */}
					{error && (
						<div className="bg-red-900/20 border border-red-500/20 rounded-xl p-3 flex gap-3">
							<AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
							<p className="text-red-200 text-sm">{error}</p>
						</div>
					)}

					{/* Success message */}
					{success && (
						<div className="bg-green-900/20 border border-green-500/20 rounded-xl p-3 flex gap-3">
							<Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
							<p className="text-green-200 text-sm">Withdrawal successful! 🎉</p>
						</div>
					)}

					{/* Action Buttons */}
					<div className="space-y-3 pt-2">
						<Button
							onClick={onWithdraw}
							disabled={isPending || !withdrawalAmount || Number(withdrawalAmount) <= 0}
							className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-xl transition-all disabled:bg-gray-800 disabled:text-gray-500"
						>
							{isPending ? "Processing..." : "Confirm Withdrawal"}
						</Button>

						<Button
							onClick={onClose}
							variant="ghost"
							disabled={isPending}
							className="w-full text-gray-400 hover:text-white hover:bg-red-600/10 h-12 rounded-xl transition-all"
						>
							Cancel
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
