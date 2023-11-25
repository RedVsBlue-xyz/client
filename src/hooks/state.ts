import { 
    State, 
    UserInfo, 
    Round, 
    Color, 
    ColorTypes ,
    ColorsList,
    DataPoint,
    RoundState,
} from "../types";
import { Event, EventType } from "../types/events";
import { useAccount, useContractReads } from 'wagmi'
import { colorClashContractConfig, redVsBlueContractConfig } from "../components/contracts";
import { useEffect, useMemo, useState } from "react";

export const useGameState = (): State => {
    const gameEndTime = useGameEndTime()
    const currentRoundNumber = useCurrentRoundNumber()
    const round = useRound()
    const totalValueDeposited = useTotalValueDeposited()
    const colors = useColors()
    const colorsPrice = useColorsPrice()
    return {
        gameEndTime,
        currentRoundNumber,
        round,
        totalValueDeposited,
        colors,
        colorsPrice,
    }
}

export const useUserInfo = (address: string | undefined): UserInfo => {
    const contracts = useMemo(() => {
        return ColorsList.map((colorType) => ({
            ...colorClashContractConfig,
            functionName: 'colorSharesBalance',
            args: [colorType, address as string],
        }))
    }, [address])
    const { data, isSuccess, isLoading } = useContractReads({
        contracts,
        watch: true,
    });
    let colorSharesBalance:  {[colorTypes: number]: number} = {}
    ColorsList.forEach((colorType: string | ColorTypes) => {
        const result = data?.[colorType as ColorTypes]?.result as bigint || undefined;
        const balance = Number(result ?? 0)
        colorSharesBalance[colorType as ColorTypes] = balance
    });
    return {
        address: address ?? '',
        colorSharesBalance,
    }

}

export const useGameEndTime = (): number => {
    const { data, isSuccess, isLoading } = useContractReads({
        contracts: [{
            ...colorClashContractConfig,
            functionName: 'gameEndTime',
        }],
        watch: true,
    })
    return Number(data?.[0].result ?? 0)
}

export const useCurrentRoundNumber = (): number => {
    const { data, isSuccess, isLoading } = useContractReads({
        contracts: [{
            ...colorClashContractConfig,
            functionName: 'currentRound',
        }],
        watch: true,
    })
    console.log("currentRoundNumber", data)
    return Number(data?.[0].result ?? 0)
}

export const useTotalValueDeposited = (): number => {
    const { data, isSuccess, isLoading } = useContractReads({
        contracts: [{
            ...colorClashContractConfig,
            functionName: 'totalValueDeposited',
        }],
        watch: true,
    })
    console.log("Total value deposited", data?.[0].result)
    return Number(data?.[0].result ?? 0)
}


export const useRound = (): Round => {
    const currentRoundNumber = useCurrentRoundNumber()
    const { data, isSuccess, isLoading } = useContractReads({
        contracts: [{
            ...colorClashContractConfig,
            functionName: 'rounds',
            args: [BigInt(currentRoundNumber)],
        }],
        watch: true,
    });

    return {
        ended: data?.[0].result?.[0] ?? false,
        status: data?.[0].result?.[1] ?? 0, // RoundState.None
        winner: data?.[0].result?.[2] ?? 0, // ColorTypes.None
        vrfRequestStatus: {
            requestId: Number(data?.[0].result?.[3].requestId ?? 0),
            paid: Number(data?.[0].result?.[3].paid ?? 0),
            randomWords: (data?.[0].result?.[3].randomWords ?? []).map(Number),
        }
    }
}

export const useColors = (): {[colorTypes: number]: Color} => {
    console.log(ColorTypes)
    const contracts = useMemo(() => {
        return ColorsList.map((colorType) => ({
            ...colorClashContractConfig,
            functionName: 'colors',
            args: [colorType],
        }))
    }, [])

    const { data, isSuccess, isLoading } = useContractReads({
        contracts,
        watch: true,
    })
    console.log("Colors hoping to find", data)
    let colors:{[colorTypes: number]: Color} = {}
    ColorsList.forEach((colorType: string | ColorTypes) => {
        const result = data?.[colorType as ColorTypes]?.result as bigint[] ?? [0, 0]
        console.log("result", result)
        const value = Number(result[0] ?? 0)
        const supply = Number(result[1] ?? 0)
        colors[colorType as ColorTypes] = { value, supply }
    });
    console.log("result colors", colors)
        

    return colors;
}

