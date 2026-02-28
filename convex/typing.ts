import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


export const setTyping=mutation({
    args:{
        conversationId:v.id("conversations"),
        userId:v.id("users"),
        isTyping:v.boolean(),
    },

    handler:async (ctx,args)=>{
        const existing=await ctx.db.query("typingIndicators").withIndex("by_conversation",(q)=>q.eq("conversationId",args.conversationId)).filter((q)=>q.eq(q.field("userId"),args.userId)).first()

        if(existing){
           await  ctx.db.patch(existing._id,{isTyping:args.isTyping})
        }else{
            await ctx.db.insert("typingIndicators",{
                conversationId:args.conversationId,
                userId:args.userId,
                isTyping:args.isTyping
            })
        }
    }
}
)


export const getTypingUsers=query({
    args:{
        conversationId:v.id("conversations")
    },

    handler:async (ctx,args)=>{
                return await ctx.db.query("typingIndicators").withIndex("by_conversation",(q)=>q.eq("conversationId",args.conversationId)).filter((q)=>q.eq(q.field("isTyping"),true)).collect()
    }
})