import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


export const markAsSeen=mutation({
    args:{
        conversationId:v.id("conversations"),
        userId:v.id("users"),
    },

    handler:async (ctx,args)=>{
        const existing=await ctx.db.query("lastSeen").withIndex("by_conversation_user",(q)=>q.eq("conversationId",args.conversationId).eq("userId",args.userId)).first();
        if(existing){
            await ctx.db.patch(existing._id,{lastSeenTime:Date.now()});
        }else{
            await ctx.db.insert("lastSeen",{
                conversationId:args.conversationId,
                userId:args.userId,
                lastSeenTime:Date.now()
            });
        }
    }
})


export const getUnreadCount=query({
    args:{
        conversationId:v.id("conversations"),
        userId:v.id("users")
    },

    handler:async (ctx,args)=>{
        const seen=await ctx.db.query("lastSeen").withIndex("by_conversation_user",(q)=>q.eq("conversationId",args.conversationId).eq("userId",args.userId)).first()

        const lastSeenTime=seen?.lastSeenTime ?? 0;

        const unreadMessages=await ctx.db.query("messages").filter((q)=>q.and(
            q.eq(q.field("conversationId"),args.conversationId),
            q.gt(q.field("createdAt"),lastSeenTime),
            q.neq(q.field("senderId"),args.userId)
        )).collect()

        return unreadMessages.length
    }
})