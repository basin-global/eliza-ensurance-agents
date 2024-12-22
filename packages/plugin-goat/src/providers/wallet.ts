async getWalletBalanceForChain(chainName: SupportedChain): Promise<string | null> {
    try {
        const client = this.getPublicClient(chainName);
        const balance = await client.getBalance({
            address: this.account.address,
        });
        return formatUnits(balance, 18);
    } catch (error) {
        console.error("Error getting wallet balance:", error);
        return null;
    }
}