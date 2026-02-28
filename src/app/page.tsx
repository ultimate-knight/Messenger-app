"use client"
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SearchIcon, ArrowLeftIcon, SendIcon } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";
import { formatMessageTime } from "../../utils/formatTime";
import UnreadBadge from "@/components/UnreadBadge";
import Onlinedot from "@/components/Onlinedot";

export default function Home() {
  const { user } = useUser();

  const [selectedConversation, setselectedConversation] = useState<Id<"conversations"> | null>(null);
  const [messageInput, setmessageInput] = useState<string>("");
  const [searchQuery, setsearchQuery] = useState<string>("");
  const [showSidebar, setShowSidebar] = useState<boolean>(true); // for mobile toggle

  const messageEndRef = useRef<HTMLDivElement>(null);
  const ContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setshowScrollButton] = useState<boolean>(false);
  const [Scrollup, setshowScrollup] = useState<boolean>(false);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const createConversation = useMutation(api.conversation.conversationer);
  const setOnline = useMutation(api.onlineStatus.setOnline);
  const setTyping = useMutation(api.typing.setTyping);
  const upserter = useMutation(api.users.upsertUser);
  const markAsSeen = useMutation(api.lastSeen.markAsSeen);
  const sendMessage = useMutation(api.messages.sendMessage);

  const allUsers = useQuery(api.users.getAllUsers);
  const CurrentUser = useQuery(api.users.getCurrentUser, user ? { clerkId: user.id } : "skip");
  const typingUsers = useQuery(api.typing.getTypingUsers, selectedConversation ? { conversationId: selectedConversation } : "skip");
  const messages = useQuery(api.messages.getMessages, selectedConversation ? { conversationId: selectedConversation } : "skip");
  const conversations = useQuery(api.conversation.getconversationbyId, selectedConversation ? { conversationId: selectedConversation } : "skip");
  const conversationeral = useQuery(api.conversation.getConversationWithLastMessage, CurrentUser?._id ? { userId: CurrentUser._id } : "skip");

  const filteredConversation = conversationeral?.filter((q) =>
    q.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const otherUserId = conversations?.particpantId?.find((id) => id !== CurrentUser?._id);
  const otherUser = useQuery(api.users.getUserById, otherUserId ? { userId: otherUserId } : "skip");
  const otherUserStatus = useQuery(api.onlineStatus.getOnlineStatus, otherUser?._id ? { userId: otherUser._id } : "skip");

  // Upsert user on login
  useEffect(() => {
    if (user) {
      upserter({
        clerkId: user.id,
        name: user.fullName ?? "Unknown",
        image: user.imageUrl,
      });
    }
  }, [user]);

  // Online/offline tracking
  useEffect(() => {
    if (!CurrentUser?._id) return;

    setOnline({ userId: CurrentUser._id, isOnline: true });

    const heartbeat = setInterval(() => {
      setOnline({ userId: CurrentUser._id!, isOnline: true });
    }, 30000);

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        setOnline({ userId: CurrentUser._id!, isOnline: false });
      } else {
        setOnline({ userId: CurrentUser._id!, isOnline: true });
      }
    };

    const handleUnload = () => {
      setOnline({ userId: CurrentUser._id!, isOnline: false });
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [CurrentUser?._id]);

  // Auto scroll
  useEffect(() => {
    if (!Scrollup) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      setshowScrollButton(true);
    }
  }, [messages]);

  const handleScroll = () => {
    const container = ContainerRef.current;
    if (!container) return;
    const isBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
    if (isBottom) {
      setshowScrollup(false);
      setshowScrollButton(false);
    } else {
      setshowScrollup(true);
    }
  };

  const scrolltoBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setshowScrollButton(false);
    setshowScrollup(false);
  };

  const handleChange = async (userId: Id<"users">) => {
    if (!CurrentUser?._id || !userId) return;
    const conversationId = await createConversation({
      userId1: userId,
      userId2: CurrentUser._id,
    });
    setselectedConversation(conversationId);
    setShowSidebar(false); // hide sidebar on mobile when chat opens

    await markAsSeen({
      conversationId,
      userId: CurrentUser._id,
    });
  };

  const handleSend = async () => {
    if (!selectedConversation || !messageInput || !CurrentUser?._id) return;

    await sendMessage({
      conversationId: selectedConversation as Id<"conversations">,
      senderId: CurrentUser._id,
      text: messageInput,
      createdAt: Date.now(),
    });

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    if (selectedConversation && CurrentUser?._id) {
      setTyping({ conversationId: selectedConversation, userId: CurrentUser._id, isTyping: false });
    }
    setmessageInput("");
  };

  return (
    <div className="flex flex-row h-screen overflow-hidden text-black bg-gray-100 font-sans">

      {/* ─── SIDEBAR ─── */}
      <div className={`
        bg-white w-full border-1 border-gray-200 md:w-[380px] md:min-w-[380px] h-full flex flex-col
        border-r border-gray-200 flex-shrink-0
        ${showSidebar ? "flex" : "hidden"} md:flex
      `}>

        {/* Sidebar Header */}
        <div className="flex flex-col px-5 pt-6 pb-3 gap-3 border-b border-gray-100">
          <p className="font-bold text-2xl">Messages</p>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setsearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-full text-sm outline-none"
              placeholder="Search conversations..."
            />
          </div>
        </div>

       

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-3">
          {filteredConversation === undefined ? (
            <p className="text-center text-gray-400 mt-10 text-sm">Loading...</p>
          ) : filteredConversation.length === 0 ? (
            <p className="text-center text-gray-400 mt-10 text-sm">
              {searchQuery ? "No results found" : "No conversations yet"}
            </p>
          ) : (
            filteredConversation.map((rex) => {
              const isSelected = selectedConversation === rex.conversationId;
              return (
                <div
                  onClick={() => handleChange(rex.otherUser?._id!)}
                  key={rex.conversationId ?? rex.otherUser?._id}
                  className={`flex items-center gap-3 p-3 rounded-xl mt-1 cursor-pointer transition-all ${
                    isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                >
                  {/* Avatar with online dot */}
                  <div className="relative  flex-shrink-0">
                    <img
                      src={rex.otherUser?.image}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <span className="absolute -top-2 -left-2">{rex.otherUser?._id && <Onlinedot  userId={rex.otherUser._id} />}</span>
                  </div>

                  {/* Name + last message */}
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <p className="font-semibold text-sm truncate">{rex.otherUser?.name}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {rex.lastmessage ? rex.lastmessage.text : "No messages yet"}
                    </p>
                  </div>

                  {/* Time + badge */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {rex.lastmessage && (
                      <p className="text-xs text-gray-400">{formatMessageTime(rex.lastmessage.createdAt)}</p>
                    )}
                    {rex.conversationId && CurrentUser?._id && (
                      <UnreadBadge conversationId={rex.conversationId} userId={CurrentUser._id} />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ─── CHAT PANEL ─── */}
      <div className={`
        flex flex-col flex-1 border-1 border-gray-200 bg-white h-full overflow-hidden
        ${!showSidebar ? "flex" : "hidden"} md:flex
      `}>

        {/* Chat Header */}
        {selectedConversation && otherUser ? (
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 bg-white flex-shrink-0">
            {/* Back button - mobile only */}
            <button
              onClick={() => setShowSidebar(true)}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 flex-shrink-0"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>

            <div className="relative flex-shrink-0">
              <img src={otherUser.image} className="w-10 h-10 rounded-full object-cover" />
              <span className="absolute -top-2 -left-2">{otherUser._id && <Onlinedot userId={otherUser._id} />}</span>
                
            </div>

            <div className="flex flex-col">
              <p className="font-semibold text-base">{otherUser.name}</p>
              {typingUsers && typingUsers.filter(t => t.userId !== CurrentUser?._id).length > 0 ? (
                <p className="text-xs text-blue-500">{otherUser.name} is typing...</p>
              ) : (
                <p className={`text-xs ${otherUserStatus?.isOnline ? "text-green-500" : "text-gray-400"}`}>
                  {otherUserStatus?.isOnline ? "Online" : "Offline"}
                </p>
              )}
            </div>
          </div>
        ) : (
          /* No conversation selected header placeholder */
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 bg-white flex-shrink-0 md:hidden">
            <button
              onClick={() => setShowSidebar(true)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
            <p className="font-semibold">Back</p>
          </div>
        )}

        {/* Messages Area */}
        <div
          ref={ContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto  px-4 py-4 flex flex-col gap-2"
        >
          {!selectedConversation ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <img src="/siguldo.jpeg" className="w-32 opacity-60" />
              <p className="text-xl font-bold text-gray-700">No conversation selected</p>
              <p className="text-sm text-gray-400">Select a chat from the sidebar to start messaging</p>
            </div>
          ) : messages === undefined ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <img src="/siguldo.jpeg" className="w-32 opacity-60" />
              <p className="text-lg font-bold text-gray-700">No messages yet</p>
              <p className="text-sm text-gray-400">Say hello! 👋</p>
            </div>
          ) : (
            messages.map((mes) => {
              const isme = mes.senderId === CurrentUser?._id;
              return (
                <div
                  key={mes._id}
                  className={`flex items-end gap-2 w-full ${isme ? "justify-end" : "justify-start"}`}
                >
                  {!isme && (
                    <img src={mes.sender?.image} className="w-7 h-7 rounded-full object-cover flex-shrink-0 mb-1" />
                  )}
                  <div className={`flex flex-col max-w-[65%] ${isme ? "items-end" : "items-start"}`}>
                    {!isme && (
                      <p className="text-xs font-semibold text-gray-500 mb-1 ml-1">{mes.sender?.name}</p>
                    )}
                    <div className={`px-4 py-2.5 rounded-2xl ${
                      isme
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-gray-100 text-black rounded-bl-sm"
                    }`}>
                      <p className="text-sm leading-relaxed">{mes.text}</p>
                    </div>
                    <p className={`text-[10px] mt-1 mx-1 ${isme ? "text-gray-400" : "text-gray-400"}`}>
                      {formatMessageTime(mes.createdAt)}
                    </p>
                  </div>
                  {isme && (
                    <img src={mes.sender?.image} className="w-7 h-7 rounded-full object-cover flex-shrink-0 mb-1" />
                  )}
                </div>
              );
            })
          )}

          {/* Typing indicator */}
          {typingUsers && typingUsers.filter(t => t.userId !== CurrentUser?._id).length > 0 && (
            <div className="flex items-center gap-2 px-2">
              <div className="flex gap-1 bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
              </div>
            </div>
          )}

          {/* Scroll target */}
          <div ref={messageEndRef} />
        </div>

        {/* New messages button */}
        {showScrollButton && (
          <div className="flex justify-center pb-2">
            <button
              onClick={scrolltoBottom}
              className="bg-blue-600 text-white text-sm px-5 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce"
            >
              ↓ New messages
            </button>
          </div>
        )}

        {/* Input Box */}
        <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-200 bg-white">
          <input
            value={messageInput}
            onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
            className="flex-1 bg-gray-100 text-black px-4 py-3 rounded-full text-sm outline-none"
            placeholder="Type a message..."
            onChange={(e) => {
              setmessageInput(e.target.value);
              if (selectedConversation && CurrentUser?._id) {
                setTyping({
                  conversationId: selectedConversation as Id<"conversations">,
                  userId: CurrentUser._id,
                  isTyping: true,
                });
              }
              if (typingTimeout.current) clearTimeout(typingTimeout.current);
              typingTimeout.current = setTimeout(() => {
                if (selectedConversation && CurrentUser?._id) {
                  setTyping({
                    conversationId: selectedConversation as Id<"conversations">,
                    userId: CurrentUser._id,
                    isTyping: false,
                  });
                }
              }, 2000);
            }}
          />
          <button
            onClick={handleSend}
            className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center  hover:bg-blue-700 transition"
          >
            <SendIcon className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}