export interface BMICategoryData {
  category: string;
  healthNote: string;
  color: string;
  aiRecommendation: string;
  healthRisks: string[];
  actionItems: string[];
  lifestyleTips: string[];
}

const BMI_CATEGORIES: { max: number; data: BMICategoryData }[] = [
  {
    max: 18.5,
    data: {
      category: "Underweight",
      healthNote: "Consider gaining healthy weight",
      color: "text-blue-600",
      aiRecommendation:
        "Your BMI indicates you're underweight. Focus on nutrient-dense foods and strength training to build healthy muscle mass.",
      healthRisks: [
        "Weakened immune system",
        "Nutritional deficiencies",
        "Decreased bone density",
      ],
      actionItems: [
        "Increase caloric intake with nutrient-rich foods",
        "Consider strength training exercises",
        "Consult a nutritionist for a personalized meal plan",
      ],
      lifestyleTips: [
        "Eat 5-6 smaller meals throughout the day",
        "Include protein in every meal",
        "Add healthy fats like nuts and avocados",
      ],
    },
  },
  {
    max: 25,
    data: {
      category: "Normal Weight",
      healthNote: "You're in the healthy range!",
      color: "text-emerald-600",
      aiRecommendation:
        "Excellent! Your BMI is in the healthy range. Maintain this with balanced nutrition and regular exercise.",
      healthRisks: [
        "Minimal health risks at this BMI",
        "Continue monitoring your health metrics",
      ],
      actionItems: [
        "Maintain current healthy habits",
        "Stay active with 150+ minutes of exercise weekly",
        "Keep a balanced diet rich in whole foods",
      ],
      lifestyleTips: [
        "Mix cardio and strength training",
        "Stay hydrated with 8+ glasses of water daily",
        "Get 7-9 hours of quality sleep",
      ],
    },
  },
  {
    max: 30,
    data: {
      category: "Overweight",
      healthNote: "Focus on balanced nutrition",
      color: "text-orange-600",
      aiRecommendation:
        "Your BMI suggests you're in the overweight category. Small lifestyle changes can make a big difference.",
      healthRisks: [
        "Increased risk of cardiovascular disease",
        "Higher likelihood of type 2 diabetes",
        "Joint stress and mobility issues",
      ],
      actionItems: [
        "Create a sustainable calorie deficit",
        "Increase physical activity gradually",
        "Focus on whole foods and reduce processed foods",
      ],
      lifestyleTips: [
        "Aim for 30-60 minutes of daily activity",
        "Practice portion control",
        "Track your food intake and progress",
      ],
    },
  },
  {
    max: Infinity,
    data: {
      category: "Obese",
      healthNote: "Consult a health professional",
      color: "text-red-600",
      aiRecommendation:
        "Your BMI indicates obesity. We strongly recommend consulting with a healthcare provider to create a comprehensive health plan.",
      healthRisks: [
        "Significantly increased cardiovascular risk",
        "Higher risk of type 2 diabetes and metabolic syndrome",
        "Increased likelihood of sleep apnea",
      ],
      actionItems: [
        "Schedule a consultation with your doctor",
        "Work with a registered dietitian",
        "Start with low-impact exercises like walking",
      ],
      lifestyleTips: [
        "Set small, achievable goals",
        "Build a support system",
        "Focus on gradual, sustainable changes",
      ],
    },
  },
];

export function getBMICategoryData(bmi: number): BMICategoryData {
  const entry = BMI_CATEGORIES.find((c) => bmi < c.max);
  return entry!.data;
}

export function getAIGoalsForBMI(bmi: number): string[] {
  if (bmi < 18.5) {
    return ["weight-gain", "muscle-gain"];
  }
  if (bmi >= 25) {
    return ["weight-loss", "wellness"];
  }
  return ["general-fitness", "wellness"];
}
