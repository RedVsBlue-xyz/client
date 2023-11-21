'use client'

import { useState } from 'react'
import { BaseError } from 'viem'
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi'

import { colorClashContractConfig } from '../contracts'
import { stringify } from '../../utils/stringify'

export function MovesEndRound() {

  const { config } = usePrepareContractWrite({
    ...colorClashContractConfig,
    functionName: 'endRound',
  })
  const { write, data, error, isLoading, isError } = useContractWrite(config)
  const {
    data: receipt,
    isLoading: isPending,
    isSuccess,
  } = useWaitForTransaction({ hash: data?.hash })

  return (
    <>
      {/* <h3>End game</h3> */}

      <button disabled={isLoading} onClick={() => write?.()}>
        end game
      </button>

      {/* {isLoading && <div>Check wallet...</div>}
      {isPending && <div>Transaction pending...</div>}
      {isSuccess && (
        <>
          <div>Transaction Hash: {data?.hash}</div>
          <div>
            Transaction Receipt: <pre>{stringify(receipt, null, 2)}</pre>
          </div>
        </>
      )}
      {isError && <div>{(error as BaseError)?.shortMessage}</div>} */}
    </>
  )
}
