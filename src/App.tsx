import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import { createPublicClient, http, formatEther, parseEther } from "viem";
import { neuraTestnet } from "./network";
import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import toast, { Toaster } from "react-hot-toast";
import { TrendingUp, Zap, ShieldCheck, LogOut } from "lucide-react";

const ASSETS = ["ANKR", "BTC", "ETH", "SOL", "BNB", "XRP"];

const INSIGHTS = [
  { text: "Neura AI detected high volatility in ANKR tokens.", time: "2m ago" },
  { text: "New Faucet successfully released for developers.", time: "15m ago" },
  { text: "Neura Network operating with 99.9% uptime.", time: "1h ago" },
];

const chartData = [{ v: 2 }, { v: 5 }, { v: 3 }, { v: 8 }, { v: 6 }, { v: 10 }, { v: 9 }];

function App() {
  const { login, logout, authenticated, user } = usePrivy();
  const { wallets } = useWallets();

  const [balance, setBalance] = useState<string>("0.0000");
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [txLoading, setTxLoading] = useState(false);

  const activeWallet = wallets?.[0];
  const walletAddress = user?.wallet?.address || activeWallet?.address;

  // Fetch prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch("https://api.binance.com/api/v3/ticker/price");
        const data = await res.json();

        const priceMap: Record<string, string> = {};

        data.forEach((item: any) => {
          if (item.symbol.endsWith("USDT")) {
            const symbol = item.symbol.replace("USDT", "");
            if (ASSETS.includes(symbol)) {
              priceMap[symbol] = parseFloat(item.price).toLocaleString();
            }
          }
        });

        setPrices(priceMap);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

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
        <h1 style={{ fontSize: "4rem", fontWeight: "900" }}>NEURA WALLET</h1>
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

      <div style={{ height: "100px", margin: "20px 0" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <Area
              type="monotone"
              dataKey="v"
              stroke="#00cc6a"
              fill="#00cc6a"
              fillOpacity={0.1}
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <h3>Quick Transfer</h3>

      <input
        placeholder="Recipient Address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />

      <input
        placeholder="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <button onClick={handleTransfer} disabled={txLoading}>
        Send
      </button>

      <br />
      <br />

      <button onClick={logout}>
        <LogOut size={16} /> Logout
      </button>
    </div>
  );
}

export default App;
