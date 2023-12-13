import { 
    State, 
    UserInfo, 
    Round, 
    Color, 
    ColorTypes ,
    ColorsList,
    DataPoint,
    RoundState,
    PnL,
    DefaultPnLList,
} from "../types";
import { Event, EventType } from "../types/events";
import { useAccount, useContractReads } from 'wagmi'
import { colorClashContractConfig, redVsBlueContractConfig } from "../components/contracts";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { color } from "d3";

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
    //console.log("currentRoundNumber", data)
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
    //console.log("Total value deposited", data?.[0].result)
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
    //console.log(ColorTypes)
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
    //console.log("Colors hoping to find", data)
    let colors:{[colorTypes: number]: Color} = {}
    ColorsList.forEach((colorType: string | ColorTypes) => {
        const result = data?.[colorType as ColorTypes]?.result as bigint[] ?? [0, 0]
        //console.log("result", result)
        const value = Number(result[0] ?? 0)
        const supply = Number(result[1] ?? 0)
        colors[colorType as ColorTypes] = { value, supply }
    });
    //console.log("result colors", colors)
        

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
    //console.log("Colors price hoping to find", data)
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
    const intervalIdRef = useRef<NodeJS.Timer | null>(null);

    useEffect(() => {
        // Function to update the timer
        const updateTimer = () => {
            const now = Date.now();
            const timeTill = Math.max(endTime - Math.floor(now / 1000), 0);
            
            const minutes = Math.floor(timeTill / 60);
            const seconds = timeTill % 60;

            const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            setTimer(formattedTime);
        };

        // Clear any existing interval
        if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
        }

        // Set up a new interval if endTime is in the future
        if (endTime > 0) {
            updateTimer(); // Update immediately before the interval starts
            intervalIdRef.current = setInterval(updateTimer, 1000);
        } else {
            // If endTime is not in the future, set the timer to "0:00"
            setTimer('0:00');
        }

        // Cleanup function to clear the interval when the component unmounts or endTime changes
        return () => {
            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current);
            }
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
  
    //console.log('data', data)
  
    return {
      redContributions: data?.[0].result ?? BigInt(0),
      blueContributions: data?.[1].result ?? BigInt(0),
    }
  }

  export const getScalingFactor = (supply: number, value: number): number => {
    const xf = supply > 1 ? supply - 1 : 0;
    const originalValue = getPrice(1, xf)
    //console.log("price original value", originalValue)

    if (value == 0) {
      return 1;
    }

    const scalingFactor =  value / originalValue;
    //console.log("price value1 scaling factor", scalingFactor, value, originalValue)
    return scalingFactor == 0 ? 1 : scalingFactor;
  }
  export const getPrice = (supply: number, amount: number): number => {
    let sum1 = supply === 0 ? 0 : (supply - 1) * supply * (2 * (supply - 1) + 1) / 6;
    let sum2 = supply === 0 && amount === 1 ? 0 : (supply - 1 + amount) * (supply + amount) * (2 * (supply - 1 + amount) + 1) / 6;
    return (sum2 - sum1)/ 16000;
  }

  export const getAdjustedPrice = (supply: number, amount: number, scalingFactor: number): number => {
    const price = getPrice(supply, amount);
    //console.log("price before supply", supply);
    //console.log("price before amount", amount);
    //console.log("price before scaling factor", scalingFactor);
    //console.log("price before", price);
    return price * scalingFactor;
  }

