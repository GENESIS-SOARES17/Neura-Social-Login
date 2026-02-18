import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { PrivyProvider } from '@privy-io/react-auth'
import { neuraTestnet } from './network'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PrivyProvider
      appId="cmlryv7zk04ox0cjv1hfm2dax"
      config={{
        loginMethods: ['email', 'discord'],
        defaultChain: neuraTestnet,
        supportedChains: [neuraTestnet],
        embeddedWallets: {
          // A configuração createOnLogin agora deve ficar dentro de 'ethereum' ou 'solana'
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
          // Esta propriedade permanece no nível superior de embeddedWallets
          requireUserPasswordOnCreate: false,
        },
        appearance: {
          theme: 'dark',
          accentColor: '#00ff88',
        },
      }}
    >
      <App />
    </PrivyProvider>
  </React.StrictMode>,
)