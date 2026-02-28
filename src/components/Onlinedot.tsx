"use client"
import { api } from "../../convex/_generated/api"
import { useQuery } from "convex/react"
import { Id } from "../../convex/_generated/dataModel"


export default function Onlinedot({userId,}:{userId:Id<"users">}){
    const status=useQuery(api.onlineStatus.getOnlineStatus,{userId});

    if(!status?.isOnline) return null;

    return (
        <div className="absolute top-2 z-40 left-2 bg-green-700 border-2 border-white w-4 h-4 rounded-full">

        </div>
    )
}