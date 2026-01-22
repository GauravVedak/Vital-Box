import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { useAuth } from "./AuthContext";
import { useAIRecommendations, type Product } from "./AIRecommendationEngine";
import {
  Plus,
  Minus,
  ShoppingCart,
  Search,
  Package,
  Dumbbell,
  TrendingUp,
  TrendingDown,
  Heart,
  Zap,
  X,
  Sparkles,
  Activity,
  Award,
  ArrowRight,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ChooseBoxPageProps {
  onSignInClick?: () => void;
}

const OLD_products: Product[] = [
  // Weight Gainers
  {
    id: "1",
    name: "Mass Gainer Pro",
    category: "weight-gain",
    price: 54.99,
    description: "High-calorie formula for healthy weight gain and muscle mass",
    benefits: ["1250 calories per serving", "50g protein", "Clean carbs"],
    image: "https://images.unsplash.com/photo-1680265158261-5fd6ba5d9959?w=400",
    aiRecommended: true,
    bmiCategory: ["Underweight"],
  },
  {
    id: "2",
    name: "Lean Mass Builder",
    category: "weight-gain",
    price: 49.99,
    description: "Premium mass gainer with minimal fat for quality gains",
    benefits: ["800 calories", "40g protein", "Complex carbs"],
    image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400",
    bmiCategory: ["Underweight", "Normal Weight"],
  },
  
  // Weight Loss
  {
    id: "3",
    name: "Fat Burner Elite",
    category: "weight-loss",
    price: 39.99,
    description: "Advanced thermogenic formula to support metabolism",
    benefits: ["Boosts metabolism", "Increases energy", "Appetite control"],
    image: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=400",
    aiRecommended: true,
    bmiCategory: ["Overweight", "Obese"],
  },
  {
    id: "4",
    name: "CLA Complex",
    category: "weight-loss",
    price: 32.99,
    description: "Conjugated linoleic acid for lean body composition",
    benefits: ["Supports fat loss", "Preserves muscle", "Natural ingredients"],
    image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=400",
    bmiCategory: ["Overweight", "Obese"],
  },
  {
    id: "5",
    name: "Green Tea Extract",
    category: "weight-loss",
    price: 24.99,
    description: "Natural antioxidant with metabolism-boosting properties",
    benefits: ["Natural fat burning", "Antioxidants", "Energy boost"],
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400",
    bmiCategory: ["Overweight", "Obese"],
  },

  // Protein
  {
    id: "6",
    name: "Premium Whey Isolate",
    category: "protein",
    price: 45.99,
    description: "Ultra-pure whey isolate for maximum protein absorption",
    benefits: ["25g protein", "Fast absorption", "Low carb & fat"],
    image: "https://images.unsplash.com/photo-1680265158261-5fd6ba5d9959?w=400",
    aiRecommended: true,
    bmiCategory: ["Normal Weight", "Underweight"],
  },
  {
    id: "7",
    name: "Plant Protein Blend",
    category: "protein",
    price: 42.99,
    description: "Complete vegan protein from multiple plant sources",
    benefits: ["20g plant protein", "Vegan friendly", "Easy digestion"],
    image: "https://images.unsplash.com/photo-1622484211850-2ccf1cd0e8c1?w=400",
    bmiCategory: ["Normal Weight", "Overweight"],
  },
  {
    id: "8",
    name: "Casein Night Protein",
    category: "protein",
    price: 47.99,
    description: "Slow-release protein perfect for overnight recovery",
    benefits: ["Slow digestion", "24g protein", "Muscle recovery"],
    image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400",
    bmiCategory: ["Normal Weight", "Underweight"],
  },

  // Performance
  {
    id: "9",
    name: "Pre-Workout Extreme",
    category: "performance",
    price: 39.99,
    description: "Maximum energy and focus for intense training sessions",
    benefits: ["Explosive energy", "Mental focus", "Endurance boost"],
    image: "https://images.unsplash.com/photo-1704650311298-4d6915d34c64?w=400",
    aiRecommended: true,
  },
  {
    id: "10",
    name: "Creatine Monohydrate",
    category: "performance",
    price: 29.99,
    description: "Pure micronized creatine for strength and power",
    benefits: ["Increases strength", "Improves performance", "5g per serving"],
    image: "https://images.unsplash.com/photo-1724160167780-1aef4db75030?w=400",
    aiRecommended: true,
  },
  {
    id: "11",
    name: "Beta-Alanine",
    category: "performance",
    price: 27.99,
    description: "Delays muscle fatigue for extended training capacity",
    benefits: ["Reduces fatigue", "Increases endurance", "Better pumps"],
    image: "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=400",
  },

  // Recovery
  {
    id: "12",
    name: "BCAA Complex",
    category: "recovery",
    price: 34.99,
    description: "Essential amino acids for optimal muscle recovery",
    benefits: ["Reduces soreness", "Supports recovery", "Hydration blend"],
    image: "https://images.unsplash.com/photo-1657244358898-d9e110504fd8?w=400",
    aiRecommended: true,
  },
  {
    id: "13",
    name: "Glutamine Powder",
    category: "recovery",
    price: 31.99,
    description: "Supports immune function and muscle recovery",
    benefits: ["Immune support", "Muscle recovery", "Gut health"],
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400",
  },
  {
    id: "14",
    name: "ZMA Sleep Formula",
    category: "recovery",
    price: 26.99,
    description: "Zinc, magnesium, and B6 for better sleep and recovery",
    benefits: ["Better sleep", "Hormone support", "Recovery aid"],
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
  },

  // Wellness
  {
    id: "15",
    name: "Multivitamin Elite",
    category: "wellness",
    price: 24.99,
    description: "Complete daily nutrition with 25+ vitamins and minerals",
    benefits: ["Daily nutrition", "Immune support", "Energy boost"],
    image: "https://images.unsplash.com/photo-1640958898466-b4dd00872fc8?w=400",
    aiRecommended: true,
  },
  {
    id: "16",
    name: "Omega-3 Fish Oil",
    category: "wellness",
    price: 27.99,
    description: "Ultra-pure omega-3 for heart, brain, and joint health",
    benefits: ["Heart health", "Joint support", "Brain function"],
    image: "https://images.unsplash.com/photo-1576437293196-fc3080b75964?w=400",
  },
  {
    id: "17",
    name: "Vitamin D3 + K2",
    category: "wellness",
    price: 19.99,
    description: "Essential vitamins for bone health and immunity",
    benefits: ["Bone strength", "Immune health", "Mood support"],
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400",
  },
];

const categories = [
  { id: "all", label: "All", icon: Package },
  { id: "weight-gain", label: "Weight Gain", icon: TrendingUp },
  { id: "weight-loss", label: "Weight Loss", icon: TrendingDown },
  { id: "protein", label: "Protein", icon: Dumbbell },
  { id: "performance", label: "Performance", icon: Zap },
  { id: "recovery", label: "Recovery", icon: Heart },
  { id: "wellness", label: "Wellness", icon: Activity },
];

export function ChooseBoxPage({ onSignInClick }: ChooseBoxPageProps) {
  const { user } = useAuth();
  const { getRecommendations, products, addProductFeedback, getAIInsights } = useAIRecommendations();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [aiRecommendations, setAIRecommendations] = useState<ReturnType<typeof getRecommendations>>([]);
  const [aiInsights, setAIInsights] = useState<ReturnType<typeof getAIInsights>>([]);

  // Get AI recommendations
  useEffect(() => {
    const recommendations = getRecommendations();
    setAIRecommendations(recommendations);
    const insights = getAIInsights();
    setAIInsights(insights);
  }, [user, getRecommendations, getAIInsights]);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    // Track as positive feedback
    addProductFeedback(product.id, true);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, change: number) => {
    setCart(
      cart
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleProceedToCheckout = () => {
    setCartOpen(false);
    window.location.hash = "#checkout";
  };

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
            backgroundSize: '80px 80px'
          }}
        />
        <motion.div
          className="absolute top-0 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-200/10 to-teal-200/10 rounded-full blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/70 backdrop-blur-xl rounded-full border border-emerald-300/50 shadow-lg mb-6"
          >
            <Package className="w-5 h-5 text-emerald-600" />
            <span className="text-emerald-700 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
              Custom Selection
            </span>
          </motion.div>

          <h1 className="mb-4 tracking-tight" style={{ fontSize: '3rem', fontWeight: 700 }}>
            <span className="text-gray-900">Build Your </span>
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent inline-block">
              Perfect Box
            </span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-2" style={{ fontSize: '1.125rem' }}>
            Choose from our premium selection tailored to your fitness goals
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto" style={{ fontSize: '0.875rem' }}>
            Need personalized guidance? You can get in contact with a physician
          </p>
        </motion.div>

        {/* AI Insights Banner */}
        {aiInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-8 space-y-4"
          >
            {aiInsights.slice(0, 2).map((insight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.1 }}
                className={`bg-gradient-to-r backdrop-blur-xl rounded-3xl border p-6 ${
                  insight.type === "achievement"
                    ? "from-emerald-50/80 to-teal-50/80 border-emerald-200/40"
                    : insight.type === "warning"
                    ? "from-orange-50/80 to-amber-50/80 border-orange-200/40"
                    : "from-blue-50/80 to-cyan-50/80 border-blue-200/40"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    insight.type === "achievement"
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                      : insight.type === "warning"
                      ? "bg-gradient-to-br from-orange-500 to-amber-600"
                      : "bg-gradient-to-br from-blue-500 to-cyan-600"
                  }`}>
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900 uppercase tracking-wider mb-2" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                      {insight.type === "achievement" ? "Great Progress!" : insight.type === "warning" ? "Health Alert" : "AI Recommendation"}
                    </h3>
                    <p className="text-gray-700 mb-3">{insight.message}</p>
                    {insight.products && insight.products.length > 0 && (
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {insight.products.map((product) => (
                          <motion.div
                            key={product.id}
                            whileHover={{ y: -4 }}
                            className="flex-shrink-0 w-40 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-3 cursor-pointer"
                            onClick={() => addToCart(product)}
                          >
                            <div className="w-full h-24 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 mb-2 overflow-hidden">
                              <ImageWithFallback
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <p className="text-gray-900 text-xs mb-1 line-clamp-1" style={{ fontWeight: 600 }}>
                              {product.name}
                            </p>
                            <p className="text-emerald-600 text-sm" style={{ fontWeight: 600 }}>
                              ${product.price}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Top AI Recommendations */}
        {aiRecommendations.filter(r => r.category === "primary").length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mb-8 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 backdrop-blur-xl rounded-3xl border border-emerald-200/40 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-gray-900 uppercase tracking-wider" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    Top Picks for You
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {user?.fitnessMetrics?.bmi ? `Based on your BMI: ${user.fitnessMetrics.bmi.toFixed(1)}` : "Highly recommended"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {aiRecommendations.filter(r => r.category === "primary").slice(0, 5).map((recommendation) => (
                <motion.div
                  key={recommendation.product.id}
                  whileHover={{ y: -4 }}
                  className="flex-shrink-0 w-48 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-4 cursor-pointer hover:border-emerald-300 transition-colors"
                  onClick={() => addToCart(recommendation.product)}
                >
                  <div className="w-full h-32 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 mb-3 overflow-hidden">
                    <ImageWithFallback
                      src={recommendation.product.image}
                      alt={recommendation.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-gray-900 text-sm mb-1 line-clamp-1" style={{ fontWeight: 600 }}>
                    {recommendation.product.name}
                  </p>
                  <p className="text-emerald-600 mb-2" style={{ fontSize: '1rem', fontWeight: 600 }}>
                    ${recommendation.product.price}
                  </p>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {recommendation.rationale}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8 flex flex-col md:flex-row gap-4 items-center"
        >
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="pl-12 h-12 bg-white/90 backdrop-blur-xl border-gray-300 rounded-2xl focus:border-emerald-500"
            />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-transparent shadow-lg"
                    : "bg-white/70 backdrop-blur-xl text-gray-700 border-gray-200 hover:border-emerald-300"
                }`}
              >
                <category.icon className="w-4 h-4" />
                <span className="text-sm" style={{ fontWeight: 500 }}>
                  {category.label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Product Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ y: -8 }}
                className="bg-white/70 backdrop-blur-xl rounded-3xl border border-gray-200/60 overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-300/60 transition-all"
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  {product.aiRecommended && (
                    <Badge className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-none shadow-lg">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Pick
                    </Badge>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <h3 className="text-gray-900 mb-2" style={{ fontWeight: 600 }}>
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Benefits */}
                  <div className="mb-4 space-y-1.5">
                    {product.benefits.slice(0, 2).map((benefit, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {benefit}
                      </div>
                    ))}
                  </div>

                  {/* Price and Add Button */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                      ${product.price}
                    </span>
                    <motion.button
                      onClick={() => addToCart(product)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl shadow-md hover:shadow-lg transition-shadow flex items-center gap-1.5"
                      style={{ fontWeight: 500, fontSize: '0.875rem' }}
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500" style={{ fontSize: '1.125rem' }}>
              No products found
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Try adjusting your search or filters
            </p>
          </motion.div>
        )}

        {/* Floating Cart Button */}
        <AnimatePresence>
          {cart.length > 0 && (
            <motion.button
              onClick={() => setCartOpen(true)}
              className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              <ShoppingCart className="w-6 h-6" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
                style={{ fontSize: '0.75rem', fontWeight: 700 }}
              >
                {cart.length}
              </motion.div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Cart Sidebar */}
        <AnimatePresence>
          {cartOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setCartOpen(false)}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              />

              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-gray-900" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                        Your Box
                      </h2>
                      <p className="text-gray-600 text-sm mt-0.5">
                        {cart.length} {cart.length === 1 ? "item" : "items"}
                      </p>
                    </div>
                    <button
                      onClick={() => setCartOpen(false)}
                      className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {cart.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <Package className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="text-gray-500">Your box is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <motion.div
                          key={item.product.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="bg-gray-50/50 rounded-2xl p-4 border border-gray-200/50"
                        >
                          <div className="flex gap-4">
                            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden flex-shrink-0">
                              <ImageWithFallback
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-gray-900 mb-1" style={{ fontWeight: 600 }}>
                                {item.product.name}
                              </h3>
                              <p className="text-emerald-600 mb-3" style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                                ${item.product.price}
                              </p>
                              <div className="flex items-center gap-3">
                                <motion.button
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => updateQuantity(item.product.id, -1)}
                                  className="w-8 h-8 rounded-lg border border-gray-300 hover:border-emerald-500 flex items-center justify-center bg-white transition-colors"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </motion.button>
                                <span className="w-8 text-center" style={{ fontWeight: 600 }}>
                                  {item.quantity}
                                </span>
                                <motion.button
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => updateQuantity(item.product.id, 1)}
                                  className="w-8 h-8 rounded-lg border border-gray-300 hover:border-emerald-500 flex items-center justify-center bg-white transition-colors"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </motion.button>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="p-6 border-t border-gray-200 bg-gradient-to-b from-white to-gray-50">
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-gray-900" style={{ fontWeight: 600 }}>
                          ${cartTotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span className="text-emerald-600" style={{ fontWeight: 600 }}>
                          Free
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Discount</span>
                        <span className="text-emerald-600" style={{ fontWeight: 600 }}>
                          -$0.00
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-6 pt-4 border-t border-gray-200">
                      <span className="text-gray-900" style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                        Total
                      </span>
                      <span className="text-gray-900" style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                        ${cartTotal.toFixed(2)}
                      </span>
                    </div>
                    <motion.button
                      onClick={handleProceedToCheckout}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
                      style={{ fontWeight: 600, fontSize: '1rem' }}
                    >
                      Proceed to Checkout
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
