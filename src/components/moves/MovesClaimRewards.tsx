'use client'

import { parseUnits } from 'viem'
import { useState } from 'react'
import { BaseError } from 'viem'
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi'

import { redVsBlueContractConfig } from '../contracts'
import { stringify } from '../../utils/stringify'
import { useRewards } from '../ReadContracts'


export function MovesClaimRewards(address : `0x${string}` | undefined) {
    const { totalRewards, roundsWithRewards } = useRewards(address ?? '0x0')
    const { config } = usePrepareContractWrite({
        ...redVsBlueContractConfig,
        functionName: 'claimRewardsFromRounds',
        args: [roundsWithRewards.map((round) => BigInt(round ?? 0))],
    })
    const { write, data, error, isLoading, isError } = useContractWrite(config)
    const {
        data: receipt,
        isLoading: isPending,
        isSuccess,
    } = useWaitForTransaction({ hash: data?.hash })



  return (
    <>
      
        <button 
            disabled={!write} 
            onClick={() => write?.()}
            >
          Claim
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
