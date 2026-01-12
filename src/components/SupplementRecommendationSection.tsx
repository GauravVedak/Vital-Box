import { motion } from "motion/react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { 
  Dumbbell, 
  Shield, 
  Zap, 
  Heart,
  FlaskConical,
  Pill,
  Plus,
  TrendingUp,
  Activity
} from "lucide-react";
import { useState } from "react";

const supplementPersonas = [
  {
    id: "muscle-gain",
    title: "Muscle Gain",
    icon: Dumbbell,
    color: "emerald",
    gradient: "from-emerald-500 to-teal-600",
    bgGradient: "from-emerald-50 to-teal-50",
    description: "Build lean muscle mass",
    supplements: [
      { name: "Whey Protein", dose: "25g", benefit: "Muscle Recovery", icon: Pill },
      { name: "Creatine", dose: "5g", benefit: "Strength Boost", icon: FlaskConical },
      { name: "BCAA Complex", dose: "10g", benefit: "Endurance", icon: Activity },
    ],
  },
  {
    id: "immunity",
    title: "Immunity Boost",
    icon: Shield,
    color: "blue",
    gradient: "from-blue-500 to-cyan-600",
    bgGradient: "from-blue-50 to-cyan-50",
    description: "Strengthen immune system",
    supplements: [
      { name: "Vitamin C", dose: "1000mg", benefit: "Immune Support", icon: Pill },
      { name: "Zinc", dose: "50mg", benefit: "Defense", icon: FlaskConical },
      { name: "Elderberry", dose: "500mg", benefit: "Antioxidants", icon: Heart },
    ],
  },
  {
    id: "energy",
    title: "Energy & Recovery",
    icon: Zap,
    color: "amber",
    gradient: "from-amber-500 to-orange-600",
    bgGradient: "from-amber-50 to-orange-50",
    description: "Maximize daily performance",
    supplements: [
      { name: "B-Complex", dose: "100mg", benefit: "Energy Boost", icon: Pill },
      { name: "Magnesium", dose: "400mg", benefit: "Recovery", icon: FlaskConical },
      { name: "CoQ10", dose: "200mg", benefit: "Cellular Energy", icon: Zap },
    ],
  },
];

export function SupplementRecommendationSection() {
  const [flippedCard, setFlippedCard] = useState<string | null>(null);
  const [activePersona, setActivePersona] = useState(0);

  return (
    <section className="py-32 px-6 bg-gradient-to-b from-white via-gray-50/30 to-white relative overflow-hidden">
      {/* Background medical pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64">
          <motion.svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          >
            <circle cx="50" cy="50" r="40" stroke="#10b981" strokeWidth="0.5" fill="none" />
            <circle cx="50" cy="50" r="30" stroke="#14b8a6" strokeWidth="0.5" fill="none" />
            <circle cx="50" cy="50" r="20" stroke="#06b6d4" strokeWidth="0.5" fill="none" />
          </motion.svg>
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-full border border-emerald-200 mb-6"
          >
            <FlaskConical className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">AI-Curated Supplement Plans</span>
          </motion.div>

          <h2 
            className="text-4xl md:text-5xl mb-4"
            style={{ 
              fontWeight: 700,
              color: '#030213'
            }}
          >
            <span className="inline-block">Personalized</span>{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent inline-block">
              For Your Goals
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Science-backed supplement combinations tailored to your unique health profile
          </p>
        </motion.div>

        {/* Persona tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center gap-3 mb-12"
        >
          {supplementPersonas.map((persona, index) => (
            <motion.button
              key={persona.id}
              onClick={() => setActivePersona(index)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 transition-all duration-300 ${
                activePersona === index
                  ? `bg-gradient-to-r ${persona.gradient} text-white border-transparent shadow-lg`
                  : "bg-white text-gray-700 border-gray-200 hover:border-emerald-300"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <persona.icon className="w-5 h-5" />
              <span className="font-medium">{persona.title}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Active persona card */}
        <motion.div
          key={activePersona}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <Card className={`p-8 bg-gradient-to-br ${supplementPersonas[activePersona].bgGradient} border-2 border-${supplementPersonas[activePersona].color}-200 overflow-hidden`}>
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            />

            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <motion.div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${supplementPersonas[activePersona].gradient} flex items-center justify-center shadow-xl`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    {(() => {
                      const Icon = supplementPersonas[activePersona].icon;
                      return <Icon className="w-8 h-8 text-white" />;
                    })()}
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {supplementPersonas[activePersona].title}
                    </h3>
                    <p className="text-gray-600">{supplementPersonas[activePersona].description}</p>
                  </div>
                </div>
                <Badge className={`bg-gradient-to-r ${supplementPersonas[activePersona].gradient} text-white`}>
                  AI Recommended
                </Badge>
              </div>

              {/* Supplement cards */}
              <div className="grid md:grid-cols-3 gap-4">
                {supplementPersonas[activePersona].supplements.map((supplement, index) => (
                  <motion.div
                    key={supplement.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onHoverStart={() => setFlippedCard(supplement.name)}
                    onHoverEnd={() => setFlippedCard(null)}
                  >
                    <motion.div
                      className="relative h-48"
                      style={{ perspective: 1000 }}
                    >
                      <motion.div
                        className="absolute w-full h-full"
                        animate={{ rotateY: flippedCard === supplement.name ? 180 : 0 }}
                        transition={{ duration: 0.6 }}
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        {/* Front */}
                        <div 
                          className="absolute w-full h-full backface-hidden"
                          style={{ backfaceVisibility: "hidden" }}
                        >
                          <Card className="h-full p-6 bg-white hover:shadow-xl transition-shadow cursor-pointer border-2 border-gray-100">
                            <div className="flex flex-col h-full">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${supplementPersonas[activePersona].gradient} flex items-center justify-center mb-4 shadow-lg`}>
                                {(() => {
                                  const Icon = supplement.icon;
                                  return <Icon className="w-6 h-6 text-white" />;
                                })()}
                              </div>
                              <h4 className="font-bold text-gray-900 mb-2">{supplement.name}</h4>
                              <p className="text-sm text-gray-600 mb-2">{supplement.dose}</p>
                              <div className="mt-auto">
                                <Badge variant="secondary" className={`bg-${supplementPersonas[activePersona].color}-50 text-${supplementPersonas[activePersona].color}-700 text-xs`}>
                                  {supplement.benefit}
                                </Badge>
                              </div>
                            </div>
                          </Card>
                        </div>

                        {/* Back */}
                        <div 
                          className="absolute w-full h-full"
                          style={{ 
                            backfaceVisibility: "hidden",
                            transform: "rotateY(180deg)"
                          }}
                        >
                          <Card className={`h-full p-6 bg-gradient-to-br ${supplementPersonas[activePersona].gradient} text-white`}>
                            <div className="flex flex-col h-full justify-between">
                              <div>
                                <h4 className="font-bold mb-3">{supplement.name}</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    <span>{supplement.benefit}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <FlaskConical className="w-4 h-4" />
                                    <span>Clinical-grade formula</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    <span>Third-party tested</span>
                                  </div>
                                </div>
                              </div>
                              <Button 
                                variant="secondary"
                                size="sm"
                                className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add to Box
                              </Button>
                            </div>
                          </Card>
                        </div>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 text-center"
              >
                <Button
                  onClick={() => window.location.hash = "#choose-box"}
                  className={`bg-gradient-to-r ${supplementPersonas[activePersona].gradient} text-white px-8 py-6 rounded-xl shadow-xl`}
                  style={{ fontSize: '1.125rem', fontWeight: 600 }}
                >
                  Build My Custom Box
                  <Plus className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
