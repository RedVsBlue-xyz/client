'use client'
import Blockies from "react-blockies"
import { ColorTypeToHex, UserInfo } from "../types"

const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function UserStats({ userInfo }: { userInfo: UserInfo }) {
    //Create an array of <p> elements for each user.colorSharesBalance:{[colorTypes: number]: number},
    const colorSharesBalance = Object.entries(userInfo.colorSharesBalance).map(([key, value]) => {
        return (
            <p key={key} className="small-p" style={{margin:"1px"}}>
                <div style={{backgroundColor:ColorTypeToHex[key]}} className="square"></div>x{value}
                </p>
        )
    })
  return (
    <div className="stats">
        <div style={{display:"flex", flexDirection:"column", justifyContent:"start", gap:"7px"}}>
            <p style={{textDecoration:"underline"}} className="small-p">Address</p>
            <div style={{display:"flex", flexDirection:"row", gap:"0px"}}>
            <Blockies
                seed={userInfo.address} 
                size={5} 
                scale={5} 
                className="identicon" 
            />
                <p className="small-p">{truncateAddress(userInfo.address)}</p>
            </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "start", gap: "7px" }}>
    <p style={{ textDecoration: "underline" }} className="small-p">Your Balance</p>
    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
        {colorSharesBalance}
    </div>
</div>
    </div>
  )
}
