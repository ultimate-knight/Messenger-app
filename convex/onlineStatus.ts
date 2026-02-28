import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


export const setOnline=mutation({
    args:{
        userId:v.id("users"),
        isOnline:v.boolean()
    },

    handler:async (ctx,args)=>{
        const existing=await ctx.db.query("onlineStatus").withIndex("by_userId",(q)=>q.eq("userId",args.userId)).first()

        if(existing){
            await ctx.db.patch(existing._id,{
                isOnline:args.isOnline,
                lastSeen:Date.now()
            })
        }else{
            await ctx.db.insert("onlineStatus",{
                userId:args.userId,
                isOnline:args.isOnline,
                lastSeen:Date.now()
            })
        }
    }

})


export const getOnlineStatus=query({
    args:{userId:v.id("users")},

    handler:async (ctx,args)=>{
        const status=await ctx.db.query("onlineStatus").withIndex("by_userId",(q)=>q.eq("userId",args.userId)).first()

        return status ?? null
    }
})