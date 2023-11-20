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
    colors: {[colorTypes: number]: Color}
    colorsPrice: {[colorTypes: number]: number}
}

export interface UserInfo {
    address: string,
    colorSharesBalance: {[colorTypes: number]: number},
}



