import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useAuth } from "./AuthContext";
import { useAIRecommendations, type Product } from "./AIRecommendationEngine";
import {
  Send,
  Sparkles,
  Plus,
  Package,
  Activity,
  User,
  TrendingUp,
  Heart,
  Zap,
  ShoppingCart,
  Stethoscope,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  products?: Product[];
  rationales?: string[];
}

interface AIAdvisorPageProps {
  onSignInClick?: () => void;
}

export function AIAdvisorPage({ onSignInClick }: AIAdvisorPageProps) {
  const { user } = useAuth();
  const { getRecommendations, getAIInsights, products } =
    useAIRecommendations();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [cart, setCart] = useState<Product[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    const insights = getAIInsights();
    const bmi = user?.fitnessMetrics?.bmi;

    let greeting = "";
    if (user && bmi) {
      greeting = `Hi ${user.name}! I see your BMI is ${bmi.toFixed(1)}. `;
      if (insights.length > 0) {
        greeting += insights[0].message + " How can I help you today?";
      } else {
        greeting +=
          "I'm here to help you find the perfect supplements for your fitness goals. What would you like to focus on?";
      }
    } else {
      greeting =
        "Welcome! I'm your AI supplement advisor. Calculate your BMI first or tell me about your fitness goals, and I'll recommend the perfect products for you.";
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

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const query = inputMessage.toLowerCase();
    setInputMessage("");
    setIsTyping(true);

    // Smart AI response based on query
    setTimeout(() => {
      let aiResponse = "";
      let recommendedProducts: Product[] = [];
      let rationales: string[] = [];

      // Analyze user query
      if (
        query.includes("muscle") ||
        query.includes("gain") ||
        query.includes("build")
      ) {
        aiResponse =
          "For muscle building and strength gains, I recommend these supplements based on your profile:";
        const recommendations = getRecommendations().filter((r) =>
          r.product.goalTags?.some((tag) =>
            ["muscle-gain", "strength", "performance"].includes(tag),
          ),
        );
        recommendedProducts = recommendations.slice(0, 4).map((r) => r.product);
        rationales = recommendations.slice(0, 4).map((r) => r.rationale);
      } else if (
        query.includes("weight loss") ||
        query.includes("fat") ||
        query.includes("lose")
      ) {
        aiResponse =
          "For effective weight management, here are my top recommendations:";
        const recommendations = getRecommendations().filter((r) =>
          r.product.goalTags?.some((tag) =>
            ["weight-loss", "fat-loss"].includes(tag),
          ),
        );
        recommendedProducts = recommendations.slice(0, 4).map((r) => r.product);
        rationales = recommendations.slice(0, 4).map((r) => r.rationale);
      } else if (
        query.includes("energy") ||
        query.includes("workout") ||
        query.includes("pre")
      ) {
        aiResponse =
          "To boost your energy and workout performance, consider these:";
        const recommendations = getRecommendations().filter(
          (r) =>
            r.product.category === "performance" ||
            r.product.goalTags?.includes("energy"),
        );
        recommendedProducts = recommendations.slice(0, 4).map((r) => r.product);
        rationales = recommendations.slice(0, 4).map((r) => r.rationale);
      } else if (
        query.includes("recover") ||
        query.includes("sore") ||
        query.includes("rest")
      ) {
        aiResponse = "For optimal recovery and reducing soreness, I suggest:";
        const recommendations = getRecommendations().filter(
          (r) =>
            r.product.category === "recovery" ||
            r.product.goalTags?.includes("recovery"),
        );
        recommendedProducts = recommendations.slice(0, 4).map((r) => r.product);
        rationales = recommendations.slice(0, 4).map((r) => r.rationale);
      } else if (
        query.includes("health") ||
        query.includes("vitamin") ||
        query.includes("wellness")
      ) {
        aiResponse = "For overall health and wellness, these are essential:";
        const recommendations = getRecommendations().filter(
          (r) => r.product.category === "wellness",
        );
        recommendedProducts = recommendations.slice(0, 4).map((r) => r.product);
        rationales = recommendations.slice(0, 4).map((r) => r.rationale);
      } else if (
        query.includes("recommend") ||
        query.includes("suggest") ||
        query.includes("what")
      ) {
        aiResponse =
          "Based on your current profile and goals, here are my top recommendations:";
        const recommendations = getRecommendations();
        recommendedProducts = recommendations.slice(0, 5).map((r) => r.product);
        rationales = recommendations.slice(0, 5).map((r) => r.rationale);
      } else if (query.includes("protein")) {
        aiResponse = "Here are the best protein supplements for you:";
        recommendedProducts = products
          .filter((p) => p.category === "protein")
          .slice(0, 4);
        rationales = recommendedProducts.map(
          () => "High-quality protein source for muscle growth and recovery",
        );
      } else {
        aiResponse =
          "I understand you're looking for guidance. Here are some personalized recommendations based on your profile:";
        const recommendations = getRecommendations();
        recommendedProducts = recommendations.slice(0, 4).map((r) => r.product);
        rationales = recommendations.slice(0, 4).map((r) => r.rationale);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: "ai",
        timestamp: new Date(),
        products: recommendedProducts,
        rationales: rationales,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (action: string) => {
    setInputMessage(action);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      if (!prev.find((p) => p.id === product.id)) {
        return [...prev, product];
      }
      return prev;
    });
  };

  const quickActions = [
    {
      label: "Show my recommendations",
      icon: Sparkles,
      query: "What do you recommend for me?",
    },
    {
      label: "Muscle building",
      icon: TrendingUp,
      query: "I want to build muscle",
    },
    { label: "Weight loss", icon: Activity, query: "Help me lose weight" },
    {
      label: "Energy boost",
      icon: Zap,
      query: "I need more energy for workouts",
    },
    {
      label: "Recovery supplements",
      icon: Heart,
      query: "What's best for recovery?",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 relative overflow-hidden">
      {/* Minimal Background Effect */}
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
          className="absolute top-0 -left-40 w-96 h-96 bg-gradient-to-br from-emerald-200/10 to-teal-200/10 rounded-full blur-3xl"
          animate={{
            x: [0, 20, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 mt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1
            className="tracking-tight mb-4"
            style={{ fontSize: "3rem", fontWeight: 700 }}
          >
            <span className="text-gray-900">Your Personal </span>
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent inline-block">
              AI Advisor
            </span>
          </h1>
          <p className="text-gray-600" style={{ fontSize: "1.125rem" }}>
            Get personalized supplement recommendations powered by AI
          </p>
        </motion.div>

        {/* Floating Chat Window */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white/75 backdrop-blur-2xl rounded-3xl border border-gray-300/40 shadow-2xl overflow-hidden"
        >
          {/* Chat Header */}
          <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-white/50 to-emerald-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg relative"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(16, 185, 129, 0.3)",
                      "0 0 40px rgba(16, 185, 129, 0.5)",
                      "0 0 20px rgba(16, 185, 129, 0.3)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity },
                    }}
                  >
                    <Sparkles className="w-7 h-7 text-white" />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                <div>
                  <h3
                    className="text-gray-900"
                    style={{ fontSize: "1.125rem", fontWeight: 700 }}
                  >
                    AI Health Advisor
                  </h3>
                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs border-none">
                    Online Now
                  </Badge>
                </div>
              </div>

              {cart.length > 0 && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => (window.location.hash = "#choose-box")}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                  style={{ fontWeight: 600, fontSize: "0.875rem" }}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Cart ({cart.length})
                </motion.button>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-5 bg-gradient-to-b from-white/30 to-transparent">
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
                    className={`flex gap-3 max-w-lg ${
                      message.sender === "user"
                        ? "flex-row-reverse"
                        : "flex-row"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                        message.sender === "ai"
                          ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                          : "bg-gray-200"
                      }`}
                    >
                      {message.sender === "ai" ? (
                        <Sparkles className="w-5 h-5 text-white" />
                      ) : (
                        <User className="w-5 h-5 text-gray-700" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div>
                      <motion.div
                        className={`rounded-2xl px-5 py-3.5 shadow-md ${
                          message.sender === "ai"
                            ? "bg-white/90 backdrop-blur-xl border border-gray-200/50 text-gray-900"
                            : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                        }`}
                        whileHover={{ scale: 1.01 }}
                      >
                        <p>{message.content}</p>
                      </motion.div>

                      {/* Product Recommendations */}
                      {message.products && message.products.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="mt-3 space-y-2"
                        >
                          {message.products.map((product, i) => (
                            <motion.div
                              key={product.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + i * 0.1 }}
                              className="flex items-center gap-3 p-3 bg-white/90 backdrop-blur-xl rounded-xl border border-gray-200/50 shadow-md hover:shadow-lg hover:border-emerald-300/60 transition-all"
                              whileHover={{ scale: 1.02, x: 4 }}
                            >
                              <div className="w-14 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 flex-shrink-0">
                                <ImageWithFallback
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className="text-gray-900 text-sm mb-1"
                                  style={{ fontWeight: 600 }}
                                >
                                  {product.name}
                                </p>
                                <p
                                  className="text-emerald-600 mb-1"
                                  style={{ fontSize: "1rem", fontWeight: 600 }}
                                >
                                  ${product.price}
                                </p>
                                {message.rationales &&
                                  message.rationales[i] && (
                                    <p className="text-xs text-gray-600 line-clamp-1">
                                      {message.rationales[i]}
                                    </p>
                                  )}
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => addToCart(product)}
                                className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg shadow-md flex items-center gap-1 flex-shrink-0"
                                style={{ fontWeight: 500, fontSize: "0.75rem" }}
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Add
                              </motion.button>
                            </motion.div>
                          ))}

                          {/* Physician Contact Button */}
                          <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: 0.6 + message.products.length * 0.1,
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() =>
                              alert(
                                "Physician contact feature coming soon! This would connect you with a licensed healthcare professional.",
                              )
                            }
                            className="w-full mt-2 px-4 py-3 bg-white/90 backdrop-blur-xl border border-blue-200/60 rounded-xl shadow-md hover:shadow-lg hover:border-blue-300 transition-all flex items-center justify-center gap-2 text-gray-900"
                            style={{ fontWeight: 600, fontSize: "0.875rem" }}
                          >
                            <Stethoscope className="w-4 h-4 text-blue-600" />
                            Get in contact with a physician
                          </motion.button>
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
                  <div className="flex gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-2xl px-5 py-3.5 shadow-md">
                      <div className="flex gap-1.5">
                        <motion.div
                          className="w-2 h-2 bg-emerald-500 rounded-full"
                          animate={{ y: [0, -8, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: 0,
                          }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-emerald-500 rounded-full"
                          animate={{ y: [0, -8, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: 0.2,
                          }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-emerald-500 rounded-full"
                          animate={{ y: [0, -8, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: 0.4,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-6 py-3 border-t border-gray-200/50 bg-gray-50/50">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {quickActions.map((action, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickAction(action.query)}
                  className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all whitespace-nowrap flex-shrink-0"
                  style={{ fontSize: "0.75rem", fontWeight: 500 }}
                >
                  <action.icon className="w-3.5 h-3.5 text-emerald-600" />
                  {action.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-gray-200/50 bg-white/50">
            <div className="flex gap-3">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask me anything about supplements..."
                className="flex-1 h-12 bg-white/90 backdrop-blur-xl border-gray-300 rounded-2xl focus:border-emerald-500"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
