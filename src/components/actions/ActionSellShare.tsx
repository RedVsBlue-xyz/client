import { useState } from 'react';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { colorClashContractConfig } from '../contracts';
import { ColorTypeToString, ColorTypeToHexButton, ColorTypes } from '../../types';
import { useColorSellPrice } from '../../hooks/state';

export function ActionSellShare({ colorType }: { colorType: ColorTypes }) {
  const [amount, setAmount] = useState(1);
  const { price, priceAfterFees } = useColorSellPrice(colorType, amount);
  const colorName = ColorTypeToString[colorType];
  const colorHex = ColorTypeToHexButton[ColorTypes.Red];
  const { config } = usePrepareContractWrite({
    ...colorClashContractConfig,
    functionName: 'sellShares',
    args: [Number(colorType), BigInt(amount)],
    value: BigInt(priceAfterFees),
  });
  const { write } = useContractWrite(config);

  const incrementAmount = () => setAmount(prev => prev + 1);
  const decrementAmount = () => setAmount(prev => Math.max(1, prev - 1));

  return (
    <div>
      <form onSubmit={(e) => {
        e.preventDefault();
        write?.();
      }}>
        <button
            className='button'
            style={{color: colorHex}}
         type="submit"
         onClick={(e) => { e.stopPropagation(); }}
         >
            {' '}SELL{' '}
            <div>{amount}</div>
            <div style={{display:"flex", flexDirection:"column", gap:"-10px"}}>
            <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); incrementAmount(); }}>&#x25B2;</div>
            <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); decrementAmount(); }}>&#x25BC;</div>
            </div>
          
        </button>
      </form>
       </div>
  );
}
