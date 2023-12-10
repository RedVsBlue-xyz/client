import { useState } from 'react';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { colorClashContractConfig } from '../contracts';
import { ColorTypeToString, ColorTypeToHexButton, ColorTypes } from '../../types';
import { useColorSellPrice } from '../../hooks/state';
import { formatEther } from 'viem';

export function ActionSellShare({ colorType }: { colorType: ColorTypes }) {
  const [amount, setAmount] = useState(1);
  const { price, priceAfterFees } = useColorSellPrice(colorType, amount);
  const colorName = ColorTypeToString[colorType];
  const colorHex = ColorTypeToHexButton[ColorTypes.Red];
  const { config } = usePrepareContractWrite({
    ...colorClashContractConfig,
    functionName: 'sellShares',
    args: [Number(colorType), BigInt(amount)],
    value: BigInt(0),
  });
  const { data, isLoading, isSuccess, write } = useContractWrite({
    ...colorClashContractConfig,
    functionName: 'sellShares',
    args: [Number(colorType), BigInt(amount)],
    value: BigInt(0),
  });
  const incrementAmount = () => setAmount(prev => prev + 1);
  const decrementAmount = () => setAmount(prev => Math.max(1, prev - 1));

  return (
    <div style={{width:"100%"}}>
      <form onSubmit={(e) => {
        e.preventDefault();
        write?.();
      }}>
        <button
          className='button big-button'
          type="submit"
          onClick={(e) => { e.stopPropagation(); }}
         >
            {' '}{isLoading ? "SELLING..." : "SELL"}{' '}
            {!isLoading && <>
            <div>{amount}</div>
            <div className='big-square' style={{backgroundColor:ColorTypeToHexButton[colorType], width:"40px", height:"40px"}}></div>
            <div style={{display:"flex", flexDirection:"column", gap:"-10px"}}>
              <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); incrementAmount(); }}>&#x25B2;</div>
              <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); decrementAmount(); }}>&#x25BC;</div>
            </div>
            </> }

        </button>
      </form>
      <div className='trade-info'>
        <p className='small-p'>Sell Price:{parseFloat(formatEther(BigInt(price))).toFixed(4)}ETH</p>
        <p className='small-p'>Fees:{parseFloat(formatEther(BigInt(price - priceAfterFees))).toFixed(4)}ETH</p>
        <p className='small-p'>Total:{parseFloat(formatEther(BigInt(priceAfterFees))).toFixed(4)}ETH</p>
      </div>
    </div>
  );
}
