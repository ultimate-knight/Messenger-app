import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId:v.string(),
    text:v.string(),
    createdAt:v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
        conversationId: args.conversationId,
    senderId:args.senderId,
    text:args.text,
    createdAt:Date.now()
    });
  },
});

// export const getMessages = query({
//   handler: async (ctx) => {
//     return await ctx.db.query("messages").order("desc").collect();
//   },
// });


export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .filter((q) =>
        q.eq(q.field("conversationId"), args.conversationId)
      )
      .order("asc")
      .collect();

    const messagesWithSender = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId as any);
        return {
          ...message,
          sender,
        };
      })
    );

    return messagesWithSender;
  },
});
