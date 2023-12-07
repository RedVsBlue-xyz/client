'use client'
import Blockies from "react-blockies"
import { ColorTypeToHex, ColorTypes, PnL, UserInfo } from "../types"
import { useAppSelector } from "../store"
import { useGetPnL } from "../hooks/state"
import { get } from "http"

const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const genPnLElement = (pnl: PnL) => {
    const isNegative = pnl.roi < 0;
    const colorInHex = isNegative ? ColorTypeToHex[ColorTypes.Red] : ColorTypeToHex[ColorTypes.Green];
    const sign = isNegative ? "-" : "+";
    const inPercent = pnl.roi * 100;

    return (
        <p 
            style={{color:colorInHex}}
            className="small-p"
        >
            {sign}{Math.abs(inPercent).toFixed(2)}%
        </p>
    )
}

export function UserStats({ userInfo }: { userInfo: UserInfo }) {
    const events = useAppSelector((state: any) => state.events.events);
    const pnl: any = useGetPnL(userInfo.address, events);

    //Create an array of <p> elements for each user.colorSharesBalance:{[colorTypes: number]: number},
    const colorSharesBalance = Object.entries(userInfo.colorSharesBalance).map(([key, value]) => {
        return (
            <div key={key} style={{display:"flex", flexDirection:"column"}}>
                <p className="small-p" style={{margin:"1px"}}>
                    <div style={{backgroundColor:ColorTypeToHex[key]}} className="square"></div>x{value}
                </p>
                {genPnLElement(pnl[key])}
            </div>
            
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
