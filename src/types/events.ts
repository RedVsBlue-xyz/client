import { ColorTypes, RoundState } from ".";

export enum EventType {
    FetchingRandomNumber = 'FetchingRandomNumber',
    RandomNumberReceived = 'RandomNumberReceived',
    RoundStarted = 'RoundStarted',
    RoundColorDeduction = 'RoundColorDeduction',
    RoundEnded = 'RoundEnded',
    Trade = "Trade",
}

export interface BaseEvent {
    type: EventType;
    blockNumber: number;
}

export interface FetchingRandomNumber extends BaseEvent {
    type: EventType.FetchingRandomNumber;
    roundNumber: number;
}

export interface RandomNumberReceived extends BaseEvent {
    type: EventType.RandomNumberReceived;
    roundNumber: number;
    randomNumber: number;
}

export interface RoundStarted extends BaseEvent {
    type: EventType.RoundStarted;
    round: number;
    startTime: number;
    endTime: number;
}

export interface RoundColorDeduction extends BaseEvent {
    type: EventType.RoundColorDeduction;
    roundNumber: number;
    color: ColorTypes;
    deduction: number;
}

export interface RoundEnded extends BaseEvent {
    type: EventType.RoundEnded;
    roundNumber: number;
    status: RoundState;
    winner: ColorTypes;
    reward: number;
}

export interface Trade extends BaseEvent {
    type: EventType.Trade;
    trader: string;
    color: ColorTypes;
    isBuy: boolean;
    shareAmount: number;
    ethAmount: number;
    protocolEthAmount: number;
    supply: number;
    value: number;
}

export type Event = FetchingRandomNumber | RandomNumberReceived | RoundStarted | RoundColorDeduction | RoundEnded | Trade | BaseEvent;