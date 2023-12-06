import { useState } from 'react';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { colorClashContractConfig } from '../contracts';
import { ColorTypeToHex, ColorTypeToHexButton, ColorTypeToString, ColorTypes } from '../../types';
import { useColorBuyPrice } from '../../hooks/state';
import { formatEther } from 'viem';

export function ActionBuyShare({ colorType }: { colorType: ColorTypes }) {
  const [amount, setAmount] = useState(1);
  const { price, priceAfterFees } = useColorBuyPrice(colorType, amount);
  const colorName = ColorTypeToString[colorType];
  const colorHex = ColorTypeToHexButton[ColorTypes.Blue];
  // const { config } = usePrepareContractWrite({
  //   ...colorClashContractConfig,
  //   functionName: 'buyShares',
  //   args: [Number(colorType), BigInt(amount)],
  //   value: BigInt(priceAfterFees),
  // });
  const { data, isLoading, isSuccess, write } = useContractWrite({
    ...colorClashContractConfig,
    functionName: 'buyShares',
    args: [Number(colorType), BigInt(amount)],
    value: BigInt(priceAfterFees),
  })

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
         disabled={isLoading}
         >
            {' '}{isLoading ? "BUYING..." : "BUY"}{' '}
            {!isLoading && <>
              <div >{amount}</div>
            <div className='square' style={{backgroundColor:ColorTypeToHex[colorType], width:"40px", height:"40px"}}></div>
            <div style={{display:"flex", flexDirection:"column", gap:"-10px"}}>
                <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); incrementAmount(); }}>&#x25B2;</div>
                <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); decrementAmount(); }}>&#x25BC;</div>
            </div>
            </> }
            
          
        </button>
      </form>
      <div className='trade-info'>
        <p className='small-p'>Buy Price:{parseFloat(formatEther(BigInt(price))).toFixed(4)}ETH</p>
        <p className='small-p'>Fees:{parseFloat(formatEther(BigInt(priceAfterFees - price))).toFixed(4)}ETH</p>
        <p className='small-p'>Total:{parseFloat(formatEther(BigInt(priceAfterFees))).toFixed(4)}ETH</p>
      </div>
    </div>
  );
}
