import {createConfig} from '@privy-io/wagmi';
import {avalancheFuji} from 'viem/chains';
import {http} from 'wagmi';

export const config = createConfig({
    chains: [avalancheFuji], 
    transports: {
      [avalancheFuji.id]: http(),
    },
  });