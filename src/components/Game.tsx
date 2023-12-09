'use client'
import { decodeEventLog, formatEther, parseEther, parseUnits } from 'viem';
import React, { useEffect, useState } from 'react';

import { MovesEndRound } from './moves/MovesEndRound';

import { useColors, useColorsPrice, useContributions, useCurrentRoundNumber, useGameEndTime, useGameState, useRound, useTimeTill, useTotalValueDeposited, useUserInfo } from "../hooks/state"
import { ModalGameResult } from './modals/ModalGameResult';
import { useAccount, useContractEvent, useNetwork } from 'wagmi';
import { MovesClaimRewards } from './moves/MovesClaimRewards';
import { ColorTypes } from '../types';
import { ActionBuyShare } from './actions/ActionBuyShare';
import { ActionSellShare } from './actions/ActionSellShare';
import { ActionEndRound } from './actions/ActionEndRound';
import RectangularPieChart from './GameChart';
import { UserStats } from './UserStats';
import { START_BLOCK, publicClient } from '../wagmi';
import { colorClashContractConfig } from './contracts';
import { arbitrumGoerli } from 'viem/chains';
import { useAppDispatch, useAppSelector } from '../store';
import { addEvents, setEvents, setLastFetchedBlock } from '../store/events';
import toast from 'react-hot-toast';
import { eventToTsx } from './modals/ModalColorStatistics';


const fetchEvents = async (blockNumber: number = 0) => {
  //console.log("fetching events from block", blockNumber);


  let greatestBlockNumber = 0;
    
  const events = await (async () => {
    // Fetch logs
    const logs = await publicClient({chainId: arbitrumGoerli.id}).getLogs({
      fromBlock: START_BLOCK,
      address: colorClashContractConfig.address,
    });
  
    // Decode logs
    const decodedLogs = logs.map(log => {
      const decodedLog: any = decodeEventLog({
        abi: colorClashContractConfig.abi,
        topics: log.topics,
        data: log.data,
      });
  
      greatestBlockNumber = Math.max(Number(greatestBlockNumber), Number(log.blockNumber));
  
      return {
        eventId: log.data + log.topics.join('') + log.blockNumber,
        type: decodedLog.eventName,
        blockNumber: log.blockNumber,
        blockHash: log.blockHash,
        ...decodedLog.args,
      };
    });
  
    // const eventsWithBlockDetails = await Promise.all(decodedLogs.map(async (event) => {
    //   try {
    //     // Attempt to fetch block details
    //     const block = await publicClient({chainId: arbitrumGoerli.id}).getBlock({ blockHash: event.blockHash });
    
    //     return {
    //       ...event,
    //       timestamp: block.timestamp,
    //     };
    //   } catch (error) {
    //     // Handle error (e.g., log it, return a default value, etc.)
    //     console.error('Error fetching block details:', error);
    //     // Decide on how to handle the error. For example, return null or a default object
    //     return event; // or some default object if necessary
    //   }
    //   return event;
    // }));
    //console.log("eventsWithBlockDetails", eventsWithBlockDetails);
  
    return decodedLogs;
  })();

  //console.log("events abc", events);
  //console.log("greatestBlockNumber", greatestBlockNumber);

  return { events, greatestBlockNumber };
};


function clampNumber(value: number) {
    return Math.min(Math.max(value, 15), 85);
  }

  function calculateWidth(red: number, blue: number) {
    const total = red + blue;
    // Base case: if total is zero, split the screen equally
    if (total === 0) return [50, 50];
  
    // Initial proportional calculation
    let redWidth = (red / total) * 100;
    let blueWidth = (blue / total) * 100;
    
    //within range of 20-80 percent
    const adjustWidth = (width: number) => {
        return clampNumber(width);

    };
  
    redWidth = adjustWidth(redWidth);
    blueWidth = adjustWidth(blueWidth);
  
    // Ensure the sum of widths is always 100%
    const totalWidth = redWidth + blueWidth;
    redWidth *= 100 / totalWidth;
    blueWidth = 100 - redWidth;
  
    return [redWidth, blueWidth];
  }



