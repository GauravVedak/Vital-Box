import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  benefits: string[];
  image: string;
  aiRecommended?: boolean;
  bmiCategory?: string[];
  goalTags?: string[];
  healthImpacts?: string[];
  ingredients?: string[];
  popularity?: number;
}

export interface Recommendation {
  product: Product;
  score: number;
  rationale: string;
  category: "primary" | "secondary" | "complementary";
}

export interface AIInsight {
  message: string;
  type: "tip" | "recommendation" | "warning" | "achievement";
  products?: Product[];
}

interface AIRecommendationContextType {
  getRecommendations: (context?: string) => Recommendation[];
  getAIInsights: () => AIInsight[];
  addProductFeedback: (productId: string, liked: boolean) => void;
  products: Product[];
  updateUserGoals: (goals: string[]) => void;
  userGoals: string[];
}

const AIRecommendationContext = createContext<AIRecommendationContextType | undefined>(undefined);

// Comprehensive product catalog
const PRODUCT_CATALOG: Product[] = [
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
    goalTags: ["muscle-gain", "weight-gain", "bulking"],
    healthImpacts: ["muscle-growth", "calorie-surplus", "energy"],
    ingredients: ["whey-protein", "maltodextrin", "creatine"],
    popularity: 95,
  },
  {
    id: "2",
    name: "Lean Mass Builder",
    category: "weight-gain",
    price: 49.99,
    description: "Premium mass gainer with minimal fat for quality gains",
    benefits: ["800 calories", "40g protein", "Complex carbs"],
    image: "https://images.unsplash.com/photo-1693996045300-521e9d08cabc?w=400",
    bmiCategory: ["Underweight", "Normal Weight"],
    goalTags: ["muscle-gain", "weight-gain", "lean-bulk"],
    healthImpacts: ["lean-muscle", "energy", "recovery"],
    ingredients: ["whey-isolate", "oats", "mct-oil"],
    popularity: 88,
  },
  
  // Weight Loss
  {
    id: "3",
    name: "Fat Burner Elite",
    category: "weight-loss",
    price: 39.99,
    description: "Advanced thermogenic formula to support metabolism",
    benefits: ["Boosts metabolism", "Increases energy", "Appetite control"],
    image: "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=400",
    aiRecommended: true,
    bmiCategory: ["Overweight", "Obese"],
    goalTags: ["weight-loss", "fat-loss", "energy"],
    healthImpacts: ["metabolism", "thermogenesis", "appetite-control"],
    ingredients: ["caffeine", "green-tea", "l-carnitine"],
    popularity: 92,
  },
  {
    id: "4",
    name: "CLA Complex",
    category: "weight-loss",
    price: 32.99,
    description: "Conjugated linoleic acid for lean body composition",
    benefits: ["Supports fat loss", "Preserves muscle", "Natural ingredients"],
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400",
    bmiCategory: ["Overweight", "Obese"],
    goalTags: ["weight-loss", "fat-loss", "lean-muscle"],
    healthImpacts: ["fat-oxidation", "muscle-preservation"],
    ingredients: ["cla", "safflower-oil"],
    popularity: 85,
  },
  {
    id: "5",
    name: "Green Tea Extract",
    category: "weight-loss",
    price: 24.99,
    description: "Natural antioxidant with metabolism-boosting properties",
    benefits: ["Natural fat burning", "Antioxidants", "Energy boost"],
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400",
    bmiCategory: ["Overweight", "Obese", "Normal Weight"],
    goalTags: ["weight-loss", "wellness", "energy"],
    healthImpacts: ["antioxidants", "metabolism", "focus"],
    ingredients: ["green-tea", "egcg"],
    popularity: 90,
  },

  // Protein
  {
    id: "6",
    name: "Premium Whey Isolate",
    category: "protein",
    price: 45.99,
    description: "Ultra-pure whey isolate for maximum protein absorption",
    benefits: ["25g protein", "Fast absorption", "Low carb & fat"],
    image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400",
    aiRecommended: true,
    bmiCategory: ["Normal Weight", "Underweight", "Overweight"],
    goalTags: ["muscle-gain", "recovery", "general-fitness"],
    healthImpacts: ["muscle-growth", "recovery", "protein-synthesis"],
    ingredients: ["whey-isolate", "bcaa"],
    popularity: 98,
  },
  {
    id: "7",
    name: "Plant Protein Blend",
    category: "protein",
    price: 42.99,
    description: "Complete vegan protein from multiple plant sources",
    benefits: ["20g plant protein", "Vegan friendly", "Easy digestion"],
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400",
    bmiCategory: ["Normal Weight", "Overweight"],
    goalTags: ["muscle-gain", "vegan", "wellness"],
    healthImpacts: ["muscle-growth", "digestion", "plant-based"],
    ingredients: ["pea-protein", "rice-protein", "hemp-protein"],
    popularity: 87,
  },
  {
    id: "8",
    name: "Casein Night Protein",
    category: "protein",
    price: 47.99,
    description: "Slow-release protein perfect for overnight recovery",
    benefits: ["Slow digestion", "24g protein", "Muscle recovery"],
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
    bmiCategory: ["Normal Weight", "Underweight"],
    goalTags: ["muscle-gain", "recovery", "sleep"],
    healthImpacts: ["overnight-recovery", "muscle-preservation", "protein-synthesis"],
    ingredients: ["micellar-casein", "calcium"],
    popularity: 84,
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
    goalTags: ["performance", "energy", "endurance"],
    healthImpacts: ["energy", "focus", "endurance", "blood-flow"],
    ingredients: ["caffeine", "beta-alanine", "citrulline", "creatine"],
    popularity: 96,
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
    bmiCategory: ["Normal Weight", "Underweight"],
    goalTags: ["strength", "performance", "muscle-gain"],
    healthImpacts: ["strength", "power-output", "muscle-growth"],
    ingredients: ["creatine-monohydrate"],
    popularity: 99,
  },
  {
    id: "11",
    name: "Beta-Alanine",
    category: "performance",
    price: 27.99,
    description: "Delays muscle fatigue for extended training capacity",
    benefits: ["Reduces fatigue", "Increases endurance", "Better pumps"],
    image: "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=400",
    goalTags: ["endurance", "performance", "cardio"],
    healthImpacts: ["endurance", "fatigue-reduction", "muscular-endurance"],
    ingredients: ["beta-alanine"],
    popularity: 82,
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
    goalTags: ["recovery", "endurance", "muscle-gain"],
    healthImpacts: ["recovery", "muscle-preservation", "hydration"],
    ingredients: ["leucine", "isoleucine", "valine", "electrolytes"],
    popularity: 91,
  },
  {
    id: "13",
    name: "Glutamine Powder",
    category: "recovery",
    price: 31.99,
    description: "Supports immune function and muscle recovery",
    benefits: ["Immune support", "Muscle recovery", "Gut health"],
    image: "https://images.unsplash.com/photo-1729701823810-79d8417053a4?w=400",
    goalTags: ["recovery", "wellness", "immunity"],
    healthImpacts: ["immune-support", "recovery", "gut-health"],
    ingredients: ["l-glutamine"],
    popularity: 80,
  },
  {
    id: "14",
    name: "ZMA Sleep Formula",
    category: "recovery",
    price: 26.99,
    description: "Zinc, magnesium, and B6 for better sleep and recovery",
    benefits: ["Better sleep", "Hormone support", "Recovery aid"],
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
    goalTags: ["sleep", "recovery", "wellness"],
    healthImpacts: ["sleep-quality", "hormone-balance", "recovery"],
    ingredients: ["zinc", "magnesium", "vitamin-b6"],
    popularity: 86,
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
    bmiCategory: ["Normal Weight", "Underweight", "Overweight", "Obese"],
    goalTags: ["wellness", "immunity", "general-fitness"],
    healthImpacts: ["immune-support", "energy", "overall-health"],
    ingredients: ["vitamins", "minerals", "antioxidants"],
    popularity: 94,
  },
  {
    id: "16",
    name: "Omega-3 Fish Oil",
    category: "wellness",
    price: 27.99,
    description: "Ultra-pure omega-3 for heart, brain, and joint health",
    benefits: ["Heart health", "Joint support", "Brain function"],
    image: "https://images.unsplash.com/photo-1576437293196-fc3080b75964?w=400",
    bmiCategory: ["Normal Weight", "Overweight", "Obese"],
    goalTags: ["wellness", "heart-health", "joint-health"],
    healthImpacts: ["cardiovascular", "brain-health", "joint-support", "inflammation"],
    ingredients: ["epa", "dha", "omega-3"],
    popularity: 93,
  },
  {
    id: "17",
    name: "Vitamin D3 + K2",
    category: "wellness",
    price: 19.99,
    description: "Essential vitamins for bone health and immunity",
    benefits: ["Bone strength", "Immune health", "Mood support"],
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400",
    bmiCategory: ["Normal Weight", "Underweight", "Overweight", "Obese"],
    goalTags: ["wellness", "immunity", "bone-health"],
    healthImpacts: ["bone-health", "immune-support", "mood"],
    ingredients: ["vitamin-d3", "vitamin-k2"],
    popularity: 89,
  },
];

