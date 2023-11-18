'use client'

import { BaseError } from 'viem'
import { useContractWrite, useWaitForTransaction } from 'wagmi'

import { redVsBlueContractConfig } from './contracts'
import { stringify } from '../utils/stringify'
import { BlockNumber } from './BlockNumber'

export function WriteContract() {
  const { write, data, error, isLoading, isError } = useContractWrite({
    ...redVsBlueContractConfig,
    functionName: 'endRound',
  })
  const {
    data: receipt,
    isLoading: isPending,
    isSuccess,
  } = useWaitForTransaction({ hash: data?.hash })

  return (
    <>
      <h3>End Round</h3>
      <button disabled={isLoading} onClick={() => write?.()}>
        End round
      </button>
      

      {isLoading && <div>Check wallet...</div>}
      {isPending && <div>Transaction pending...</div>}
      {isSuccess && (
        <>
          <div>Transaction Hash: {data?.hash}</div>
          <div>
            Transaction Receipt: <pre>{stringify(receipt, null, 2)}</pre>
          </div>
        </>
      )}
      {isError && <div>{(error as BaseError)?.shortMessage}</div>}
    </>
  )
}
