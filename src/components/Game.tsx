'use client'
import { formatEther, parseEther, parseUnits } from 'viem';
import React, { useEffect, useState } from 'react';

import { MovesEndRound } from './moves/MovesEndRound';

import { useColors, useColorsPrice, useContributions, useCurrentRoundNumber, useGameEndTime, useGameState, useRound, useTimeTill, useTotalValueDeposited, useUserInfo } from "../hooks/state"
import { ModalGameResult } from './modals/ModalGameResult';
import { useAccount, useNetwork } from 'wagmi';
import { MovesClaimRewards } from './moves/MovesClaimRewards';
import { ColorTypes } from '../types';
import { ActionBuyShare } from './actions/ActionBuyShare';
import { ActionSellShare } from './actions/ActionSellShare';
import { ActionEndRound } from './actions/ActionEndRound';
import RectangularPieChart from './GameChart';

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
  const { address } = useAccount()
  const  { chain } = useNetwork()
  console.log("current cha  in", chain)
  const { colorSharesBalance } = useUserInfo(address as any)
  const  { 
    gameEndTime,
    currentRoundNumber,
    round,
    totalValueDeposited,
    colors,
    colorsPrice,
  } = useGameState()
  console.log("gameEndTime", gameEndTime)
  console.log("currentRoundNumber", currentRoundNumber)
  console.log("round", round)
  console.log("totalValueDeposited", totalValueDeposited)
  console.log("colors found", colors)
  console.log("colorsPrice", colorsPrice)
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
  console.log('redMultiplier', redMultiplier)
  console.log('blueMultiplier', blueMultiplier)

  

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
    <RectangularPieChart
  colors={colors as any}
  colorsPrice={colorsPrice as any}
  timeLeft={timer as any}
/>
        );
};

