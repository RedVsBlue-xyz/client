'use client'

import { useContractReads } from 'wagmi'

import { redVsBlueContractConfig } from './contracts'
import { stringify } from '../utils/stringify'
import { useMemo } from 'react'

export const useCurrentRoundNumber = () => {
  const { data, isSuccess, isLoading } = useContractReads({
    contracts: [
      {
        ...redVsBlueContractConfig,
        functionName: 'currentRound',
      },
    ],
    watch: true,
  })
  return data?.[0].result ?? BigInt(0)
}

export const useGameEndTime = () => {
  const { data, isSuccess, isLoading } = useContractReads({
    contracts: [
      {
        ...redVsBlueContractConfig,
        functionName: 'gameEndTime',
      },
    ],
    watch: true,
  })
  return data?.[0].result ?? BigInt(0)
}

export const useRewards = (address: `0x${string}`) => {
  const currentRoundNumber = useCurrentRoundNumber();

  // Create an array of contracts, one for each round number
  const contracts = useMemo(() => {
    let temp = []
    for (let i = 0; i < currentRoundNumber; i++) {
      temp.push({
        ...redVsBlueContractConfig,
        functionName: 'rewards',
        args: [i, address],
      })
    }
    return temp
  }, [address, currentRoundNumber]);

  // Use useContractReads with the dynamically created contracts array
  const { data, isSuccess, isLoading } = useContractReads({
    contracts,
    watch: true,
  });

  // Calculate the total rewards
  const totalRewards = useMemo(() => {
    if (!data || !Array.isArray(data)) return 0;
    return data.reduce((acc, cur) => {
      return acc + Number(cur?.result ?? 0);
    }, 0);
  }, [data]);

  const roundsWithRewards = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data.map((round, index) => {
      if (round?.result === BigInt(0)) return null;
      return index;
    }
    ).filter((round) => round !== null);
  }
  , [data]);

  // You can return the necessary values here
  return { totalRewards, roundsWithRewards, isSuccess, isLoading };
};

export const useContributions = (round: bigint, address: `0x${string}`): { redContributions: bigint, blueContributions: bigint } => {
  const { data, isSuccess, isLoading } = useContractReads({
    contracts: [
      {
        ...redVsBlueContractConfig,
        functionName: 'redContributions',
        args: [round, address],
      },
      {
        ...redVsBlueContractConfig,
        functionName: 'blueContributions',
        args: [round, address],
      },
    ],
    watch: true,
  })

  console.log('data', data)

  return {
    redContributions: data?.[0].result ?? BigInt(0),
    blueContributions: data?.[1].result ?? BigInt(0),
  }
}


//export const useUnclaimedRounds = (): { isSuccess : boolean, isLoading : boolean, rounds : bigint[] } => {


export enum RoundState {
  None,
  Open,
  FetchingRandomNumber,
  RedWins,
  BlueWins
}

export interface Round {
  endTime?: bigint;
  roundNumber?: bigint;
  totalRed?: bigint;
  totalBlue?: bigint;
  ended?: boolean;
  status?: RoundState;
}

export interface ClientInfo {
  rewards?: bigint;
  redBalance?: bigint;
  blueBalance?: bigint;
}

export const useRound = (): { isSuccess : boolean, isLoading : boolean, round : Round } => {
  const endTime = useGameEndTime()
  const roundNumber = useCurrentRoundNumber()

  const { data, isSuccess, isLoading } = useContractReads({
    contracts: [
      {
        ...redVsBlueContractConfig,
        functionName: 'rounds',
        args: [roundNumber],
      },
    ],
    watch: true,
  })

  const result = data?.[0].result;

  return {
    isSuccess,
    isLoading,
    round: {
      endTime: endTime,
      roundNumber: roundNumber,
      totalRed: result?.[0],
      totalBlue: result?.[1],
      ended: result?.[2],
      status: result?.[3]
    }
  }
}


export function ReadContracts() {
  const { round, isSuccess, isLoading } = useRound()

  return (
    <div>
      <div>Data:</div>
      {isLoading && <div>loading...</div>}
      {isSuccess &&
         <pre key={stringify(round)}>{stringify(round)}</pre>}
    </div>
  )
}
