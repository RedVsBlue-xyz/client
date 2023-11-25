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
import { Modal } from './Modal'
import { ColorTypeToHex, ColorTypeToString, ColorTypes } from '../../types'
import { ActionBuyShare } from '../actions/ActionBuyShare'
import { ActionSellShare } from '../actions/ActionSellShare'
import { Chart } from '../Chart'
import { useGetColorEventHistory, useGetPriceHistory } from '../../hooks/state'

export interface ColorStats {
    color: ColorTypes;
}

export function ModalColorStatistics({colorStats, show, onClose}: {colorStats: ColorStats, show: boolean, onClose: any}) {
    const data = useGetPriceHistory(colorStats.color);
    const events = useGetColorEventHistory(colorStats.color);


  return (
    <Modal isVisible={show} onClose={() => { onClose() }}>
        <h1 style={{display:"flex", gap:"10px"}}><div className='square' style={{backgroundColor:ColorTypeToHex[colorStats.color], width:"40px", height:"40px"}}></div>{ColorTypeToString[colorStats.color]} </h1>
        <div style={{display:"flex", flexDirection:"column"}}>
            <p>Price history</p>
            <Chart data={data} width={1000} height={300} />
        </div>
        <div style={{display:"flex", justifyContent:"space-between"}}>
            <ActionBuyShare colorType={colorStats.color}/>
            <ActionSellShare colorType={colorStats.color}/>
        </div>
        <div style={{display:"flex", flexDirection:"column"}}>
            <p>Events</p>
            <div style={{display:"flex", flexDirection:"column"}}>
                {events.map((event, index) => {
                    return (
                        <div key={index} style={{display:"flex", flexDirection:"row", justifyContent:"space-between"}}>
                            <div>{event.type}</div>
                            <div>{JSON.stringify(event)}</div>
                        </div>
                    )
                })}
            </div>
        </div>
    </Modal>
  )
}