export const Game = () => {
  const lastFetchedBlockNumber = useAppSelector((state : any) => state.events.lastFetchedBlock);
  const events = useAppSelector((state: any) => state.events.events);

  //console.log("events main", events);
  const dispatch = useAppDispatch();
  const { address } = useAccount()
  const  { chain } = useNetwork()
  //console.log("current cha  in", chain)
  const { colorSharesBalance } = useUserInfo(address as any)
  const {      
    gameEndTime,
    currentRoundNumber,
    round,
    totalValueDeposited,
    colors,
    colorsPrice,
  } = useGameState()

  const userInfo = useUserInfo(address as any)
  //console.log("userInfo", userInfo)
  //console.log("gameEndTime", gameEndTime)
  //console.log("currentRoundNumber", currentRoundNumber)
  //console.log("round", round)
  //console.log("totalValueDeposited", totalValueDeposited)
  //console.log("colors found", colors)
  //console.log("colorsPrice", colorsPrice)
  const { 
    supply: redSupply = 0,
    value: redValue = 0,
  } = colors[ColorTypes.Red];
  const { 
    supply: blueSupply = 0,
    value: blueValue = 0,
  } = colors[ColorTypes.Blue];
  const redBalance = colorSharesBalance[ColorTypes.Red];
  const blueBalance = colorSharesBalance[ColorTypes.Blue];
  const timer = useTimeTill(gameEndTime);
  const redPrice = colorsPrice[ColorTypes.Red];
  const bluePrice = colorsPrice[ColorTypes.Blue];
  const [redWidth, blueWidth] = calculateWidth(redValue, blueValue);
  // Calculate the position of the timer
  const timerPosition = `${redWidth}%`;
  const total = totalValueDeposited;
  const redChance = redValue != 0 ? (redValue / (redValue + blueValue)) : 0;
  const blueChance = blueValue != 0 ? 1 - redChance : 0;
  const redMultiplier = redValue > 0 ? total / redValue : 0;
  const blueMultiplier = blueValue > 0 ? total / blueValue : 0;
  const redPriceIfWin = redPrice * redMultiplier;
  const bluePriceIfWin = bluePrice * blueMultiplier;
  //console.log('redMultiplier', redMultiplier)
  //console.log('blueMultiplier', blueMultiplier)

  //fetch events
  useEffect(() => {
    fetchEvents(lastFetchedBlockNumber).then(({ events, greatestBlockNumber }) => {
      //console.log("events promise", events);
      //console.log("greatestBlockNumber promise", greatestBlockNumber);
      dispatch(setEvents(events));
      dispatch(setLastFetchedBlock(greatestBlockNumber));
    });
  }, []);

  //Listen to events
  useContractEvent({
    ...colorClashContractConfig,
    chainId: arbitrumGoerli.id,
    eventName: "Trade",
    listener(events) {
      events.forEach((event) => {
        //console.log("newevent", event);
        const decodedLog = decodeEventLog({
          abi: colorClashContractConfig.abi,
          topics: event.topics,
          data: event.data,
        })
        // Update the greatest block number
        const blockNumber = Number(event.blockNumber);
  
        const decodedEvent = {
          eventId: event.data + event.topics.join('') + event.blockNumber,
          type: decodedLog.eventName,
          blockNumber: event.blockNumber,
          ...decodedLog.args,
        }

        dispatch(addEvents([decodedEvent]));
        toast.success(eventToTsx(decodedEvent, 0));
        dispatch(setLastFetchedBlock(blockNumber));
        
      });
    }
  })
  useContractEvent({
    ...colorClashContractConfig,
    chainId: arbitrumGoerli.id,
    eventName: "RoundColorDeduction",
    listener(events) {
      events.forEach((event) => {
        //console.log("newevent", event);
        const decodedLog = decodeEventLog({
          abi: colorClashContractConfig.abi,
          topics: event.topics,
          data: event.data,
        })
        // Update the greatest block number
        const blockNumber = Number(event.blockNumber);
  
        const decodedEvent = {
          eventId: event.data + event.topics.join('') + event.blockNumber,
          type: decodedLog.eventName,
          blockNumber: event.blockNumber,
          ...decodedLog.args,
        }

        dispatch(addEvents([decodedEvent]));
        toast.success(eventToTsx(decodedEvent, 0));
        dispatch(setLastFetchedBlock(blockNumber));
        
      });
    }
  })
  useContractEvent({
    ...colorClashContractConfig,
    chainId: arbitrumGoerli.id,
    eventName: "RoundEnded",
    listener(events) {
      events.forEach((event) => {
        //console.log("newevent", event);
        const decodedLog = decodeEventLog({
          abi: colorClashContractConfig.abi,
          topics: event.topics,
          data: event.data,
        })
        // Update the greatest block number
        const blockNumber = Number(event.blockNumber);
  
        const decodedEvent = {
          eventId: event.data + event.topics.join('') + event.blockNumber,
          type: decodedLog.eventName,
          blockNumber: event.blockNumber,
          ...decodedLog.args,
        }

        dispatch(addEvents([decodedEvent]));
        toast.success(eventToTsx(decodedEvent, 0));
        dispatch(setLastFetchedBlock(blockNumber));
        
      });
    }
  })
  

  return (
    // <div className="container">
    //   <ModalGameResult />
    //   <div className="red" style={{ width: `${redWidth}%` }}>
    //     <h1>{formatEther(BigInt(redValue))} ETH</h1>
    //     <ActionBuyShare colorType={ColorTypes.Red} />
    //     <ActionSellShare colorType={ColorTypes.Red} />
    //     <p>Your amount of shares: {redBalance} </p>
    //     <p>Your shares are worth: {redBalance * redPrice} ETH</p>
    //     <p>Multiplier: {redMultiplier}X</p>
    //     <p>Share price if win: {redPriceIfWin} ETH</p>
    //     <p>Red&apos;s chance of winning: {Math.round(redChance * 100)}%</p>
    //   </div>
    //   <div className="blue" style={{ width: `${blueWidth}%` }}>
    //     <h1>{blueValue} ETH</h1>
    //     <ActionBuyShare colorType={ColorTypes.Blue} />
    //     <ActionSellShare colorType={ColorTypes.Blue} />
    //     <p>Your amount of shares: {blueBalance} </p>
    //     <p>Your shares are worth: {blueBalance * bluePrice} ETH</p>
    //     <p>Multiplier: {blueMultiplier}X</p>
    //     <p>Share price if win: {bluePriceIfWin} ETH</p>
    //     <p>Blue&apos;s chance of winning: {Math.round(blueChance * 100)}%</p>
    //     </div>
    //     <div className="timer" style={{ left: timerPosition }}>
    //       <div>{timer}</div>
    //       <ActionEndRound />
    //     </div>
    //     {/* <MovesEndRound /> */}

    //     </div>
    <>
    <RectangularPieChart
  colors={colors as any}
  colorsPrice={colorsPrice as any}
  timeLeft={timer as any}
/>
        <UserStats userInfo={userInfo} />
    </>
    

        );
};

