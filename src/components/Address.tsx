'use client'
import Blockies from "react-blockies"
import { ColorTypeToHex, UserInfo } from "../types"

const truncateAddress = (address: string) => {
    console.log("ass",address)
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function Address({ address = "" }: { address: string }) {
  return (
    <div style={{display:"flex", flexDirection:"row", gap:"2px"}}>
        <Blockies
            seed={address} 
            size={5} 
            scale={5} 
            className="identicon" 
        />
        <p style={{textDecoration:"underline"}} className="small-p">{truncateAddress(address)}</p>
    </div>
  )
}
