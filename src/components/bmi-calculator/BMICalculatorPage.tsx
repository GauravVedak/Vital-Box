"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { useAuth } from "../AuthContext";
import { getBMICategoryData } from "./data";
import {
  Scale,
  Ruler,
} from "lucide-react";

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

type Unit = "metric" | "imperial";

export function BMICalculatorPage({ onSignInClick }: BMICalculatorPageProps) {
  const { user, updateFitnessMetrics } = useAuth();
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<Unit>("metric");
  const [result, setResult] = useState<BMIResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateInputs = (): string | null => {
    const parsedHeight = parseFloat(height);
    const parsedWeight = parseFloat(weight);

    if (isNaN(parsedHeight) || isNaN(parsedWeight) || parsedHeight <= 0 || parsedWeight <= 0) {
      return "Please enter valid positive numbers.";
    }

    // PREVENT BAD DATA FROM EVEN HITTING BACKEND (UX)
    const minHeight = unit === "metric" ? 50 : 20;
    const maxHeight = unit === "metric" ? 250 : 100;
    const minWeight = unit === "metric" ? 20 : 40;
    const maxWeight = unit === "metric" ? 300 : 700;

    if (parsedHeight < minHeight || parsedHeight > maxHeight) {
      return `Height: ${minHeight}-${maxHeight}${unit === "metric" ? "cm" : "in"}`;
    }
    if (parsedWeight < minWeight || parsedWeight > maxWeight) {
      return `Weight: ${minWeight}-${maxWeight}${unit === "metric" ? "kg" : "lbs"}`;
    }

    return null;
  };

  const calculateBMI = async () => {
    const validationError = validateInputs();
    if (validationError) {
      alert(validationError);
      return;
    }

    let bmi: number;
    if (unit === "metric") {
      const heightInMeters = parseFloat(height) / 100;
      bmi = parseFloat(weight) / (heightInMeters * heightInMeters);
    } else {
      const heightInInches = parseFloat(height);
      bmi = (parseFloat(weight) / (heightInInches * heightInInches)) * 703;
    }

    const rounded = Math.round(bmi * 10) / 10;
    const categoryData = getBMICategoryData(bmi);

    const bmiResult: BMIResult = { value: rounded, ...categoryData };
    setResult(bmiResult);

    // YOUR BACKEND DOES ALL SANITIZATION + SECURITY HERE ↓
    if (user) {
      setIsSubmitting(true);
      try {
        await updateFitnessMetrics({
          latestBMI: {
            value: bmiResult.value,
            category: bmiResult.category,
            height: parseFloat(height),
            weight: parseFloat(weight),
            unit,
            date: new Date().toISOString(),
          },
          height: parseFloat(height),
          weight: parseFloat(weight),
          unit,
        });
      } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "Failed to save BMI data";
          console.error("Failed to save BMI:", error);
          alert(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    } else if (onSignInClick) {
      onSignInClick();
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 relative overflow-hidden flex items-center justify-center">
      {/* Your existing background + all JSX stays IDENTICAL */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* ... your existing background code ... */}
      </div>

      <div className="max-w-2xl w-full mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl mt-12 mb-4 tracking-tight" style={{ fontWeight: 700 }}>
            <span className="text-gray-900">BMI </span>
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent inline-block">Calculator</span>
          </h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="bg-white/75 backdrop-blur-2xl rounded-[2.5rem] border border-gray-300/40 shadow-2xl p-10">
          {/* Unit Toggle - unchanged */}
          <div className="flex justify-center gap-3 mb-10">
            <Button variant={unit === "metric" ? "default" : "outline"} onClick={() => setUnit("metric")} className={unit === "metric" ? "bg-gradient-to-r cursor-pointer from-emerald-500 to-teal-600 text-white rounded-full px-8" : "rounded-full px-8 cursor-pointer"}>
              Metric (cm/kg)
            </Button>
            <Button variant={unit === "imperial" ? "default" : "outline"} onClick={() => setUnit("imperial")} className={unit === "imperial" ? "bg-gradient-to-r cursor-pointer from-emerald-500 to-teal-600 text-white rounded-full px-8" : "rounded-full px-8 cursor-pointer"}>
              Imperial (in/lbs)
            </Button>
          </div>

          {/* Inputs - ADD DISABLED STATE */}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Calculate Button - ADD LOADING STATE */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex justify-center items-center">
            <Button
              onClick={calculateBMI}
              disabled={!height || !weight || isSubmitting}
              className="w-max-10 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl shadow-xl text-md font-semibold uppercase tracking-wider relative overflow-hidden group"
              style={{ letterSpacing: "0.1em" }}
            >
              {isSubmitting ? "Saving..." : "Calculate BMI"}
            </Button>
          </motion.div>

          {/* Your existing result JSX - paste it here exactly as-is */}
          <AnimatePresence>
            {result && (
              // ... your entire existing result section JSX ...
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.6 }} className="mt-10">
                {/* Your existing BMI result card JSX */}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
