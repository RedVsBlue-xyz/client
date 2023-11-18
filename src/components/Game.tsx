'use client'
import { formatEther } from 'viem';
import React, { useEffect, useState } from 'react';

import { MovesEndRound } from './moves/MovesEndRound';
import { MovesContributeBlue } from './moves/MovesContributeBlue';
import { MovesContributeRed } from './moves/MovesContributeRed';

import { useRound, type Round, useRewards, useContributions } from './ReadContracts';
import { ModalGameResult } from './modals/ModalGameResult';
import { useAccount } from 'wagmi';
import { MovesClaimRewards } from './moves/MovesClaimRewards';

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
  const { round, isSuccess, isLoading } = useRound()
  const {address} = useAccount()
  const {totalRewards, roundsWithRewards}  = useRewards(address)
  const {redContributions, blueContributions} = useContributions(round?.roundNumber, address)
  const [timer, setTimer] = useState('');
  const [redWidth, blueWidth] = calculateWidth(Number(round.totalRed), Number(round.totalBlue));
  console.log("rounds with rewards", roundsWithRewards)
  // Calculate the position of the timer
  const timerPosition = `${redWidth}%`;
  const total = Number(round.totalRed) + Number(round.totalBlue);
  const redChance = Number(round.totalRed) != 0 ? (Number(round.totalRed) / (Number(round.totalRed) + Number(round.totalBlue))) : 0;
  const blueChance = Number(round.totalBlue) != 0 ? 1 - redChance : 0;
  const redMultiplier = Number(round.totalRed) > 0 ? total / Number(round.totalRed) : 0;
  const blueMultiplier = Number(round.totalBlue) > 0 ? total / Number(round.totalBlue) : 0;
  const redRewardIfWin = Number(redContributions) * redMultiplier;
  const blueRewardIfWin = Number(blueContributions) * blueMultiplier;
  console.log('redMultiplier', redMultiplier)
  console.log('blueMultiplier', blueMultiplier)

  useEffect(() => {
    const interval = setInterval(() => {
        console.log('round', round)
      if (Number(round.endTime) > 0) {
        const now = Date.now()/1000;
        const remainingTime = Math.max(0, Number(round.endTime) - now);
        console.log('remainingTime', remainingTime)
        setTimer(new Date(remainingTime * 1000).toISOString().substr(11, 8));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [round.endTime]);

  return (
    <div className="container">
      <ModalGameResult />
      <div className="red" style={{ width: `${redWidth}%` }}>
        <h1>{formatEther(round.totalRed ?? BigInt(0))} ETH</h1>
        <MovesContributeRed />
        <p>Your contributions: {formatEther(redContributions ?? BigInt(0))} ETH</p>
        <p>Multiplier: {redMultiplier}X</p>
        {redContributions > 0 && <p>Rewards if win: {formatEther(BigInt(redRewardIfWin))} ETH</p>}
        <p>Red's chance of winning: {Math.round(redChance * 100)}%</p>
      </div>
      <div className="blue" style={{ width: `${blueWidth}%` }}>
        <h1>{formatEther(round.totalBlue ?? BigInt(0))} ETH</h1>
        <MovesContributeBlue />
        <p>Your contributions: {formatEther(blueContributions ?? BigInt(0))} ETH</p>
        <p>Multiplier: {blueMultiplier}X</p>
        {blueContributions > 0 && <p>Rewards if win: {formatEther(BigInt(blueRewardIfWin))} ETH</p>}
        <p>Blue's chance of winning: {Math.round(blueChance * 100)}%</p>
      </div>
      <div className="timer" style={{ left: timerPosition }}>
        <div>{timer}</div>
        <p style={{fontSize:"10px"}}>Rewards:{formatEther(totalRewards ?? BigInt(0))} ETH</p>
        <MovesClaimRewards address={address} />
        <MovesEndRound /> 
        </div>
      {/* <MovesEndRound /> */}
    </div>
  );
};

