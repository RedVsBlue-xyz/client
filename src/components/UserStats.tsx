'use client'

import { UserInfo } from "../types"

const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function UserStats({ userInfo }: { userInfo: UserInfo }) {
  return (
    <div className="stats">
        <div style={{display:"flex", flexDirection:"column", justifyContent:"space-evenly"}}>
            <p style={{textDecoration:"underline"}} className="small-p">Address</p>
            <p className="small-p">{truncateAddress(userInfo.address)}</p>
        </div>
        <div style={{display:"flex", flexDirection:"column", justifyContent:"space-evenly"}}>
            <p style={{textDecoration:"underline"}} className="small-p">Balance</p>
            <p className="small-p">{truncateAddress(userInfo.address)}</p>
        </div>
    </div>
  )
}
