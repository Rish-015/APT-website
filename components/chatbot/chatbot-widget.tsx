"use client"

import { useState, useRef, useEffect } from "react"
import { Bot, X, Send, Minimize2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { getChatResponse } from "@/app/actions"
import { toast } from "sonner"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

const initialMessages: Message[] = [
  {
    id: "1",
    content: "Hello! I'm your AI farming assistant. How can I help you today? You can ask me about crops, weather, fertilizers, or any farming-related questions.",
    sender: "bot",
    timestamp: new Date(),
  },
]

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")

  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      // Format history for Gemini
      const history = messages.map(msg => ({
        role: msg.sender === "user" ? "user" as const : "model" as const,
        parts: [{ text: msg.content }]
      }));

      const response = await getChatResponse(input, history);

      if (response.error) {
        toast.error(response.error);
        if (response.content) {
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: response.content,
            sender: "bot",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, botMessage])
        }
      } else if (response.content) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.content,
          sender: "bot",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])
      }
    } catch (error) {
      console.error("Chat Error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsTyping(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110"
        aria-label="Open chat"
      >
        <Bot className="h-6 w-6" />
      </button>
    )
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex w-80 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl transition-all sm:w-96",
        isMinimized ? "h-14" : "h-[500px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3 text-primary-foreground">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <div>
            <h3 className="font-semibold">Agro Assistant</h3>
            {!isMinimized && (
              <p className="text-xs text-primary-foreground/80">Online</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="rounded p-1 hover:bg-primary-foreground/20"
            aria-label={isMinimized ? "Expand" : "Minimize"}
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded p-1 hover:bg-primary-foreground/20"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
            <div className="flex flex-col gap-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.sender === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground flex items-center gap-2 max-w-[85%] rounded-lg px-3 py-2 text-sm italic">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Agro Assistant is thinking...
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-border p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex items-center gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isTyping ? "Please wait..." : "Ask a question..."}
                className="flex-1"
                disabled={isTyping}
              />
              <Button type="submit" size="icon" disabled={isTyping || !input.trim()}>
                {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
