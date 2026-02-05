"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { useAuth } from "./AuthContext";
import { useAIRecommendations } from "./AIRecommendationEngine";
import {
  Activity,
  Scale,
  Ruler,
  Sparkles,
  Plus,
  Heart,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ShoppingCart,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface BMICalculatorPageProps {
  onSignInClick?: () => void;
}

interface BMIResult {
  value: number;
  category: string;
  healthNote: string;
  color: string;
  aiRecommendation?: string;
  healthRisks?: string[];
  actionItems?: string[];
  lifestyleTips?: string[];
}

export function BMICalculatorPage({ onSignInClick }: BMICalculatorPageProps) {
  const { user, updateFitnessMetrics } = useAuth();
  const { updateUserGoals } = useAIRecommendations();
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [result, setResult] = useState<BMIResult | null>(null);

  const calculateBMI = () => {
    if (!height || !weight) return;

    let bmi: number;

    if (unit === "metric") {
      const heightInMeters = parseFloat(height) / 100;
      bmi = parseFloat(weight) / (heightInMeters * heightInMeters);
    } else {
      const heightInInches = parseFloat(height);
      bmi = (parseFloat(weight) / (heightInInches * heightInInches)) * 703;
    }

    let category = "";
    let healthNote = "";
    let color = "";
    let aiRecommendation = "";
    let healthRisks: string[] = [];
    let actionItems: string[] = [];
    let lifestyleTips: string[] = [];

    if (bmi < 18.5) {
      category = "Underweight";
      healthNote = "Consider gaining healthy weight";
      color = "text-blue-600";
      aiRecommendation =
        "Your BMI indicates you're underweight. Focus on nutrient-dense foods and strength training to build healthy muscle mass.";
      healthRisks = [
        "Weakened immune system",
        "Nutritional deficiencies",
        "Decreased bone density",
      ];
      actionItems = [
        "Increase caloric intake with nutrient-rich foods",
        "Consider strength training exercises",
        "Consult a nutritionist for a personalized meal plan",
      ];
      lifestyleTips = [
        "Eat 5-6 smaller meals throughout the day",
        "Include protein in every meal",
        "Add healthy fats like nuts and avocados",
      ];
    } else if (bmi >= 18.5 && bmi < 25) {
      category = "Normal Weight";
      healthNote = "You're in the healthy range!";
      color = "text-emerald-600";
      aiRecommendation =
        "Excellent! Your BMI is in the healthy range. Maintain this with balanced nutrition and regular exercise.";
      healthRisks = [
        "Minimal health risks at this BMI",
        "Continue monitoring your health metrics",
      ];
      actionItems = [
        "Maintain current healthy habits",
        "Stay active with 150+ minutes of exercise weekly",
        "Keep a balanced diet rich in whole foods",
      ];
      lifestyleTips = [
        "Mix cardio and strength training",
        "Stay hydrated with 8+ glasses of water daily",
        "Get 7-9 hours of quality sleep",
      ];
    } else if (bmi >= 25 && bmi < 30) {
      category = "Overweight";
      healthNote = "Focus on balanced nutrition";
      color = "text-orange-600";
      aiRecommendation =
        "Your BMI suggests you're in the overweight category. Small lifestyle changes can make a big difference.";
      healthRisks = [
        "Increased risk of cardiovascular disease",
        "Higher likelihood of type 2 diabetes",
        "Joint stress and mobility issues",
      ];
      actionItems = [
        "Create a sustainable calorie deficit",
        "Increase physical activity gradually",
        "Focus on whole foods and reduce processed foods",
      ];
      lifestyleTips = [
        "Aim for 30-60 minutes of daily activity",
        "Practice portion control",
        "Track your food intake and progress",
      ];
    } else {
      category = "Obese";
      healthNote = "Consult a health professional";
      color = "text-red-600";
      aiRecommendation =
        "Your BMI indicates obesity. We strongly recommend consulting with a healthcare provider to create a comprehensive health plan.";
      healthRisks = [
        "Significantly increased cardiovascular risk",
        "Higher risk of type 2 diabetes and metabolic syndrome",
        "Increased likelihood of sleep apnea",
      ];
      actionItems = [
        "Schedule a consultation with your doctor",
        "Work with a registered dietitian",
        "Start with low-impact exercises like walking",
      ];
      lifestyleTips = [
        "Set small, achievable goals",
        "Build a support system",
        "Focus on gradual, sustainable changes",
      ];
    }

    const bmiResult: BMIResult = {
      value: Math.round(bmi * 10) / 10,
      category,
      healthNote,
      color,
      aiRecommendation,
      healthRisks,
      actionItems,
      lifestyleTips,
    };

    setResult(bmiResult);

    if (user) {
      const now = new Date().toISOString();

      updateFitnessMetrics({
        latestBMI: {
          value: bmiResult.value,
          category: bmiResult.category,
          height: parseFloat(height),
          weight: parseFloat(weight),
          unit,
          date: now,
        },
        height: parseFloat(height),
        weight: parseFloat(weight),
        unit,
      });

      // Keep goals in sync for AI engine (even if we don't show supplements here)
      const goals: string[] = [];
      if (bmi < 18.5) {
        goals.push("weight-gain", "muscle-gain");
      } else if (bmi >= 25) {
        goals.push("weight-loss", "wellness");
      } else {
        goals.push("general-fitness", "wellness");
      }
      updateUserGoals(goals);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 relative overflow-hidden flex items-center justify-center">
      {/* Minimal Live Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #10b981 1px, transparent 1px),
              linear-gradient(to bottom, #10b981 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Animated Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 -left-20 w-96 h-96 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-gradient-to-br from-teal-200/20 to-cyan-200/20 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 20, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Floating Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400/30 rounded-full"
            style={{
              left: `${15 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          />
        ))}

        {/* Pulse Rings */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-emerald-300/10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.05, 0.1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-teal-300/10"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.08, 0.03, 0.08],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <div className="max-w-2xl w-full mx-auto relative z-10">
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
            <Activity className="w-5 h-5 text-emerald-600" />
            <span
              className="font-medium text-emerald-700 uppercase tracking-wider"
              style={{ fontSize: "0.75rem", letterSpacing: "0.1em" }}
            >
              HEALTH CALCULATOR
            </span>
          </motion.div>

          <h1
            className="text-5xl md:text-6xl mb-4 tracking-tight"
            style={{ fontWeight: 700 }}
          >
            <span className="text-gray-900">BMI </span>
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent inline-block">
              Calculator
            </span>
          </h1>
        </motion.div>

        {/* Glassmorphic Calculator Card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white/75 backdrop-blur-2xl rounded-[2.5rem] border border-gray-300/40 shadow-2xl p-10"
        >
          {/* Unit Toggle */}
          <div className="flex justify-center gap-3 mb-10">
            <Button
              variant={unit === "metric" ? "default" : "outline"}
              onClick={() => setUnit("metric")}
              className={
                unit === "metric"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full px-8"
                  : "rounded-full px-8"
              }
            >
              Metric (cm/kg)
            </Button>
            <Button
              variant={unit === "imperial" ? "default" : "outline"}
              onClick={() => setUnit("imperial")}
              className={
                unit === "imperial"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full px-8"
                  : "rounded-full px-8"
              }
            >
              Imperial (in/lbs)
            </Button>
          </div>

          {/* Input Fields */}
          <div className="space-y-6 mb-8">
            <div>
              <Label className="flex items-center gap-2 mb-3 text-gray-700 text-base">
                <Ruler className="w-5 h-5 text-emerald-600" />
                Height {unit === "metric" ? "(cm)" : "(inches)"}
              </Label>
              <Input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder={unit === "metric" ? "170" : "67"}
                className="h-14 text-lg bg-white/90 backdrop-blur-xl border-2 border-gray-300 focus:border-emerald-500 rounded-xl"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-3 text-gray-700 text-base">
                <Scale className="w-5 h-5 text-emerald-600" />
                Weight {unit === "metric" ? "(kg)" : "(lbs)"}
              </Label>
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={unit === "metric" ? "70" : "154"}
                className="h-14 text-lg bg-white/90 backdrop-blur-xl border-2 border-gray-300 focus:border-emerald-500 rounded-xl"
              />
            </div>
          </div>

          {/* Calculate Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={calculateBMI}
              disabled={!height || !weight}
              className="w-full h-16 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl shadow-xl text-lg font-semibold uppercase tracking-wider relative overflow-hidden group"
              style={{ letterSpacing: "0.1em" }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-500"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.4 }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Activity className="w-5 h-5" />
                Calculate BMI
              </span>
            </Button>
          </motion.div>

          {/* Result */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6 }}
                className="mt-10"
              >
                {/* BMI Score Card */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-xl rounded-3xl border border-gray-200/60 p-8 shadow-lg mb-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex-1">
                      <p
                        className="text-gray-500 uppercase tracking-widest mb-2"
                        style={{ fontSize: "0.7rem" }}
                      >
                        Your BMI Score
                      </p>
                      <div className="flex items-baseline gap-3">
                        <span
                          className={result.color}
                          style={{
                            fontSize: "4rem",
                            fontWeight: 700,
                            lineHeight: 1,
                          }}
                        >
                          {result.value}
                        </span>
                        <div>
                          <p
                            className={`${result.color} mb-1`}
                            style={{ fontSize: "1.25rem", fontWeight: 600 }}
                          >
                            {result.category}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {result.healthNote}
                          </p>
                        </div>
                      </div>
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center"
                    >
                      <Activity className="w-10 h-10 text-emerald-600" />
                    </motion.div>
                  </div>

                  {/* AI Insight */}
                  {result.aiRecommendation && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 rounded-2xl p-5 border border-emerald-200/40"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-emerald-900 font-medium mb-1 text-sm uppercase tracking-wider">
                            AI Health Insight
                          </p>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {result.aiRecommendation}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Detailed Health Insights */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {/* Health Risks */}
                  {result.healthRisks && result.healthRisks.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-xl rounded-2xl border border-gray-200/60 p-5 shadow-md"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        <h4
                          className="text-gray-900 uppercase tracking-wider"
                          style={{ fontSize: "0.75rem", fontWeight: 600 }}
                        >
                          Health Considerations
                        </h4>
                      </div>
                      <ul className="space-y-2">
                        {result.healthRisks.map((risk, i) => (
                          <li
                            key={i}
                            className="text-gray-600 text-xs flex items-start gap-2"
                          >
                            <span className="w-1 h-1 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {/* Action Items */}
                  {result.actionItems && result.actionItems.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-xl rounded-2xl border border-gray-200/60 p-5 shadow-md"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <h4
                          className="text-gray-900 uppercase tracking-wider"
                          style={{ fontSize: "0.75rem", fontWeight: 600 }}
                        >
                          Recommended Actions
                        </h4>
                      </div>
                      <ul className="space-y-2">
                        {result.actionItems.map((action, i) => (
                          <li
                            key={i}
                            className="text-gray-600 text-xs flex items-start gap-2"
                          >
                            <span className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {/* Lifestyle Tips */}
                  {result.lifestyleTips && result.lifestyleTips.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-xl rounded-2xl border border-gray-200/60 p-5 shadow-md"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Heart className="w-5 h-5 text-rose-500" />
                        <h4
                          className="text-gray-900 uppercase tracking-wider"
                          style={{ fontSize: "0.75rem", fontWeight: 600 }}
                        >
                          Lifestyle Tips
                        </h4>
                      </div>
                      <ul className="space-y-2">
                        {result.lifestyleTips.map((tip, i) => (
                          <li
                            key={i}
                            className="text-gray-600 text-xs flex items-start gap-2"
                          >
                            <span className="w-1 h-1 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
