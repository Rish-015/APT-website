"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Bot, X, Send, Minimize2, Loader2, Mic, Volume2, VolumeX, Languages, Pause, Play, Square, RotateCcw } from "lucide-react"
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

/**
 * Detect language from Unicode character ranges
 */
function detectLanguage(text: string, fallback: Language): Language {
  // Tamil range
  if (/[\u0B80-\u0BFF]/.test(text)) {
    return "ta-IN"
  }
  // Hindi / Devanagari range
  if (/[\u0900-\u097F]/.test(text)) {
    return "hi-IN"
  }
  return fallback
}

/**
 * Clean text for SpeechSynthesis (remove markdown, asterisks, brackets, bullets)
 */
function cleanTextForSpeech(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^[\*\-•]\s+/gm, '')
    .replace(/[\*\_#`~\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Clean message renderer that strips asterisks and formats lists / bold lines
 */
function FormattedChatMessage({ content }: { content: string }) {
  // Turn inline bullets (e.g. " * **PM-KISAN" or " - Point") into newlines
  const normalized = content
    .replace(/\s+\*\s+(\*\*|[^\*\s])/g, '\n- $1')
    .replace(/\s+-\s+(\*\*|[^\-\s])/g, '\n- $1')
    .replace(/\s+•\s+/g, '\n- ')

  const rawLines = normalized.split('\n').map(l => l.trim()).filter(Boolean)

  const renderInline = (line: string) => {
    const parts: React.ReactNode[] = []
    const regex = /\*\*(.*?)\*\*/g
    let lastIndex = 0
    let match

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        const plain = line.substring(lastIndex, match.index).replace(/[\*\_]/g, '')
        if (plain) parts.push(plain)
      }
      const boldText = match[1].replace(/[\*\_]/g, '')
      parts.push(
        <strong key={`b-${match.index}`} className="font-semibold text-foreground">
          {boldText}
        </strong>
      )
      lastIndex = regex.lastIndex
    }

    if (lastIndex < line.length) {
      const rest = line.substring(lastIndex).replace(/[\*\_]/g, '')
      if (rest) parts.push(rest)
    }

    return parts.length > 0 ? parts : line.replace(/[\*\_]/g, '')
  }

  const blocks: { type: 'p' | 'list', items: string[] }[] = []
  let currentList: string[] = []

  rawLines.forEach((line) => {
    const isBullet = /^[\*\-•]\s*/.test(line)
    if (isBullet) {
      currentList.push(line.replace(/^[\*\-•]\s*/, ''))
    } else {
      if (currentList.length > 0) {
        blocks.push({ type: 'list', items: currentList })
        currentList = []
      }
      blocks.push({ type: 'p', items: [line] })
    }
  })

  if (currentList.length > 0) {
    blocks.push({ type: 'list', items: currentList })
  }

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {blocks.map((block, idx) => {
        if (block.type === 'list') {
          return (
            <ul key={idx} className="space-y-1.5 pl-1 my-1">
              {block.items.map((item, iIdx) => (
                <li key={iIdx} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/80" />
                  <span className="flex-1">{renderInline(item)}</span>
                </li>
              ))}
            </ul>
          )
        }
        return (
          <p key={idx} className="my-1">
            {renderInline(block.items[0])}
          </p>
        )
      })}
    </div>
  )
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
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null)
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const t = translations[selectedLanguage]

  // Pre-load voices on component mount
  useEffect(() => {
    if (typeof window === "undefined" || !('speechSynthesis' in window)) return

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices()
      if (available && available.length > 0) {
        voicesRef.current = available
      }
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [])

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

  // Text to Speech: Native server /api/tts for Tamil and Hindi, browser TTS for English
  const speak = useCallback((text: string, messageId?: string) => {
    if (!isVoiceEnabled || typeof window === "undefined") return

    // Stop any currently playing audio or speech
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }

    const detectedLang = detectLanguage(text, selectedLanguage)
    const cleaned = cleanTextForSpeech(text)
    if (!cleaned) return

    // Auto sync state language if text was in Tamil or Hindi
    if (detectedLang !== selectedLanguage) {
      setSelectedLanguage(detectedLang)
    }

    const langCode = detectedLang === "ta-IN" ? "ta" : detectedLang === "hi-IN" ? "hi" : "en"

    // For Tamil & Hindi: Always use server /api/tts to guarantee 100% native pronunciation
    // on all machines regardless of whether Windows has the Tamil voice pack installed!
    if (langCode === "ta" || langCode === "hi") {
      setCurrentSpeakingId(messageId || null)
      setIsSpeaking(true)
      setIsPaused(false)

      const audioUrl = `/api/tts?text=${encodeURIComponent(cleaned)}&lang=${langCode}`
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onplay = () => {
        setIsSpeaking(true)
        setIsPaused(false)
      }
      audio.onpause = () => {
        setIsPaused(true)
      }
      audio.onended = () => {
        setIsSpeaking(false)
        setIsPaused(false)
        setCurrentSpeakingId(null)
        audioRef.current = null
      }
      audio.onerror = (e) => {
        console.warn("Audio element error:", e)
        setIsSpeaking(false)
        setIsPaused(false)
        setCurrentSpeakingId(null)
        audioRef.current = null
      }

      audio.play().catch(e => {
        console.warn("Audio play prevented:", e)
        setIsSpeaking(false)
        setIsPaused(false)
        setCurrentSpeakingId(null)
      })
      return
    }

    // For English: Use SpeechSynthesis API
    if ('speechSynthesis' in window) {
      const availableVoices = window.speechSynthesis.getVoices()
      const matchedVoice = availableVoices.find(v => 
        v.lang.toLowerCase().startsWith("en-in") || 
        v.lang.toLowerCase().startsWith("en")
      )

      const utterance = new SpeechSynthesisUtterance(cleaned)
      utterance.lang = "en-IN"
      if (matchedVoice) {
        utterance.voice = matchedVoice
      }

      utterance.onstart = () => {
        setIsSpeaking(true)
        setIsPaused(false)
        setCurrentSpeakingId(messageId || null)
      }
      utterance.onend = () => {
        setIsSpeaking(false)
        setIsPaused(false)
        setCurrentSpeakingId(null)
      }
      utterance.onerror = () => {
        setIsSpeaking(false)
        setIsPaused(false)
        setCurrentSpeakingId(null)
      }
      utterance.onpause = () => setIsPaused(true)
      utterance.onresume = () => setIsPaused(false)

      window.speechSynthesis.speak(utterance)
    }
  }, [isVoiceEnabled, selectedLanguage])

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPaused) {
        audioRef.current.play()
        setIsPaused(false)
      } else {
        audioRef.current.pause()
        setIsPaused(true)
      }
      return
    }

    if (typeof window !== "undefined" && 'speechSynthesis' in window) {
      if (isPaused) {
        window.speechSynthesis.resume()
        setIsPaused(false)
      } else {
        window.speechSynthesis.pause()
        setIsPaused(true)
      }
    }
  }

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    if (typeof window !== "undefined" && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
    setIsPaused(false)
    setCurrentSpeakingId(null)
  }

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
        toast.error("Speech recognition not supported in this browser.")
        return
      }
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input
    if (!textToSend.trim() || isTyping) return

    // Detect if user input is in Tamil/Hindi to align language early
    const inputLang = detectLanguage(textToSend, selectedLanguage)
    if (inputLang !== selectedLanguage) {
      setSelectedLanguage(inputLang)
    }

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
      }))

      const response = await getChatResponse(textToSend, history)

      if (response.content) {
        const botId = (Date.now() + 1).toString()
        const botMessage: Message = {
          id: botId,
          content: response.content,
          sender: "bot",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])
        speak(response.content, botId)
      } else if (response.error) {
        toast.error(response.error)
      }
    } catch (error) {
      console.error("Chat Error:", error)
      toast.error("An unexpected error occurred.")
    } finally {
      setIsTyping(false)
    }
  }

  const getLanguageLabel = (lang: Language) => {
    if (lang === "ta-IN") return "Tamil (தமிழ்)"
    if (lang === "hi-IN") return "Hindi (हिंदी)"
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
        isMinimized ? "h-14" : "h-[540px]"
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

              {isSpeaking && (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20"
                    onClick={togglePlayback}
                    title={isPaused ? "Resume voice" : "Pause voice"}
                  >
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20"
                    onClick={stopPlayback}
                    title="Stop voice"
                  >
                    <Square className="h-3.5 w-3.5 fill-current" />
                  </Button>
                </>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={() => {
                  if (isVoiceEnabled) stopPlayback()
                  setIsVoiceEnabled(!isVoiceEnabled)
                }}
                title={isVoiceEnabled ? "Disable voice" : "Enable voice"}
              >
                {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </>
          )}

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="rounded p-1 hover:bg-primary-foreground/20"
            title="Minimize"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              stopPlayback()
              setIsOpen(false)
            }}
            className="rounded p-1 hover:bg-primary-foreground/20"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-muted/20" ref={scrollRef}>
            <div className="flex flex-col gap-4">
              {messages.map((message) => {
                const isBot = message.sender === "bot"
                const isCurrentlySpeakingThis = isSpeaking && currentSpeakingId === message.id

                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex flex-col",
                      isBot ? "items-start" : "items-end"
                    )}
                  >
                    <div
                      className={cn(
                        "relative max-w-[88%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                        !isBot
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-card border border-border text-foreground rounded-tl-none"
                      )}
                    >
                      {isBot ? (
                        <FormattedChatMessage content={message.content} />
                      ) : (
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      )}

                      <div className="mt-1.5 flex items-center justify-between gap-3 text-[10px] opacity-70">
                        {isBot ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (isCurrentlySpeakingThis) {
                                stopPlayback()
                              } else {
                                speak(message.content, message.id)
                              }
                            }}
                            className="inline-flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                            title="Play audio for this message"
                          >
                            {isCurrentlySpeakingThis ? (
                              <>
                                <Square className="h-2.5 w-2.5 fill-current text-primary" />
                                <span className="text-primary font-medium">Speaking...</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="h-2.5 w-2.5" />
                                <span>Speak</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span />
                        )}
                        <span>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
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
