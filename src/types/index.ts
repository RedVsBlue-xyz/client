export enum ColorTypes {
    Red = 0,
    Orange,
    Yellow,
    Green,
    Blue,
    Indigo,
    Violet,
    None
}

export const ColorTypeToHex: any = {
    [ColorTypes.Red]: '#F34242',
    [ColorTypes.Orange]: '#ffa500',
    [ColorTypes.Yellow]: '#faeb36',
    [ColorTypes.Green]: '#79c314',
    [ColorTypes.Blue]: '#487de7',
    [ColorTypes.Indigo]: '#4b369d',
    [ColorTypes.Violet]: '#70369d',
    [ColorTypes.None]: '#FFFFFF',
}

export const ColorTypeToHexButton = {
    [ColorTypes.Red]: '#FF0000',
    [ColorTypes.Orange]: '#ffa500',
    [ColorTypes.Yellow]: '#faeb36',
    [ColorTypes.Green]: '#79c314',
    [ColorTypes.Blue]: '#0000FF',
    [ColorTypes.Indigo]: '#4b369d',
    [ColorTypes.Violet]: '#70369d',
    [ColorTypes.None]: '#FFFFFF',
}
  
export const ColorTypeToString: any = {
    [ColorTypes.Red]: 'Red',
    [ColorTypes.Orange]: 'Orange',
    [ColorTypes.Yellow]: 'Yellow',
    [ColorTypes.Green]: 'Green',
    [ColorTypes.Blue]: 'Blue',
    [ColorTypes.Indigo]: 'Indigo',
    [ColorTypes.Violet]: 'Violet',
    [ColorTypes.None]: 'None',
}

export const ColorsList = [
    ColorTypes.Red,
    ColorTypes.Orange,
    ColorTypes.Yellow,
    ColorTypes.Green,
    ColorTypes.Blue,
    ColorTypes.Indigo,
    ColorTypes.Violet,
]

export enum RoundState {
    None, // Round has not started
    Open, // Round is open for contributions
    FetchingRandomNumber, // Fetching random words
    Finished, // Random words received and winner determined
    NoContest // No color has any contributions
}

export interface VrfRequestStatus {
    requestId: number,
    paid: number,
    randomWords: number[]
}

export interface Round {
    ended: boolean,
    status: RoundState,
    winner: ColorTypes,
    vrfRequestStatus: VrfRequestStatus
}

export interface Color {
    value: number,
    supply: number
}

export interface State {
    gameEndTime: number,
    currentRoundNumber: number,
    round: Round,
    totalValueDeposited: number,
    colors: {[colorTypes: number]: Color},
    colorsPrice: {[colorTypes: number]: number},    
}

export interface UserInfo {
    address: string,
    colorSharesBalance: {[colorTypes: number]: number},
}

export interface DataPoint {
    date: Date,
    Open: number,
    High: number,
    Low: number,
    Close: number,
}

export interface PnL {
    roi: number,
    totalSupply: number,
    shareAmount: number,
    initialInvestmentValue: number,
    currentInvestmentValue: number,
}

export const DefaultPnLList: {[colorTypes: number]: PnL} = {
    [ColorTypes.Red]: {
        roi: 0,
        totalSupply: 0,
        shareAmount: 0,
        initialInvestmentValue: 0,
        currentInvestmentValue: 0,
    },
    [ColorTypes.Orange]: {
        roi: 0,
        totalSupply: 0,
        shareAmount: 0,
        initialInvestmentValue: 0,
        currentInvestmentValue: 0,
    },
    [ColorTypes.Yellow]: {
        roi: 0,
        totalSupply: 0,
        shareAmount: 0,
        initialInvestmentValue: 0,
        currentInvestmentValue: 0,
    },
    [ColorTypes.Green]: {
        roi: 0,
        totalSupply: 0,
        shareAmount: 0,
        initialInvestmentValue: 0,
        currentInvestmentValue: 0,
    },
    [ColorTypes.Blue]: {
        roi: 0,
        totalSupply: 0,
        shareAmount: 0,
        initialInvestmentValue: 0,
        currentInvestmentValue: 0,
    },
    [ColorTypes.Indigo]: {
        roi: 0,
        totalSupply: 0,
        shareAmount: 0,
        initialInvestmentValue: 0,
        currentInvestmentValue: 0,
    },
    [ColorTypes.Violet]: {
        roi: 0,
        totalSupply: 0,
        shareAmount: 0,
        initialInvestmentValue: 0,
        currentInvestmentValue: 0,
    },
    [ColorTypes.None]: {
        roi: 0,
        totalSupply: 0,
        shareAmount: 0,
        initialInvestmentValue: 0,
        currentInvestmentValue: 0,
    },
}



