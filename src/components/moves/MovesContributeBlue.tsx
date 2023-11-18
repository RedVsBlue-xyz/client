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

export function MovesContributeBlue() {
const [value, setValue] = useState('')
const { config } = usePrepareContractWrite({
    ...redVsBlueContractConfig,
    functionName: 'contributeToBlue',
    value: parseUnits(value as any, 18),
})
const { write, data, error, isLoading, isError } = useContractWrite(config)
const {
    data: receipt,
    isLoading: isPending,
    isSuccess,
} = useWaitForTransaction({ hash: data?.hash })

  return (
    <div>
      <h3>Bet Blue</h3>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          write?.()
        }}
      >
        <input
          placeholder="amount"
          onChange={(e) => setValue(e.target.value)}
        />
        <button disabled={!write} type="submit">
          Contribute
        </button>
      </form>

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
    </div>
  )
}
