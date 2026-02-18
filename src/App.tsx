import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';
import { createPublicClient, http, formatEther, parseEther } from 'viem';
import { neuraTestnet } from './network';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import toast, { Toaster } from 'react-hot-toast';
import { TrendingUp, Zap, ShieldCheck, LogOut, History, Activity } from 'lucide-react';

const ASSETS = ["ANKR", "BTC", "ETH", "SOL", "BNB", "XRP"];
const INSIGHTS = [
  { text: "Neura AI detected high volatility in ANKR tokens.", time: "2m ago" },
  { text: "New Faucet successfully released for developers.", time: "15m ago" },
  { text: "Neura Network operating with 99.9% uptime.", time: "1h ago" }
];

const chartData = [{v:2},{v:5},{v:3},{v:8},{v:6},{v:10},{v:9}];

function App() {
  const { login, logout, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const [balance, setBalance] = useState<string>("0.0000");
  const [prices, setPrices] = useState<any>({});
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [txLoading, setTxLoading] = useState(false);

  const activeWallet = wallets[0];
  const walletAddress = user?.wallet?.address || activeWallet?.address;

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/price');
        const data = await res.json();
        const priceMap: any = {};
        data.forEach((item: any) => {
          const symbol = item.symbol.replace('USDT', '');
          if (ASSETS.includes(symbol)) priceMap[symbol] = parseFloat(item.price).toLocaleString();
        });
        setPrices(priceMap);
      } catch (e) { console.error(e); }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function getBalance() {
      if (authenticated && walletAddress) {
        const client = createPublicClient({ chain: neuraTestnet, transport: http() });
        const b = await client.getBalance({ address: walletAddress as `0x${string}` });
        setBalance(formatEther(b));
      }
    }
    getBalance();
  }, [authenticated, walletAddress]);

  const handleTransfer = async () => {
    if (!recipient || !amount) return toast.error("Fill in destination and amount!");
    setTxLoading(true);
    const loadingToast = toast.loading("Confirming transaction...");
    try {
      const provider = await activeWallet.getEthereumProvider();
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: recipient,
          value: '0x' + parseEther(amount).toString(16),
        }],
      });
      toast.success(`Success! Hash: ${txHash.substring(0, 10)}...`, { id: loadingToast });
      setAmount(""); setRecipient("");
    } catch (error: any) {
      toast.error(error.message || "Failed", { id: loadingToast });
    } finally { setTxLoading(false); }
  };

  if (!authenticated) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{ fontSize: '4.5rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>NEURA WALLET</h1>
        <p style={{ color: '#64748b', letterSpacing: '3px', marginBottom: '40px' }}>SECURE BLOCKCHAIN GATEWAY</p>
        <button onClick={login} style={{ padding: '20px 60px', borderRadius: '50px', border: 'none', backgroundColor: '#0f172a', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          Login with Discord
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '120px 40px 40px 40px', boxSizing: 'border-box' }}>
      <Toaster />
      
      {/* TICKER */}
      <div style={{ position: 'fixed', top: '30px', left: 0, width: '100%', overflow: 'hidden', zIndex: 10 }}>
        <motion.div animate={{ x: [0, -1200] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} style={{ display: 'flex', gap: '80px' }}>
          {[...ASSETS, ...ASSETS].map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'baseline' }}>
              <b style={{ fontSize: '1.5rem', color: a === 'ANKR' ? '#00cc6a' : '#1e293b' }}>{a}</b>
              <span style={{ fontSize: '1.2rem', color: '#64748b' }}>${prices[a] || '---'}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 280px', gap: '30px', maxWidth: '1600px', margin: '0 auto' }}>
        
        {/* LEFT: WATCHLIST */}
        <div style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', padding: '25px', borderRadius: '30px', border: '1px solid #fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
            <TrendingUp size={18} /> <b style={{fontSize: '14px'}}>WATCHLIST</b>
          </div>
          {ASSETS.map(asset => (
            <div key={asset} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <span style={{fontWeight: 'bold', color: '#475569'}}>{asset}</span>
              <span style={{color: '#1e293b'}}>${prices[asset] || '0.00'}</span>
            </div>
          ))}
        </div>

        {/* CENTER: DASHBOARD */}
        <div style={{ background: '#fff', padding: '50px', borderRadius: '50px', boxShadow: '0 20px 60px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '11px', fontWeight: 'bold' }}>AVAILABLE BALANCE</p>
          <h2 style={{ fontSize: '5rem', margin: '10px 0', fontWeight: '900' }}>
            {Number(balance).toFixed(4)} <span style={{fontSize: '24px', color: '#00cc6a'}}>ANKR</span>
          </h2>
          <div style={{ height: '100px', margin: '20px 0' }}>
            <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><Area type="monotone" dataKey="v" stroke="#00cc6a" fill="#00cc6a" fillOpacity={0.05} strokeWidth={3} /></AreaChart></ResponsiveContainer>
          </div>

          <div style={{ textAlign: 'left', marginBottom: '25px' }}>
            <p style={{fontSize: '11px', fontWeight: 'bold', marginBottom: '10px'}}>QUICK TRANSFER</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input placeholder="Address" value={recipient} onChange={e => setRecipient(e.target.value)} style={{ flex: 2, padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              <input placeholder="Amt" type="number" value={amount} onChange={e => setAmount(e.target.value)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              <button onClick={handleTransfer} disabled={txLoading} style={{ padding: '0 20px', borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Send</button>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '20px', textAlign: 'left' }}>
            <span style={{ color: '#00cc6a', fontSize: '10px', fontWeight: 'bold' }}>WALLET</span>
            <code style={{ display: 'block', fontSize: '12px', color: '#475569', wordBreak: 'break-all', marginTop: '5px' }}>{walletAddress}</code>
          </div>
          <button onClick={logout} style={{ marginTop: '25px', color: '#ef4444', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', margin: '25px auto 0 auto' }}><LogOut size={16}/> Logout</button>
        </div>

        {/* RIGHT: INSIGHTS */}
        <div style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', padding: '25px', borderRadius: '30px', border: '1px solid #fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
            <Zap size={18} color="#00cc6a" /> <b style={{fontSize: '14px'}}>NEURA INSIGHTS</b>
          </div>
          {INSIGHTS.map((info, i) => (
            <div key={i} style={{ padding: '15px', background: '#fff', borderRadius: '15px', marginBottom: '12px', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '12px', color: '#1e293b', margin: '0' }}>{info.text}</p>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>{info.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SYSTEM BAR */}
      <div style={{ maxWidth: '1600px', margin: '30px auto 0 auto', background: '#0f172a', padding: '18px 30px', borderRadius: '25px', display: 'flex', alignItems: 'center', gap: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#00cc6a' }}><ShieldCheck size={18} /> <b style={{fontSize: '13px'}}>STATUS:</b></div>
        <div style={{ display: 'flex', gap: '40px', color: '#94a3b8', fontSize: '11px' }}>
          <span>● Network: <span style={{color: '#fff'}}>Neura Testnet</span></span>
          <span>● Discord Auth: <span style={{color: '#fff'}}>Active</span></span>
          <span>● RPC: <span style={{color: '#fff'}}>Connected</span></span>
          <span>● System: <span style={{color: '#fff'}}>Stable</span></span>
        </div>
      </div>
    </div>
  );
}

export default App;