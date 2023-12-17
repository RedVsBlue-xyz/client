import { log } from 'console'
import { decodeEventLog, getAbiItem, getContract, parseAbiItem } from 'viem'
import { configureChains, createConfig } from 'wagmi'
import { goerli, mainnet } from 'wagmi/chains'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'


import { publicProvider } from 'wagmi/providers/public'
import { chainToConnect, colorClashContractConfig } from './components/contracts'

export const { chains, publicClient, webSocketPublicClient } = configureChains(
  [chainToConnect],
  [
    publicProvider(),
  ],
)

export const START_BLOCK = BigInt(56601318)

export const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'wagmi',
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
})

async function test(){
  const events = (await publicClient({chainId: chainToConnect.id
  }).getLogs({
    fromBlock: START_BLOCK,
    address: colorClashContractConfig.address,

  })).map(log => {
    const decodedLog:any = decodeEventLog({
      abi: colorClashContractConfig.abi,
      topics: log.topics,
      data: log.data,
    })
    return {
      eventId: log.data + log.topics.join('') + log.blockNumber,
      type: decodedLog.eventName,
      blockNumber: log.blockNumber,
      ...decodedLog.args,
    }
  })
  //console.log("events", events)
}



test()