export const useGetPriceHistory = (colorType: ColorTypes, events: Event[], blockRange: number[]): DataPoint[] => {
    let totalValue = 0;
    let totalSupply = 0;
    return events
    .reduce((acc:any, event:any) => {
        if(!event) {
            return acc;
        }
        if (event.type == "Trade" && event.color == colorType) {
            const timestamp = Number(event.timestamp);
            totalValue = Number(event.value) / 1e18;
            totalSupply = Number(event.supply);
    
            const scalingFactor = getScalingFactor(totalSupply, totalValue);
            const price = getAdjustedPrice(totalSupply, 1, scalingFactor);
            //console.log("price value1 supply", totalSupply);
            //console.log("price value1", totalValue);
            //console.log("price value1 scaling factor", scalingFactor)
            //console.log("price value1 price", price);
    
            acc.push({
                date: new Date(timestamp * 1000),
                open: price  ?? 0,
                high: price  ?? 0,
                low: price  ?? 0,
                close: price  ?? 0,
            });
        } else if (event.type == "RoundColorDeduction" && event.color == colorType) {
            const timestamp = Number(event.timestamp);
            const scalingFactor = getScalingFactor(totalSupply, Number(event.value)/ 1e18);
            const price = getAdjustedPrice(totalSupply, 1, scalingFactor);

            acc.push({
                date: new Date(timestamp * 1000),
                open: price  ?? 0,
                high: price  ?? 0,
                low: price  ?? 0,
                close: price  ?? 0,            });
        } else if (event.type == "RoundEnded" && event.winner == colorType) {
            const timestamp = Number(event.timestamp);
            const scalingFactor = getScalingFactor(totalSupply, Number(event.value)/ 1e18);
            const price = getAdjustedPrice(totalSupply, 1, scalingFactor);

            acc.push({
                date: new Date(timestamp * 1000),
                open: price  ?? 0,
                high: price  ?? 0,
                low: price  ?? 0,
                close: price  ?? 0,
            });
        }
        return acc;
    }, [])

}

