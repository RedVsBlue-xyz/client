'use client'

import { parseUnits } from 'viem'
import { useState } from 'react'
import { BaseError } from 'viem'
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi'

import { colorClashContractConfig } from '../contracts'
import { stringify } from '../../utils/stringify'
import { ColorTypeToString, ColorTypes } from '../../types'
import { useColorBuyPrice } from '../../hooks/state'

export function ActionBuyShare({colorType}: {colorType: ColorTypes}) {
    const [amount, setAmount] = useState(1)
    const { price, priceAfterFees } = useColorBuyPrice(colorType, amount)
    const colorName = ColorTypeToString[colorType];
    const { config } = usePrepareContractWrite({
        ...colorClashContractConfig,
        functionName: 'buyShares',
        args: [Number(colorType), BigInt(amount)],
        value: BigInt(priceAfterFees),
    })
    const { write, data, error, isLoading, isError } = useContractWrite(config)
    const {
        data: receipt,
        isLoading: isPending,
        isSuccess,
    } = useWaitForTransaction({ hash: data?.hash })

  return (
    <div>
      <h3>Buy {colorName} Share</h3>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          write?.()
        }}
      >
        <input
          placeholder="amount"
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <button disabled={!write} type="submit">
          BUY
        </button>
      </form>
      <p>Total cost: {priceAfterFees} ETH</p>
      <p>Price: {price} ETH + {priceAfterFees - price} ETH fees</p>

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
