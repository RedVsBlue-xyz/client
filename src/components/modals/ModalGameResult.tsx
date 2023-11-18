'use client'

import { useState } from 'react'
import type { Log } from 'viem'
import { useContractEvent } from 'wagmi'

import { redVsBlueContractConfig } from '../contracts'
import { stringify } from '../../utils/stringify'

// Custom Modal Component
const Modal = ({ isVisible, onClose, children }: {isVisible: boolean, onClose: any, children: any[] }) =>{
  if (!isVisible) return null;

  return (
    <div style={{
        width: "50%",
      position: 'fixed', top: '50%', left: '50%', 
      transform: 'translate(-50%, -50%)', zIndex: 1000,
      background: 'white', padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    }}>
      <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px' }}>Close</button>
      {children}
    </div>
  );
};

export function ModalGameResult() {
  const [roundEnded, setRoundEnded] = useState<Log[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useContractEvent({
    ...redVsBlueContractConfig,
    eventName: 'RoundEnded',
    listener: (logs) => {
      setRoundEnded((prevLogs) => [...prevLogs, ...logs]);
      setIsModalVisible(true); // Show modal on new event
    },
  });

  // Function to close the modal
  const closeModal = () => setIsModalVisible(false);

  return (
    <>
      <Modal isVisible={isModalVisible} onClose={closeModal}>
        <h2>Round Ended Event</h2>
        <p>{roundEnded.length > 0 ? stringify(roundEnded[roundEnded.length - 1]) : 'No events yet.'}</p>
      </Modal>
    </>
  )
}