export function AIRecommendationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [userGoals, setUserGoals] = useState<string[]>([]);
  const [productFeedback, setProductFeedback] = useState<Record<string, boolean>>({});

  // Calculate BMI category
  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return "Underweight";
    if (bmi >= 18.5 && bmi < 25) return "Normal Weight";
    if (bmi >= 25 && bmi < 30) return "Overweight";
    return "Obese";
  };

  // Smart recommendation algorithm
  const getRecommendations = (context?: string): Recommendation[] => {
    if (!user?.fitnessMetrics?.bmi && userGoals.length === 0) {
      // Return popular products for new users
      return PRODUCT_CATALOG
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, 6)
        .map((product) => ({
          product,
          score: product.popularity || 50,
          rationale: "Popular choice among Vital Box users",
          category: "secondary",
        }));
    }

    const bmi = user?.fitnessMetrics?.bmi || 22;
    const bmiCategory = getBMICategory(bmi);
    const recommendations: Recommendation[] = [];

    PRODUCT_CATALOG.forEach((product) => {
      let score = 0;
      let rationale = "";
      let category: "primary" | "secondary" | "complementary" = "secondary";

      // BMI-based scoring
      if (product.bmiCategory?.includes(bmiCategory)) {
        score += 40;
        rationale = `Recommended for ${bmiCategory} BMI (${bmi})`;
        category = "primary";
      }

      // Goal-based scoring
      const matchingGoals = product.goalTags?.filter((tag) => userGoals.includes(tag)) || [];
      if (matchingGoals.length > 0) {
        score += matchingGoals.length * 25;
        if (rationale) {
          rationale += ` and aligns with your ${matchingGoals.join(", ")} goals`;
        } else {
          rationale = `Matches your ${matchingGoals.join(", ")} goals`;
          category = "primary";
        }
      }

      // Popularity boost
      score += (product.popularity || 50) * 0.2;

      // User feedback consideration
      if (productFeedback[product.id] === true) {
        score += 15;
      } else if (productFeedback[product.id] === false) {
        score -= 30;
      }

      // Context-specific boosts
      if (context === "post-workout" && product.category === "recovery") {
        score += 20;
        rationale += " (perfect for post-workout recovery)";
      }
      if (context === "morning" && product.category === "wellness") {
        score += 20;
        rationale += " (great for your morning routine)";
      }

      // AI recommendation boost
      if (product.aiRecommended && score > 30) {
        score += 10;
      }

      // Only include products with reasonable scores
      if (score > 20) {
        recommendations.push({
          product,
          score,
          rationale: rationale || "Quality supplement for your fitness journey",
          category: score > 60 ? "primary" : score > 40 ? "secondary" : "complementary",
        });
      }
    });

    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
  };

  // Generate AI insights
  const getAIInsights = (): AIInsight[] => {
    const insights: AIInsight[] = [];
    
    if (!user?.fitnessMetrics?.bmi) {
      insights.push({
        message: "Calculate your BMI to get personalized supplement recommendations tailored to your body composition.",
        type: "tip",
      });
      return insights;
    }

    const bmi = user.fitnessMetrics.bmi;
    const bmiCategory = getBMICategory(bmi);

    // BMI-specific insights
    if (bmiCategory === "Underweight") {
      insights.push({
        message: "Your BMI suggests you could benefit from mass gainers and protein supplements to support healthy weight gain.",
        type: "recommendation",
        products: PRODUCT_CATALOG.filter(p => p.category === "weight-gain").slice(0, 2),
      });
    } else if (bmiCategory === "Overweight" || bmiCategory === "Obese") {
      insights.push({
        message: "Based on your BMI, metabolism-boosting supplements and lean protein can support your wellness journey.",
        type: "recommendation",
        products: PRODUCT_CATALOG.filter(p => p.category === "weight-loss").slice(0, 2),
      });
    } else {
      insights.push({
        message: "Your BMI is in the healthy range! Maintain it with balanced nutrition and quality supplements.",
        type: "achievement",
      });
    }

    // Goal-based insights
    if (userGoals.includes("muscle-gain")) {
      insights.push({
        message: "For muscle gain, combine protein supplements with creatine and ensure adequate calorie intake.",
        type: "tip",
      });
    }

    if (userGoals.includes("weight-loss")) {
      insights.push({
        message: "Focus on a slight calorie deficit, high protein intake, and thermogenic supplements for best fat loss results.",
        type: "tip",
      });
    }

    // General wellness tip
    insights.push({
      message: "Don't forget your daily multivitamin and omega-3 for overall health and recovery support.",
      type: "tip",
    });

    return insights;
  };

  const addProductFeedback = (productId: string, liked: boolean) => {
    setProductFeedback((prev) => ({
      ...prev,
      [productId]: liked,
    }));
  };

  const updateUserGoals = (goals: string[]) => {
    setUserGoals(goals);
  };

  return (
    <AIRecommendationContext.Provider
      value={{
        getRecommendations,
        getAIInsights,
        addProductFeedback,
        products: PRODUCT_CATALOG,
        updateUserGoals,
        userGoals,
      }}
    >
      {children}
    </AIRecommendationContext.Provider>
  );
}

export function useAIRecommendations() {
  const context = useContext(AIRecommendationContext);
  if (!context) {
    throw new Error("useAIRecommendations must be used within AIRecommendationProvider");
  }
  return context;
}
