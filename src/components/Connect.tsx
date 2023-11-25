'use client'

import { BaseError } from 'viem'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

export function Connect() {
  const { connector, isConnected } = useAccount()
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect()
  const { disconnect } = useDisconnect()

  const newConnectors = [connectors[0]]

  return (
    <>
      {!isConnected && (<div>

        {newConnectors
          .filter((x) => x.ready && x.id !== connector?.id)
          .map((x) => (
            <button className='button' key={x.id} onClick={() => connect({ connector: x })}>
              <p>Connect</p>
              {isLoading && x.id === pendingConnector?.id && ' (connecting)'}
            </button>
          ))}
      </div>
      )}
      </>
  )
}