export const useColorsPrice = (): {[colorTypes: number]: number} => {
    const contracts = useMemo(() => {
        return ColorsList.map((colorType) => ({
            ...colorClashContractConfig,
            functionName: 'getBuyPrice',
            args: [Number(colorType), BigInt(1)],
        }))
    }, [])

    const { data, isSuccess, isLoading } = useContractReads({
        contracts,
        watch: true,
    })
    console.log("Colors price hoping to find", data)
    let colorsPrice:  {[colorTypes: number]: number} = {}
    ColorsList.forEach((colorType: string | ColorTypes) => {
        const result = data?.[colorType as ColorTypes]?.result as bigint || undefined;
        const price = Number(result ?? 0)
        colorsPrice[colorType as ColorTypes] = price
    });
    return colorsPrice
}


export const useTimeTill = (endTime: number): string => {
    const [timer, setTimer] = useState<string>('0:00');
    const [intervalId, setIntervalId] = useState<NodeJS.Timer>();

    useEffect(() => {
        if (endTime > 0) {
            const id = setInterval(() => {
                const now = Date.now();
                const timeTill = Math.max(endTime - Math.floor(now / 1000), 0);
                
                const minutes = Math.floor(timeTill / 60);
                const seconds = timeTill % 60;

                const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
                setTimer(formattedTime);
            }, 1000);
            setIntervalId(id);
        }
        return () => {
            clearInterval(intervalId);
        };
    }, [endTime]);

    return timer;
};


export const useColorBuyPrice = (colorType: ColorTypes, amount: number): {price: number, priceAfterFees: number} => {
    const { data, isSuccess, isLoading } = useContractReads({
        contracts: [
            {
                ...colorClashContractConfig,
                functionName: 'getBuyPrice',
                args: [Number(colorType), BigInt(amount)],
            },
            {
                ...colorClashContractConfig,
                functionName: 'getBuyPriceAfterFee',
                args: [Number(colorType), BigInt(amount)],
            }
        ],
        watch: true,
    })
    const price = Number(data?.[0].result ?? BigInt(0))
    const priceAfterFees = Number(data?.[1].result ?? BigInt(0))
    return { price, priceAfterFees }
}

export const useColorSellPrice = (colorType: ColorTypes, amount: number): {price: number, priceAfterFees: number} => {
    const { data, isSuccess, isLoading } = useContractReads({
        contracts: [
            {
                ...colorClashContractConfig,
                functionName: 'getSellPrice',
                args: [Number(colorType), BigInt(amount)],
            },
            {
                ...colorClashContractConfig,
                functionName: 'getSellPriceAfterFee',
                args: [Number(colorType), BigInt(amount)],
            }
        ],
        watch: true,
    })
    const price = Number(data?.[0].result ?? BigInt(0))
    const priceAfterFees = Number(data?.[1].result ?? BigInt(0))
    return { price, priceAfterFees }
}

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



export const useGetPriceHistory = (colorType: ColorTypes): DataPoint[] => {
    return [
        {x: 0, y: 0},
        {x: 1, y: 1},
        {x: 2, y: 2},
        {x: 3, y: 3},
        {x: 4, y: 4},
        {x: 5, y: 5},
    ]
}

export const useGetEventHistory = (): Event[] => {
    return [
        {

            type: EventType.RoundStarted,
            timestamp: 0,
            round: 0,
            startTime: 0,
            endTime: 0,
        },
        {
            type: EventType.RoundColorDeduction,
            timestamp: 0,
            roundNumber: 0,
            color: ColorTypes.Red,
            deduction: 0,
        },
        {
            type: EventType.RoundEnded,
            timestamp: 0,
            roundNumber: 0,
            status: RoundState.Finished,
            winner: ColorTypes.Red,
            reward: 0,
        },
    ]
}

export const useGetColorEventHistory = (colorType: ColorTypes): Event[] => {
    return [
        {
            type: EventType.RoundStarted,
            timestamp: 0,
            round: 0,
            startTime: 0,
            endTime: 0,
        },
        {
            type: EventType.RoundColorDeduction,
            timestamp: 0,
            roundNumber: 0,
            color: ColorTypes.Red,
            deduction: 0,
        },
        {
            type: EventType.RoundEnded,
            timestamp: 0,
            roundNumber: 0,
            status: RoundState.Finished,
            winner: ColorTypes.Red,
            reward: 0,
        },
    ]
}
