import { 
    State, 
    UserInfo, 
    Round, 
    Color, 
    ColorTypes 
} from "../types";
import { useAccount, useContractReads } from 'wagmi'
import { colorClashContractConfig } from "../components/contracts";
import { useMemo } from "react";

export const useState = (): State => {
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

export const useUserInfo = (): UserInfo => {
    const { address } = useAccount();
    const contracts = useMemo(() => {
        return Object.values(ColorTypes).map((colorType) => ({
            ...colorClashContractConfig,
            functionName: 'colorSharesBalance',
            args: [colorType, address],
        }))
    }, [address])
    const { data } = useContractReads({
        contracts,
        watch: true,
    })
    
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
    const contracts = useMemo(() => {
        return Object.values(ColorTypes).map((colorType) => ({
            ...colorClashContractConfig,
            functionName: 'colors',
            args: [BigInt(colorType)],
        }))
    }, [])

    const { data, isSuccess, isLoading } = useContractReads({
        contracts,
        watch: true,
    })
    let colors:  {[colorTypes: number]: Color} = {}
    Object.values(ColorTypes).forEach((colorType: string | ColorTypes) => {
        const result = data?.[colorType as ColorTypes]?.result as bigint[] || undefined;
        const value = Number(result[0] ?? 0)
        const supply = Number(result[1] ?? 0)
        colors[colorType as ColorTypes] = { value, supply }
    });
    return colors
}

export const useColorsPrice = (): {[colorTypes: number]: number} => {
    const contracts = useMemo(() => {
        return Object.values(ColorTypes).map((colorType) => ({
            ...colorClashContractConfig,
            functionName: 'getBuyPrice',
            args: [BigInt(colorType)],
        }))
    }, [])

    const { data, isSuccess, isLoading } = useContractReads({
        contracts,
        watch: true,
    })
    let colorsPrice:  {[colorTypes: number]: number} = {}
    Object.values(ColorTypes).forEach((colorType: string | ColorTypes) => {
        const result = data?.[colorType as ColorTypes]?.result as bigint || undefined;
        const price = Number(result ?? 0)
        colorsPrice[colorType as ColorTypes] = price
    });
    return colorsPrice
}
