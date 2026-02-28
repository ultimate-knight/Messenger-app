

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const conversationer = mutation({
  args: {
    userId1: v.id("users"),
    userId2: v.id("users"),
  },
  handler: async (ctx, args) => {
    const sortedParticipants = [args.userId1, args.userId2].sort();

    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_particpants", (q) =>
        q.eq("particpantId", sortedParticipants)
      )
      .unique();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("conversations", {
      particpantId: sortedParticipants,
    });
  },
});

export const getconversationbyId = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId);
  },
});

export const getConversationWithLastMessage = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // ✅ Get ALL users except current user
    const allUsers = await ctx.db.query("users").collect();
    const otherUsers = allUsers.filter((u) => u._id !== args.userId);

    // ✅ Get all conversations once
    const allConversations = await ctx.db.query("conversations").collect();

    const result = await Promise.all(
      otherUsers.map(async (otherUser) => {
        // Find conversation between current user and this user
        const conversation = allConversations.find(
          (c) =>
            c.particpantId.includes(args.userId) &&
            c.particpantId.includes(otherUser._id)
        );

        // Get last message if conversation exists
        let lastmessage = null;
        if (conversation) {
          const messages = await ctx.db
            .query("messages")
            .filter((q) => q.eq(q.field("conversationId"), conversation._id))
            .order("desc")
            .take(1);
          lastmessage = messages[0] ?? null;
        }

        return {
          conversationId: conversation?._id ?? null,
          otherUser,
          lastmessage,
        };
      })
    );

    // Sort — users with recent messages first
    return result.sort((a, b) => {
      const timeA = a.lastmessage?.createdAt ?? 0;
      const timeB = b.lastmessage?.createdAt ?? 0;
      return timeB - timeA;
    });
  },
});