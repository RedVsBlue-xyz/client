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

export const ColorTypeToHex = {
    [ColorTypes.Red]: '#FF0000',
    [ColorTypes.Orange]: '#FFA500',
    [ColorTypes.Yellow]: '#FFFF00',
    [ColorTypes.Green]: '#008000',
    [ColorTypes.Blue]: '#0000FF',
    [ColorTypes.Indigo]: '#4B0082',
    [ColorTypes.Violet]: '#EE82EE',
    [ColorTypes.None]: '#FFFFFF',
}

export const ColorTypeToString = {
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



