'use client'

import { formatEther, parseUnits } from 'viem'
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
import { Event } from '../../types/events'
import { useAppSelector } from '../../store'
import { Address } from '../Address'

export interface ColorStats {
    color: ColorTypes;
}

export const eventToTsx = (event: Event | any, index: number) => {
    if(event.type == "Trade"){
        //console.log("eventToTsx", event);
        return (
            <div className='small-p' key={index} style={{display:"flex", flexDirection:"row", justifyContent:"left", gap:"20px", alignContent:"center", alignItems:"center", fontWeight:"bolder"}}>
                <Address address={event.trader} />
                {event.isBuy ? "BOUGHT" : "SOLD"} 
                &nbsp;
                {Number(event.shareAmount)} <span className='square' style={{backgroundColor:ColorTypeToHex[event.color]}}></span>
                for {parseFloat(formatEther(event.ethAmount)).toFixed(4)} ETH
            </div>
        )
    }else if(event.type == "RoundEnded"){
        return (
            <div className='small-p' key={index} style={{display:"flex", flexDirection:"row", justifyContent:"left", gap:"20px", alignContent:"center", alignItems:"center", fontWeight:"bolder"}}>
                <span className='square' style={{backgroundColor:ColorTypeToHex[event.winner]}}></span> 
                WON<span style={{color:"green"}}>{parseFloat(formatEther(event.reward)).toFixed(4)} ETH</span>
                in round {Number(event.roundNumber )}
            </div>
        )
    } else if (event.type == "RoundColorDeduction"){
        return (
            <div className='small-p' key={index} style={{display:"flex", flexDirection:"row", justifyContent:"left", gap:"20px", alignContent:"center", alignItems:"center", fontWeight:"bolder"}}>
                <span className='square' style={{backgroundColor:ColorTypeToHex[event.color]}}></span> 
                LOST <span style={{color:"red"}}>{parseFloat(formatEther(event.deduction)).toFixed(4)} ETH</span>
                in round {Number(event.roundNumber) }
            </div>
        )
    }
    return (
        <div key={index} style={{display:"flex", flexDirection:"row", justifyContent:"space-between"}}>
            <div>{event.type}</div>
        </div>
    )
}

export function ModalColorStatistics({colorStats, show, onClose}: {colorStats: ColorStats, show: boolean, onClose: any}) {
    const events = useAppSelector(state => state.events.events);
    const colorEvents = useGetColorEventHistory(colorStats.color, events);
    const data = useGetPriceHistory(colorStats.color, events, [100, 100]);

    //console.log("priceHistory", data)

  return (
    <Modal isVisible={show} onClose={() => { onClose() }}>
        <h1 style={{display:"flex", gap:"10px"}}><div className='square' style={{backgroundColor:ColorTypeToHex[colorStats.color], width:"40px", height:"40px"}}></div>{ColorTypeToString[colorStats.color]} </h1>
        <div style={{display:"flex", flexDirection:"column"}}>
            <p>Price history</p>
            <Chart colorType={colorStats.color} data={data} />
        </div>
        <div className='button-container'>
            <ActionBuyShare colorType={colorStats.color}/>
            <ActionSellShare colorType={colorStats.color}/>
        </div>
        <div style={{display:"flex", flexDirection:"column", marginTop:"50px"}}>
            <p style={{marginBottom:"20px"}}>Events</p>
            <div style={{display:"flex", flexDirection:"column", gap:"15px"}}>
                {colorEvents.map((event, index) =>  eventToTsx(event, index))}
            </div>
        </div>
    </Modal>
  )
}
