import { defineChain } from 'viem';

export const neuraTestnet = defineChain({
  id: 267,
  name: 'Neura Testnet',
  network: 'neura-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ANKR',
    symbol: 'ANKR',
  },
  rpcUrls: {
    default: { http: ['https://rpc.ankr.com/neura_testnet'] },
    public: { http: ['https://rpc.ankr.com/neura_testnet'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://testnet.explorer.neuraprotocol.io' },
  },
});