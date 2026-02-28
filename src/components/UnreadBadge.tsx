"use client"
import React from "react"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Id } from "../../convex/_generated/dataModel"


export default function UnreadBadge({conversationId,userId}:{conversationId:Id<"conversations">,userId:Id<"users">}){
        const count=useQuery(api.lastSeen.getUnreadCount,{
            conversationId,
            userId
        })

        if(!count || count===0) return null;

        return (
           <div className="bg-green-500 text-white ml-auto rounded-full aspect-square p-2 font-bold text-xs flex items-center justify-center">
                    <p>{count>99?"99+":count}</p>
           </div>
        )
}
