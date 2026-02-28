import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    conversationId:v.id("conversations"),
    senderId:v.string(),
    text:v.string(),
    createdAt:v.number(),
  }),
  users:defineTable({
    clerkId:v.string(),
    name:v.string(),
    image:v.string(),
  }),

  conversations:defineTable({
    particpantId:v.array(v.id("users")),
  }).index("by_particpants", ["particpantId"]),


  typingIndicators:defineTable({
     conversationId:v.id("conversations"),
     userId:v.id("users"),
     isTyping:v.boolean()


  }).index("by_conversation",["conversationId"]),


  lastSeen:defineTable({
    conversationId:v.id("conversations"),
    userId:v.id("users"),
    lastSeenTime:v.number(),
  }).index("by_conversation_user",["conversationId","userId"]),

  onlineStatus:defineTable({
    userId:v.id("users"),
    isOnline:v.boolean(),
    lastSeen:v.number()
  }).index("by_userId",["userId"])
});