export const useGetPnL = (address: string, events: Event[]): {[colorTypes: number]: PnL} => {
    console.log("calling event length", events.length)
    console.log("calling useGetPnL")
    const [pnlToReturn, setPnl] = useState<{[colorTypes: number]: PnL}>(Object.assign({}, DefaultPnLList));
    
    useEffect(() => {
        let pnl = JSON.parse(JSON.stringify(DefaultPnLList));
        console.log("initial pnl", DefaultPnLList)

        let localSupplyForColor : {[colorTypes: number]: number} = JSON.parse(JSON.stringify({ 
            [ColorTypes.Red]: 0,
            [ColorTypes.Blue]: 0,
            [ColorTypes.Green]: 0,
            [ColorTypes.Yellow]: 0,
            [ColorTypes.Indigo]: 0,
            [ColorTypes.Orange]: 0,
            [ColorTypes.Violet]: 0,
        }))
        console.log("initial local supply", localSupplyForColor)
        let localValueForColor : {[colorTypes: number]: number} = JSON.parse(JSON.stringify({
            [ColorTypes.Red]: 0,
            [ColorTypes.Blue]: 0,
            [ColorTypes.Green]: 0,
            [ColorTypes.Yellow]: 0,
            [ColorTypes.Indigo]: 0,
            [ColorTypes.Orange]: 0,
            [ColorTypes.Violet]: 0,
        }))
        console.log("initial local value", localValueForColor)
    events.forEach((event:any) => {
        if(!event) {
            return;
        }
        if (event.type == "Trade"){
            const colorTraded = event.color;
            const isBuy = event.isBuy;
            const colorPnl = pnl[colorTraded];
            const value = Number(event.value) / 1e18;
            const ethAmount = Number(event.ethAmount) / 1e18;
            const totalValue = Number(event.value) / 1e18;
            const totalSupply = Number(event.supply);

            if(event.trader.toLowerCase() == address.toLowerCase()){
                if (isBuy) {
                    colorPnl.shareAmount += Number(event.shareAmount);
                    colorPnl.initialInvestmentValue += ethAmount;
                    console.log("calling eth amount", ethAmount)
                    console.log("calling new value", value)
                    localSupplyForColor[colorTraded] = Number(event.supply);
                    localValueForColor[colorTraded] = Number(event.value) / 1e18;
                } else {
                    const scalingFactor = getScalingFactor(localSupplyForColor[colorTraded], localValueForColor[colorTraded]);
                    const price = getAdjustedPrice(localSupplyForColor[colorTraded]-Number(event.shareAmount), Number(event.shareAmount), scalingFactor);

                    colorPnl.shareAmount -= Number(event.shareAmount);
                    colorPnl.initialInvestmentValue -= price;
                    console.log("calling eth amount supply", localSupplyForColor[colorTraded])
                    console.log("calling eth amount sell", price)

                    localSupplyForColor[colorTraded] -= Number(event.shareAmount);
                    localValueForColor[colorTraded] -= ethAmount;
                }

                console.log("calling color initial investment value", colorPnl.initialInvestmentValue)
            }

            //calculate price of shares held
            const blockNumber = Number(event.blockNumber);
            
    
            const scalingFactor = getScalingFactor(totalSupply, totalValue);
            const price = getAdjustedPrice(totalSupply-colorPnl.shareAmount, colorPnl.shareAmount, scalingFactor);


            if (isBuy) {
                colorPnl.currentInvestmentValue = price;
                colorPnl.roi = (colorPnl.currentInvestmentValue - colorPnl.initialInvestmentValue) / colorPnl.initialInvestmentValue;
            } else {
                colorPnl.currentInvestmentValue = price;
                colorPnl.roi = (colorPnl.currentInvestmentValue - colorPnl.initialInvestmentValue) / colorPnl.initialInvestmentValue;
            }
            colorPnl.totalSupply = totalSupply;
            console.log("color current investment value", price)

            if(Number.isNaN(colorPnl.roi) || colorPnl.roi == Infinity) {
                colorPnl.roi = 0;
            }

        }else if (event.type == "RoundColorDeduction"){
            const colorTraded = event.color;
            const colorPnl = pnl[colorTraded];
            const totalValue = Number(event.value) / 1e18;
            const totalSupply = colorPnl.totalSupply;

            const scalingFactor = getScalingFactor(totalSupply, totalValue);
            const price = getAdjustedPrice(totalSupply-colorPnl.shareAmount, colorPnl.shareAmount, scalingFactor);

            colorPnl.currentInvestmentValue = price;
            colorPnl.roi = (colorPnl.currentInvestmentValue - colorPnl.initialInvestmentValue) / colorPnl.initialInvestmentValue;

            if(Number.isNaN(colorPnl.roi) || colorPnl.roi == Infinity) {
                colorPnl.roi = 0;
            }
        } else if (event.type == "RoundEnded"){
            const colorTraded = event.winner;
            const colorPnl = pnl[colorTraded];
            const totalValue = Number(event.value) / 1e18;
            const totalSupply = colorPnl.totalSupply;
            const scalingFactor = getScalingFactor(totalSupply, totalValue);
            const price = getAdjustedPrice(totalSupply-colorPnl.shareAmount, colorPnl.shareAmount, scalingFactor);

            colorPnl.currentInvestmentValue = price;
            colorPnl.roi = (colorPnl.currentInvestmentValue - colorPnl.initialInvestmentValue) / colorPnl.initialInvestmentValue;

            if(Number.isNaN(colorPnl.roi) || colorPnl.roi == Infinity) {
                colorPnl.roi = 0;
            }
        }
        
    })
    setPnl(Object.assign({}, pnl));
    console.log("calling local supply", localSupplyForColor)
    }, [events, address])

    return pnlToReturn;
}

export const useGetEventHistory = (): Event[] => {
    return [
        {

            type: EventType.RoundStarted,
            blockNumber: 0,
            round: 0,
            startTime: 0,
            endTime: 0,
        },
        {
            type: EventType.RoundColorDeduction,
            blockNumber: 0,
            roundNumber: 0,
            color: ColorTypes.Red,
            deduction: 0,
        },
        {
            type: EventType.RoundEnded,
            blockNumber: 0,
            roundNumber: 0,
            status: RoundState.Finished,
            winner: ColorTypes.Red,
            reward: 0,
        },
    ]
}

export const useGetColorEventHistory = (colorType: ColorTypes, events: Event[] | any[]): Event[] => {
    return events.filter((event) => {
        if(!event) {
            return false;
        }
        if (event.type == "Trade" && event.color == colorType) {
            return true;
        }
        if (event.type == "RoundColorDeduction" && event.color == colorType) {
            return true;
        }
        if (event.type == "RoundEnded" && event.winner == colorType) {
            return true;
        }
        return false;
    }).reverse();
}
