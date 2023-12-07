import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { Event } from '../../types/events'
import { decodeEventLog } from 'viem';
import { colorClashContractConfig } from '../../components/contracts';
import { arbitrumGoerli } from 'wagmi/chains';
import { publicClient } from '../../wagmi';
import { START_BLOCK } from '../../wagmi';

const contractStartBlock = 0;
const contractAddress = '0x000000000';

// First, create the thunk
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (blockNumber: number) => {
    const events = (await publicClient({chainId: arbitrumGoerli.id
    }).getLogs({
      fromBlock: START_BLOCK,
      address: colorClashContractConfig.address,
  
    })).map(log => {
      const decodedLog = decodeEventLog({
        abi: colorClashContractConfig.abi,
        topics: log.topics,
        data: log.data,
      })
      return {
        eventId: log.data + log.topics.join('') + log.blockNumber,
        type: decodedLog.eventName,
        blockNumber: log.blockNumber,
        ...decodedLog.args,
      }
    })
    //console.log("events", events)


    return events

    
  },
  
)


// Define the initial state using that type
interface EventsState {
    lastFetchedBlock: number;
    events: Event[]
}
const initialState: EventsState = {
    lastFetchedBlock: 0,
    events: [],
}

export const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEvents: (state, action) => {
        state.events = action.payload
    },
    addEvents: (state, action) => {
        state.events = state.events.concat(action.payload)
    },
    setLastFetchedBlock: (state, action) => {
        state.lastFetchedBlock = action.payload
    }
  },
  
})

// Action creators are generated for each case reducer function
export const { setEvents, setLastFetchedBlock, addEvents  } = eventSlice.actions

export default eventSlice.reducer