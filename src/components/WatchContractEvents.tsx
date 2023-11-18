'use client'

import { useState } from 'react'
import type { Log } from 'viem'
import { useContractEvent } from 'wagmi'

import { redVsBlueContractConfig } from './contracts'
import { stringify } from '../utils/stringify'

export function WatchContractEvents() {
  const [fetchingRandomNumberLogs, setFetchingRandomNumberLogs] = useState<Log[]>([]);
  useContractEvent({
    ...redVsBlueContractConfig,
    eventName: 'FetchingRandomNumber',
    listener: (logs) => setFetchingRandomNumberLogs((x) => [...x, ...logs]),
  })

  const [randomNumberReceivedLogs, setRandomNumberReceivedLogs] = useState<Log[]>([]);
  useContractEvent({
    ...redVsBlueContractConfig,
    eventName: 'RandomNumberReceived',
    listener: (logs) => setRandomNumberReceivedLogs((x) => [...x, ...logs]),
  })

  const [roundStarted, setRoundStarted] = useState<Log[]>([]);
  useContractEvent({
    ...redVsBlueContractConfig,
    eventName: 'RoundStarted',
    listener: (logs) => setRoundStarted((x) => [...x, ...logs]),
  })

  const [roundEnded, setRoundEnded] = useState<Log[]>([]);
  useContractEvent({
    ...redVsBlueContractConfig,
    eventName: 'RoundEnded',
    listener: (logs) => setRoundEnded((x) => [...x, ...logs]),
  })

  const [contribution, setContribution] = useState<Log[]>([]);
  useContractEvent({
    ...redVsBlueContractConfig,
    eventName: 'Contribution',
    listener: (logs) => setContribution((x) => [...x, ...logs]),
  })

  return (
    <div>
      <details>
        <summary>{fetchingRandomNumberLogs.length} Fetching Random Number</summary>
        {fetchingRandomNumberLogs
          .reverse()
          .map((log) => stringify(log))
          .join('\n\n\n\n')}
      </details>

      <details>
        <summary>{randomNumberReceivedLogs.length} Random Number Recieved</summary>
        {randomNumberReceivedLogs
          .reverse()
          .map((log) => stringify(log))
          .join('\n\n\n\n')}
      </details>

      <details>
        <summary>{roundStarted.length} Round Started</summary>
        {roundStarted
          .reverse()
          .map((log) => stringify(log))
          .join('\n\n\n\n')}
      </details>

      <details>
        <summary>{roundEnded.length} Round Ended</summary>
        {roundEnded
          .reverse()
          .map((log) => stringify(log))
          .join('\n\n\n\n')}
      </details>

      <details>
        <summary>{contribution.length} User Contribution</summary>
        {contribution
          .reverse()
          .map((log) => stringify(log))
          .join('\n\n\n\n')}
      </details>

      
    </div>
  )
}
