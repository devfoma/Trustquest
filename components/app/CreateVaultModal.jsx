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
import { X, AlertCircle, Check } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export default function CreateVaultModal({
	isOpen,
	onClose,
	onCreateVault,
	vaultName,
	setVaultName,
	vaultToken,
	setVaultToken,
	vaultDuration,
	setVaultDuration,
	vaultInterestRate,
	setVaultInterestRate,
	isPending
}) {
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	// Token options for Stellar
	const tokenOptions = [
		{ value: "native", label: "XLM (Native)", symbol: "XLM" },
		{ value: "USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335XOPC" , label: "USDC", symbol: "USDC" },
		{ value: "ARS:GBVQX...ARK", label: "ARS", symbol: "ARS" },
	];

	// Duration options in hours
	const durationOptions = [
		{ value: 168, label: "1 Week" },
		{ value: 336, label: "2 Weeks" },
		{ value: 720, label: "1 Month" },
		{ value: 2160, label: "3 Months" },
		{ value: 4320, label: "6 Months" },
		{ value: 8760, label: "1 Year" }
	];

	const handleCreate = () => {
		if (!vaultName.trim()) {
			setError("Please enter a vault name");
			return;
		}

		if (!vaultToken) {
			setError("Please select a token");
			return;
		}

		if (!vaultDuration || vaultDuration <= 0) {
			setError("Please select a valid duration");
			return;
		}

		if (!vaultInterestRate || vaultInterestRate <= 0 || vaultInterestRate > 100) {
			setError("Interest rate must be between 0.01% and 100%");
			return;
		}

		setError("");
		if (onCreateVault) {
			onCreateVault();
		}
	};

	const handleClose = () => {
		setError("");
		setSuccess(false);
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="bg-[#1A0505] border border-red-900/20 max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
				<DialogHeader className="border-b border-red-900/10 pb-4">
					<div className="flex items-start justify-between">
						<div>
							<DialogTitle className="text-2xl font-bold text-white tracking-tight">Create New Vault</DialogTitle>
							<p className="text-sm text-gray-400 mt-1">
								Configure a new prize-linked savings vault
							</p>
						</div>
						<button onClick={handleClose} className="rounded-full p-1.5 opacity-70 transition-all hover:bg-red-600/20 hover:opacity-100">
							<X className="h-4 w-4 text-white" />
							<span className="sr-only">Close</span>
						</button>
					</div>
				</DialogHeader>

				<div className="py-6 space-y-5">
					<div>
						<label className="text-sm font-medium text-gray-300 mb-2 block">
							Vault Name
						</label>
						<Input
							placeholder="e.g. Summer Savings"
							className="bg-[#1A0808]/80 border-red-900/20 text-white focus:ring-1 focus:ring-red-500/50 rounded-xl h-12"
							value={vaultName}
							onChange={(e) => {
								setVaultName(e.target.value);
								setError("");
							}}
							disabled={isPending || success}
						/>
					</div>

					<div>
						<label className="text-sm font-medium text-gray-300 mb-2 block">
							Asset Token
						</label>
						<Select
							value={vaultToken}
							onValueChange={(value) => {
								setVaultToken(value);
								setError("");
							}}
							disabled={isPending || success}
						>
							<SelectTrigger className="bg-[#1A0808]/80 border-red-900/20 text-white focus:ring-1 focus:ring-red-500/50 rounded-xl h-12">
								<SelectValue placeholder="Select Token" />
							</SelectTrigger>
							<SelectContent className="bg-[#1A0505] border border-red-900/20 rounded-xl">
								{tokenOptions.map((token) => (
									<SelectItem key={token.value} value={token.value} className="focus:bg-red-600/10 text-white">
										{token.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<label className="text-sm font-medium text-gray-300 mb-2 block">
							Lock Duration
						</label>
						<Select
							value={vaultDuration.toString()}
							onValueChange={(value) => {
								setVaultDuration(Number(value));
								setError("");
							}}
							disabled={isPending || success}
						>
							<SelectTrigger className="bg-[#1A0808]/80 border-red-900/20 text-white focus:ring-1 focus:ring-red-500/50 rounded-xl h-12">
								<SelectValue placeholder="Select Duration" />
							</SelectTrigger>
							<SelectContent className="bg-[#1A0505] border border-red-900/20 rounded-xl">
								{durationOptions.map((duration) => (
									<SelectItem key={duration.value} value={duration.value.toString()} className="focus:bg-red-600/10 text-white">
										{duration.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<label className="text-sm font-medium text-gray-300 mb-2 block">
							Annual Yield Rate (%)
						</label>
						<Input
							type="number"
							placeholder="e.g. 5.5"
							min="0.01"
							max="100"
							step="0.01"
							className="bg-[#1A0808]/80 border-red-900/20 text-white focus:ring-1 focus:ring-red-500/50 rounded-xl h-12"
							value={vaultInterestRate}
							onChange={(e) => {
								setVaultInterestRate(Number(e.target.value));
								setError("");
							}}
							disabled={isPending || success}
						/>
					</div>

					<div className="bg-[#1A0808]/50 rounded-xl p-4 border border-red-900/10 space-y-2">
						<p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Vault Configuration</p>
						<div className="space-y-2 text-sm">
							<div className="flex justify-between">
								<span className="text-gray-400">Vault Name:</span>
								<span className="text-white font-medium">{vaultName || "—"}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-400">Token:</span>
								<span className="text-white font-medium">{tokenOptions.find(t => t.value === vaultToken)?.label || "—"}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-400">Duration:</span>
								<span className="text-white font-medium">{durationOptions.find(d => d.value.toString() === vaultDuration.toString())?.label || "—"}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-400">APY:</span>
								<span className="text-white font-medium">{vaultInterestRate}%</span>
							</div>
						</div>
					</div>

					{error && (
						<div className="flex items-center gap-3 bg-red-900/20 border border-red-500/20 rounded-xl p-3">
							<AlertCircle size={18} className="text-red-500 flex-shrink-0" />
							<p className="text-red-200 text-sm">{error}</p>
						</div>
					)}
				</div>

				<div className="space-y-3 pt-4 border-t border-red-900/10">
					<Button
						className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-xl transition-all disabled:bg-gray-800 disabled:text-gray-500"
						onClick={handleCreate}
						disabled={isPending || success}
					>
						{isPending ? "Creating Vault..." : success ? "✓ Vault Created" : "Create Vault"}
					</Button>

					<Button
						variant="ghost"
						className="w-full text-gray-400 hover:text-white hover:bg-red-600/10 h-12 rounded-xl transition-all"
						onClick={handleClose}
						disabled={isPending}
					>
						Cancel
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}