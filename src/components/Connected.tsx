'use client'

import { useEffect, useMemo, useState } from 'react'
import { chainToConnect } from './contracts'
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi'
import { Modal } from './modals/Modal'

export function Connected({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount()
  const { chain } = useNetwork()
  const { chains, error, isLoading, pendingChainId, switchNetwork } = useSwitchNetwork()
  const [show, setShow] = useState(false)

  console.log('chain id', chain?.id)
  const isCorrectChain = useMemo(() => {
    return chain?.id === chainToConnect.id
  }, [chain])

  const isLoggedin = useMemo(() => {
    return isConnected && isCorrectChain
  }, [isConnected, isCorrectChain])

  useEffect(() => {
    if (!isCorrectChain) {
      switchNetwork?.(chainToConnect.id)
      setShow(true)
    }
  }, [isCorrectChain, switchNetwork])

  if (!isConnected) return null
  if (!isCorrectChain) return (
    <Modal
      isVisible={show}
      onClose={() => { setShow(false) }}
      >
      <h2>Wrong Network</h2>
      <p>Please switch to Arbitrum One</p>
    </Modal>
  )
  return <>{children}</>
}
