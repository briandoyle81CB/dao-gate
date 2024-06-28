import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [base],
  // turn off injected provider discovery
  multiInjectedProviderDiscovery: false,
  connectors: [
    coinbaseWallet({
      appName: "DAO Gate",
      preference: "all",
      version: "4",
    }),
  ],
  ssr: true,
  transports: {
    [base.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}
