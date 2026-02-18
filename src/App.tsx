import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import { createPublicClient, http, formatEther, parseEther } from "viem";
import { neuraTestnet } from "./network";
import toast, { Toaster } from "react-hot-toast";
import { LogOut } from "lucide-react";

function App() {
  const { login, logout, authenticated, user } = usePrivy();
  const { wallets } = useWallets();

  const [balance, setBalance] = useState<string>("0.0000");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [txLoading, setTxLoading] = useState(false);

  const activeWallet = wallets?.[0];
  const walletAddress = user?.wallet?.address || activeWallet?.address;

  // Fetch balance
  useEffect(() => {
    async function getBalance() {
      if (authenticated && walletAddress) {
        const client = createPublicClient({
          chain: neuraTestnet,
          transport: http(),
        });

        const b = await client.getBalance({
          address: walletAddress as `0x${string}`,
        });

        setBalance(formatEther(b));
      }
    }

    getBalance();
  }, [authenticated, walletAddress]);

  const handleTransfer = async () => {
    if (!recipient || !amount || !activeWallet || !walletAddress) {
      toast.error("Fill all fields correctly!");
      return;
    }

    setTxLoading(true);
    const loadingToast = toast.loading("Confirming transaction...");

    try {
      const provider = await activeWallet.getEthereumProvider();

      const txHash = await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: walletAddress,
            to: recipient,
            value: "0x" + parseEther(amount).toString(16),
          },
        ],
      });

      toast.success(`Success! Hash: ${String(txHash).slice(0, 10)}...`, {
        id: loadingToast,
      });

      setAmount("");
      setRecipient("");
    } catch (error: any) {
      toast.error(error?.message || "Transaction failed", {
        id: loadingToast,
      });
    } finally {
      setTxLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h1 style={{ fontSize: "3rem", fontWeight: "900" }}>NEURA WALLET</h1>
        <button
          onClick={login}
          style={{
            padding: "18px 50px",
            borderRadius: "50px",
            border: "none",
            backgroundColor: "#0f172a",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "1rem",
            marginTop: "30px",
          }}
        >
          Login with Discord
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px" }}>
      <Toaster />

      <h2>Balance: {Number(balance).toFixed(4)} ANKR</h2>

      <h3>Quick Transfer</h3>

      <input
        placeholder="Recipient Address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        style={{ display: "block", marginBottom: "10px", padding: "10px" }}
      />

      <input
        placeholder="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ display: "block", marginBottom: "10px", padding: "10px" }}
      />

      <button onClick={handleTransfer} disabled={txLoading}>
        Send
      </button>

      <br />
      <br />

      <button onClick={logout} style={{ marginTop: "20px" }}>
        <LogOut size={16} /> Logout
      </button>
    </div>
  );
}

export default App;
