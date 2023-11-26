'use client'

import * as React from 'react'
import { WagmiConfig } from 'wagmi'

import { config } from '../wagmi'
import StoreProvider from './StoreProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  return <StoreProvider><WagmiConfig config={config}>{mounted && children}</WagmiConfig></StoreProvider>
}
