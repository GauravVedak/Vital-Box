import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useAuth } from "./AuthContext";
import { useAIGuidance, type AmazonLink } from "./useAIGuidance";
import {
  Send,
  Sparkles,
  Package,
  Activity,
  User,
  TrendingUp,
  Heart,
  Zap,
  ShoppingCart,
  AlertCircle,
  Copy,
  Trash2,
  ArrowDown,
  Info,
  ExternalLink,
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  amazonLinks?: AmazonLink[];
  disclaimers?: string[];
}

interface AIAdvisorPageProps {
  onSignInClick?: () => void;
}

export function AIAdvisorPage({ onSignInClick }: AIAdvisorPageProps) {
  const { user } = useAuth();
  const { ask } = useAIGuidance();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll button visibility
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Initial greeting
  useEffect(() => {
    const bmi = user?.fitnessMetrics?.latestBMI?.value;
    const bmiCategory = user?.fitnessMetrics?.latestBMI?.category;

    let greeting = "";
    if (user && bmi) {
      greeting = `Hi ${user.name}! I see your BMI is ${bmi.toFixed(1)} (${bmiCategory}). I'm here to help you find the perfect supplements for your fitness goals. What would you like to focus on?`;
    } else if (user) {
      greeting = `Hi ${user.name}! I'm your AI supplement advisor. Tell me about your fitness goals, and I'll recommend supplements to help you achieve them.`;
    } else {
      greeting =
        "Welcome! I'm your AI supplement advisor. Sign in and track your BMI to get personalized recommendations, or ask me about fitness and supplements!";
    }

    setMessages([
      {
        id: "1",
        content: greeting,
        sender: "ai",
        timestamp: new Date(),
      },
    ]);
  }, [user]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);
    setError(null);

    try {
      const data = await ask(inputMessage);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.summary,
        sender: "ai",
        timestamp: new Date(),
        amazonLinks: data.amazonLinks || [],
        disclaimers: data.disclaimers || [],
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      setError(err.message || "Failed to get AI response");

      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "I'm having trouble connecting right now. Please try again in a moment, or ask me about general supplement guidance!",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (query: string) => {
    setInputMessage(query);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleCopyMessage = (messageId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([messages[0]]); // Keep only the greeting
  };

  const quickActions = [
    {
      label: "Muscle",
      icon: TrendingUp,
      query: "I want to build muscle and gain strength",
    },
    {
      label: "Weight Loss",
      icon: Activity,
      query: "Help me lose weight and burn fat",
    },
    {
      label: "Energy",
      icon: Zap,
      query: "I need more energy for workouts",
    },
    {
      label: "Recovery",
      icon: Heart,
      query: "What's best for recovery after training?",
    },
  ];

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className=" pt-24 pb-12 px-4 md:px-6 relative overflow-hidden flex items-center justify-center">
      {/* Clean Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #10b981 1px, transparent 1px),
              linear-gradient(to bottom, #10b981 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }}
        />
        <motion.div
          className="absolute top-1/4 -left-40 w-96 h-96 bg-gradient-to-br from-emerald-400/15 to-teal-400/15 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-40 w-96 h-96 bg-gradient-to-br from-cyan-400/15 to-blue-400/15 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="w-full max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-4"
        >
          <h1
            className="tracking-tight mb-2"
            style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 700 }}
          >
            <span className="text-gray-900">Your Personal </span>
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent inline-block">
              AI Advisor
            </span>
          </h1>
          <p className="text-gray-600 text-sm">
            Get personalized supplement recommendations powered by AI
          </p>
        </motion.div>

        {/* Compact User Stats */}
        {user && user.fitnessMetrics?.latestBMI && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-gradient-to-r from-white/80 to-emerald-50/50 backdrop-blur-xl rounded-2xl border border-emerald-200/30 shadow-md"
          >
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {user.fitnessMetrics.latestBMI.value.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500">BMI</p>
                </div>
              </div>

              <div className="h-10 w-px bg-gray-200" />

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {user.fitnessMetrics.latestBMI.weight}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.fitnessMetrics.latestBMI.unit === "imperial"
                      ? "lbs"
                      : "kg"}
                  </p>
                </div>
              </div>

              <div className="h-10 w-px bg-gray-200" />

              <div className="text-center">
                <p className="text-sm font-bold text-gray-900">
                  {user.fitnessMetrics.latestBMI.category}
                </p>
                <p className="text-xs text-gray-500">Status</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-800"
          >
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}

        {/* Chat Window */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-2xl overflow-hidden"
        >
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200/50 bg-gradient-to-r from-white/90 to-emerald-50/20 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md"
                  animate={{
                    boxShadow: [
                      "0 0 15px rgba(16, 185, 129, 0.3)",
                      "0 0 30px rgba(16, 185, 129, 0.5)",
                      "0 0 15px rgba(16, 185, 129, 0.3)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-gray-900 text-sm font-bold">
                    AI Health Advisor
                  </h3>
                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs border-none px-2 py-0">
                    Online
                  </Badge>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClearChat}
                className="p-2 hover:bg-white/70 rounded-lg transition-colors"
                title="Clear conversation"
              >
                <Trash2 className="w-4 h-4 text-gray-600" />
              </motion.button>
            </div>
          </div>

          {/* Messages Area - ONLY THIS SCROLLS */}
          <div
            ref={messagesContainerRef}
            className="h-[500px] overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-gray-50/30 to-white/50 relative"
          >
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex gap-2 max-w-[85%] ${
                      message.sender === "user"
                        ? "flex-row-reverse"
                        : "flex-row"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm text-xs font-bold ${
                        message.sender === "ai"
                          ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
                          : "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                      }`}
                    >
                      {message.sender === "ai" ? (
                        <Sparkles className="w-4 h-4" />
                      ) : (
                        <span>{getUserInitials()}</span>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <motion.div
                        className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                          message.sender === "ai"
                            ? "bg-white border border-gray-100 text-gray-900"
                            : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                        }`}
                        whileHover={{ scale: 1.01 }}
                      >
                        <p className="text-sm leading-relaxed">
                          {message.content}
                        </p>

                        {/* Timestamp */}
                        <p
                          className={`text-xs mt-1.5 ${
                            message.sender === "ai"
                              ? "text-gray-400"
                              : "text-white/70"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </motion.div>

                      {/* Copy button for AI messages */}
                      {message.sender === "ai" && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              handleCopyMessage(message.id, message.content)
                            }
                            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Copy message"
                          >
                            <Copy
                              className={`w-3.5 h-3.5 ${
                                copiedMessageId === message.id
                                  ? "text-emerald-600"
                                  : "text-gray-400"
                              }`}
                            />
                          </motion.button>
                          {copiedMessageId === message.id && (
                            <motion.span
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0 }}
                              className="text-xs text-emerald-600 font-medium"
                            >
                              Copied!
                            </motion.span>
                          )}
                        </div>
                      )}

                      {/* Amazon Product Cards */}
                      {message.amazonLinks &&
                        message.amazonLinks.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-3 space-y-3"
                          >
                            {message.amazonLinks.map((link, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
                              >
                                {/* Header */}
                                <div className="flex items-start gap-3 mb-3">
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                                    <Package className="w-5 h-5 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-gray-900 font-bold text-base mb-1">
                                      {link.searchQuery}
                                    </h4>
                                    <Badge className="bg-emerald-100 text-emerald-700 text-xs border-none">
                                      {link.category}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Purpose */}
                                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                                  {link.purpose}
                                </p>

                                {/* Red flags */}
                                {link.redFlags && (
                                  <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                    <div className="flex items-start gap-2">
                                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                      <div>
                                        <p className="text-xs font-bold text-amber-900 mb-1">
                                          ⚠️ Important
                                        </p>
                                        <p className="text-xs text-amber-800">
                                          {link.redFlags}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* CTA Button */}
                                <motion.a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all"
                                >
                                  <ShoppingCart className="w-4 h-4" />
                                  View on Amazon
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </motion.a>
                              </motion.div>
                            ))}

                            {/* Disclaimers */}
                            {message.disclaimers &&
                              message.disclaimers.length > 0 && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                                  <div className="flex items-start gap-2">
                                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-xs text-blue-900 space-y-1">
                                      {message.disclaimers.map(
                                        (disclaimer, idx) => (
                                          <p key={idx}>{disclaimer}</p>
                                        )
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                            {/* Medical Advice Notice */}
                            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                              <div className="flex items-start gap-2">
                                <Heart className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-xs font-bold text-purple-900 mb-1">
                                    Consult Your Doctor
                                  </p>
                                  <p className="text-xs text-purple-800">
                                    Always speak with your healthcare provider before starting any new supplement regimen.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-2">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl px-4 py-2.5 shadow-sm">
                      <div className="flex gap-1.5">
                        {[0, 0.2, 0.4].map((delay, i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 bg-emerald-500 rounded-full"
                            animate={{ y: [0, -6, 0] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scroll to Bottom Button */}
            <AnimatePresence>
              {showScrollButton && (
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={scrollToBottom}
                  className="absolute bottom-4 right-4 w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full shadow-xl flex items-center justify-center z-10"
                >
                  <ArrowDown className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-5 py-3 border-t border-gray-200/50 bg-white/30">
            <div className="flex gap-2 justify-center overflow-x-auto scrollbar-hide">
              {quickActions.map((action, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickAction(action.query)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all whitespace-nowrap text-xs font-medium text-gray-700"
                >
                  <action.icon className="w-3.5 h-3.5 text-emerald-600" />
                  {action.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-5 border-t border-gray-200/50 bg-white/50">
            <div className="flex gap-3">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !isTyping && handleSendMessage()
                }
                placeholder="Ask me anything about supplements..."
                disabled={isTyping}
                className="flex-1 h-12 text-sm bg-white border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
