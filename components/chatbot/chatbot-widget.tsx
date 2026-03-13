"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Bot, X, Send, Minimize2, Loader2, Mic, Volume2, VolumeX, Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { getChatResponse } from "@/app/actions"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

type Language = "en-IN" | "ta-IN" | "hi-IN"

const translations = {
  "en-IN": {
    title: "Agro Assistant",
    subtitle: "Voice & Multilingual Enabled",
    initial: "Hello! I'm your AI farming assistant. How can I help you today?",
    placeholder: "Ask in any language...",
    listening: "Listening...",
    thinking: "Thinking...",
    send: "Send",
    micLabel: "Start voice input",
    stopMicLabel: "Stop listening",
    langLabel: "Speaking:",
    wait: "Please wait..."
  },
  "ta-IN": {
    title: "அக்ரோ உதவியாளர்",
    subtitle: "குரல் மற்றும் பன்மொழி வசதி",
    initial: "வணக்கம்! நான் உங்கள் அக்ரோ உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
    placeholder: "எந்த மொழியிலும் கேளுங்கள்...",
    listening: "கவனித்தல்...",
    thinking: "சிந்திக்கிறது...",
    send: "அனுப்பு",
    micLabel: "குரல் உள்ளீட்டைத் தொடங்கு",
    stopMicLabel: "கவனிப்பதை நிறுத்து",
    langLabel: "பேசும் மொழி:",
    wait: "காத்திருக்கவும்..."
  },
  "hi-IN": {
    title: "एग्रो सहायक",
    subtitle: "आवाज और बहुभाषी सक्षम",
    initial: "नमस्ते! मैं आपका एग्रो सहायक हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?",
    placeholder: "किसी भी भाषा में पूछें...",
    listening: "सुन रहा हूँ...",
    thinking: "सोच रहा हूँ...",
    send: "भेजें",
    micLabel: "वॉयस इनपुट शुरू करें",
    stopMicLabel: "सुनना बंद करें",
    langLabel: "बोलने की भाषा:",
    wait: "कृपया प्रतीक्षा करें..."
  }
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("en-IN")
  
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  
  // Voice State
  const [isListening, setIsListening] = useState(false)
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true)
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  const t = translations[selectedLanguage]

  // Set initial message when language changes if messages is empty
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: "1",
        content: t.initial,
        sender: "bot",
        timestamp: new Date(),
      }])
    }
  }, [selectedLanguage, messages.length, t.initial])

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInput(transcript)
          setIsListening(false)
          setTimeout(() => handleSend(transcript), 500)
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech Recognition Error:", event.error)
          setIsListening(false)
          if (event.error !== "no-speech") {
            toast.error("Speech recognition error.")
          }
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
    }
  }, [])

  // Update recognition language when selection changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = selectedLanguage
    }
  }, [selectedLanguage])

  // Text to Speech
  const speak = useCallback((text: string) => {
    if (!isVoiceEnabled || typeof window === "undefined") return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = selectedLanguage
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(v => v.lang.startsWith(selectedLanguage.split('-')[0]))
    if (preferredVoice) utterance.voice = preferredVoice
    window.speechSynthesis.speak(utterance)
  }, [isVoiceEnabled, selectedLanguage])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
    } else {
      if (!recognitionRef.current) {
        toast.error("Speech recognition not supported.")
        return
      }
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input
    if (!textToSend.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: textToSend,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      const history = messages.map(msg => ({
        role: msg.sender === "user" ? "user" as const : "model" as const,
        parts: [{ text: msg.content }]
      }));

      const response = await getChatResponse(textToSend, history);

      if (response.content) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.content,
          sender: "bot",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])
        speak(response.content)
      } else if (response.error) {
        toast.error(response.error);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsTyping(false)
    }
  }

  const getLanguageLabel = (lang: Language) => {
    if (lang === "ta-IN") return "Tamil"
    if (lang === "hi-IN") return "Hindi"
    return "English"
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
            <h3 className="font-semibold text-sm">{t.title}</h3>
            {!isMinimized && (
              <p className="text-[10px] text-primary-foreground/80">{t.subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!isMinimized && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20">
                    <Languages className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelectedLanguage("en-IN")}>English</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedLanguage("ta-IN")}>Tamil (தமிழ்)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedLanguage("hi-IN")}>Hindi (हिंदी)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              >
                {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </>
          )}

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="rounded p-1 hover:bg-primary-foreground/20"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded p-1 hover:bg-primary-foreground/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-muted/30" ref={scrollRef}>
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
                      "max-w-[85%] rounded-2xl px-4 py-2 text-sm",
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground shadow-sm rounded-tr-none"
                        : "bg-card border border-border text-foreground shadow-sm rounded-tl-none"
                    )}
                  >
                    {message.content}
                    <div className="mt-1 text-[10px] opacity-70 text-right">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border text-muted-foreground flex items-center gap-2 max-w-[85%] rounded-2xl rounded-tl-none px-4 py-2 text-sm italic shadow-sm">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {t.thinking}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-border p-3 bg-card">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex items-center gap-2"
            >
              <Button
                type="button"
                variant={isListening ? "destructive" : "outline"}
                size="icon"
                className={cn("h-10 w-10 shrink-0 rounded-full transition-all", isListening && "animate-pulse")}
                onClick={toggleListening}
                disabled={isTyping}
              >
                <Mic className="h-5 w-5" />
                <span className="sr-only">{isListening ? t.stopMicLabel : t.micLabel}</span>
              </Button>
              
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? t.listening : isTyping ? t.wait : t.placeholder}
                className="flex-1 rounded-full px-4"
                disabled={isTyping}
              />
              
              <Button 
                type="submit" 
                size="icon" 
                className="h-10 w-10 shrink-0 rounded-full" 
                disabled={isTyping || !input.trim()}
              >
                {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">{t.send}</span>
              </Button>
            </form>
            <div className="mt-2 text-center text-[10px] text-muted-foreground">
              {t.langLabel} <strong>{getLanguageLabel(selectedLanguage)}</strong>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
