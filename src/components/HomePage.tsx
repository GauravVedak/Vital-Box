import { motion } from "motion/react";
import { 
  Sparkles, 
  Shield, 
  Activity, 
  Zap,
  CheckCircle,
  ArrowRight,
  Heart,
  Brain,
  Pill,
  Award,
  TrendingUp,
  Users,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useAIRecommendations } from "./AIRecommendationEngine";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function HomePage() {
  const { user } = useAuth();
  const { getRecommendations, getAIInsights } = useAIRecommendations();
  const [activePersona, setActivePersona] = useState(0);

  // Animated background component
  const AnimatedBackground = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Clinical Grid */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #10b981 1px, transparent 1px),
            linear-gradient(to bottom, #10b981 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Floating Molecules */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`molecule-${i}`}
          className="absolute w-2 h-2 rounded-full bg-emerald-400/20"
          style={{
            left: `${10 + i * 8}%`,
            top: `${15 + (i % 3) * 30}%`,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.sin(i) * 20, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 4 + i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        />
      ))}

      {/* ECG Heartbeat Line */}
      <svg className="absolute top-1/3 left-0 w-full h-32 opacity-10" viewBox="0 0 1200 100">
        <motion.path
          d="M0,50 L200,50 L220,30 L240,70 L260,50 L1200,50"
          stroke="url(#ecgGradient)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <defs>
          <linearGradient id="ecgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>

      {/* Gradient Orbs */}
      <motion.div
        className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-emerald-200/10 to-teal-200/10 rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-teal-200/10 to-cyan-200/10 rounded-full blur-3xl"
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-cyan-200/5 to-emerald-200/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );

  // Hero Section
  const HeroSection = () => (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-32 pb-20">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-xl rounded-full border border-emerald-300/50 shadow-lg mb-8"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </motion.div>
              <span className="text-emerald-700 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.15em', fontWeight: 600 }}>
                Medical AI Verified
              </span>
              <motion.div
                className="w-2 h-2 rounded-full bg-emerald-500"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            <h1 className="mb-6 tracking-tight leading-tight" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 700 }}>
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Supplements Tailored
              </motion.span>
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                To You.{" "}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Powered by AI.
                </span>
              </motion.span>
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Trusted by Medicine.
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-gray-600 mb-10 max-w-xl mx-auto lg:mx-0"
              style={{ fontSize: '1.125rem', lineHeight: 1.7 }}
            >
              AI studies your BMI and goals; our providers are clinically verified for safety and results.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <motion.button
                onClick={() => window.location.hash = '#bmi'}
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(16, 185, 129, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white rounded-2xl shadow-xl relative overflow-hidden group"
                style={{ fontSize: '1.125rem', fontWeight: 600 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-500"
                  initial={{ x: "100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Get Safe AI Suggestions
                  <ArrowRight className="w-5 h-5" />
                </span>
              </motion.button>

              <motion.button
                onClick={() => {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/80 backdrop-blur-xl border-2 border-gray-200 text-gray-700 rounded-2xl hover:border-emerald-300 transition-all"
                style={{ fontSize: '1.125rem', fontWeight: 600 }}
              >
                <span className="flex items-center justify-center gap-2">
                  See How It Works
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </span>
              </motion.button>
            </motion.div>

            {/* User Panel Button - Visible when signed in */}
            {user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-6 flex justify-center lg:justify-start"
              >
                <motion.button
                  onClick={() => window.location.hash = '#user-panel'}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-white/90 backdrop-blur-xl border-2 border-emerald-300 text-emerald-600 rounded-2xl hover:bg-emerald-50 transition-all flex items-center gap-2 shadow-lg"
                  style={{ fontSize: '1rem', fontWeight: 600 }}
                >
                  <User className="w-5 h-5" />
                  <span>My User Panel</span>
                </motion.button>
              </motion.div>
            )}

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-12 flex items-center gap-6 justify-center lg:justify-start flex-wrap"
            >
              <div className="flex items-center gap-2 text-gray-600">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span className="text-sm" style={{ fontWeight: 500 }}>Clinically Proven</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Activity className="w-5 h-5 text-emerald-600" />
                <span className="text-sm" style={{ fontWeight: 500 }}>Medical Grade</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-sm" style={{ fontWeight: 500 }}>AI Personalized</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: 3D Product Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Main Product Image */}
              <motion.div
                className="relative z-10"
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-full h-full bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-2xl rounded-[3rem] border border-gray-200/60 shadow-2xl p-12 flex items-center justify-center">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1680265158261-5fd6ba5d9959?w=600"
                    alt="Vital Box Supplement"
                    className="w-full h-full object-contain"
                  />
                </div>
              </motion.div>

              {/* Floating Medical Icons */}
              {[
                { icon: Heart, position: { top: '10%', left: '5%' }, delay: 0 },
                { icon: Brain, position: { top: '15%', right: '10%' }, delay: 0.2 },
                { icon: Pill, position: { bottom: '20%', left: '8%' }, delay: 0.4 },
                { icon: Activity, position: { bottom: '15%', right: '5%' }, delay: 0.6 },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  className="absolute w-16 h-16 bg-white/90 backdrop-blur-xl rounded-2xl border border-emerald-200/50 shadow-xl flex items-center justify-center"
                  style={item.position}
                  animate={{
                    y: [0, -15, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: item.delay,
                  }}
                >
                  <item.icon className="w-8 h-8 text-emerald-600" />
                </motion.div>
              ))}

              {/* AI Circuit Badge */}
              <motion.div
                className="absolute top-0 right-0 w-24 h-24"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 360],
                }}
                transition={{
                  scale: { duration: 3, repeat: Infinity },
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                }}
              >
                <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-2xl">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );

  // Personalized Supplement Preview
  const PersonalizedPicks = () => {
    const personas = [
      {
        goal: "Muscle Gain",
        icon: TrendingUp,
        color: "from-blue-500 to-purple-600",
        products: getRecommendations().filter(r => r.product.goalTags?.includes("muscle-gain")).slice(0, 3),
      },
      {
        goal: "Weight Loss",
        icon: Activity,
        color: "from-orange-500 to-red-600",
        products: getRecommendations().filter(r => r.product.goalTags?.includes("weight-loss")).slice(0, 3),
      },
      {
        goal: "Wellness",
        icon: Heart,
        color: "from-emerald-500 to-teal-600",
        products: getRecommendations().filter(r => r.product.category === "wellness").slice(0, 3),
      },
      {
        goal: "Performance",
        icon: Zap,
        color: "from-yellow-500 to-orange-600",
        products: getRecommendations().filter(r => r.product.category === "performance").slice(0, 3),
      },
    ];

    return (
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-xl rounded-full border border-emerald-300/50 shadow-lg mb-6">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.15em', fontWeight: 600 }}>
                Your Personalized Picks
              </span>
            </div>
            <h2 className="tracking-tight mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700 }}>
              <span className="text-gray-900">Matched to </span>
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent inline-block">
                Your Profile
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto" style={{ fontSize: '1.125rem' }}>
              AI-curated supplements for every fitness goal, backed by clinical research
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {personas.map((persona, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white/70 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-xl overflow-hidden"
              >
                <div className={`h-2 bg-gradient-to-r ${persona.color}`} />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${persona.color} flex items-center justify-center`}>
                      <persona.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-gray-900" style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                      {persona.goal}
                    </h3>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    {persona.products.map((rec, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 bg-gray-50/50 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden flex-shrink-0">
                          <ImageWithFallback
                            src={rec.product.image}
                            alt={rec.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 text-xs truncate" style={{ fontWeight: 600 }}>
                            {rec.product.name}
                          </p>
                          <p className="text-emerald-600 text-xs" style={{ fontWeight: 600 }}>
                            ${rec.product.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.location.hash = '#choose-box'}
                    className="w-full py-2.5 bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200 rounded-xl text-gray-700 hover:border-emerald-300 transition-all text-sm"
                    style={{ fontWeight: 600 }}
                  >
                    View All
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Medical Assurance Section
  const MedicalAssurance = () => {
    const providers = [
      { name: "FDA Certified", stat: "100%", icon: Shield },
      { name: "Lab Tested", stat: "Every Batch", icon: Award },
      { name: "Medical Grade", stat: "Clinical", icon: CheckCircle },
      { name: "AI Verified", stat: "Real-time", icon: Sparkles },
    ];

    return (
      <section className="relative py-32 px-6 bg-gradient-to-b from-white to-emerald-50/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-xl rounded-full border border-emerald-300/50 shadow-lg mb-6">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.15em', fontWeight: 600 }}>
                Medical Assurance
              </span>
            </div>
            <h2 className="tracking-tight mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700 }}>
              <span className="text-gray-900">All Products </span>
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent inline-block">
                Clinically Verified
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto" style={{ fontSize: '1.125rem' }}>
              Sourced exclusively from proven medical providers with rigorous quality standards
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {providers.map((provider, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/70 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-xl p-8 text-center"
              >
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <provider.icon className="w-8 h-8 text-emerald-600" />
                </motion.div>
                <h3 className="text-gray-900 mb-2" style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                  {provider.name}
                </h3>
                <p className="text-emerald-600" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                  {provider.stat}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // How AI Works Section
  const HowAIWorks = () => {
    const steps = [
      {
        number: "01",
        title: "Input BMI & Goals",
        description: "Tell us your height, weight, and fitness objectives",
        icon: Activity,
      },
      {
        number: "02",
        title: "AI Analyzes Health",
        description: "Our medical AI processes your unique profile",
        icon: Brain,
        },
      {
        number: "03",
        title: "Medical Verification",
        description: "Recommendations verified against clinical standards",
        icon: Shield,
      },
      {
        number: "04",
        title: "Safe Delivery",
        description: "Premium supplements delivered to your door",
        icon: CheckCircle,
      },
    ];

    return (
      <section id="how-it-works" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-xl rounded-full border border-emerald-300/50 shadow-lg mb-6">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.15em', fontWeight: 600 }}>
                Your Smarter Pill Path
              </span>
            </div>
            <h2 className="tracking-tight mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700 }}>
              <span className="text-gray-900">How </span>
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent inline-block">
                AI Works
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="relative"
              >
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-white/70 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-xl p-8 h-full"
                >
                  <div className="text-emerald-600/20 mb-4" style={{ fontSize: '4rem', fontWeight: 700, lineHeight: 1 }}>
                    {step.number}
                  </div>
                  <div className="w-16 h-16 mb-6 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-gray-900 mb-3" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </motion.div>
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-emerald-300 to-teal-300" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Instant Quiz CTA
  const InstantQuizCTA = () => (
    <section className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 rounded-[3rem] p-12 md:p-16 text-center relative overflow-hidden"
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
              backgroundSize: '30px 30px'
            }} />
          </div>

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-10 right-10 w-20 h-20 border-4 border-white/20 rounded-full"
          />

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>

            <h2 className="text-white mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700 }}>
              Ready to Find Your Perfect Supplements?
            </h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto" style={{ fontSize: '1.125rem' }}>
              Take our instant AI health quiz and get personalized, medically-verified recommendations in seconds
            </p>

            <motion.button
              onClick={() => window.location.hash = '#bmi'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 bg-white text-emerald-600 rounded-2xl shadow-2xl inline-flex items-center gap-3 group"
              style={{ fontSize: '1.25rem', fontWeight: 700 }}
            >
              Take the AI Quiz Now
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-6 h-6" />
              </motion.div>
            </motion.button>

            <p className="text-white/80 mt-6 text-sm">
              No signup required • Takes less than 2 minutes
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );

  // Testimonials
  const Testimonials = () => {
    const testimonials = [
      {
        name: "Sarah M.",
        goal: "Weight Loss",
        feedback: "Lost 15lbs safely with AI recommendations. Every product was clinically verified!",
        stat: "15lbs lost",
        rating: 5,
      },
      {
        name: "Mike T.",
        goal: "Muscle Gain",
        feedback: "The personalized stack worked perfectly. Medical-grade quality you can trust.",
        stat: "10kg gained",
        rating: 5,
      },
      {
        name: "Jessica L.",
        goal: "Wellness",
        feedback: "Finally, supplements that actually match my health needs. AI made it simple.",
        stat: "98% better",
        rating: 5,
      },
    ];

    return (
      <section className="relative py-32 px-6 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-xl rounded-full border border-emerald-300/50 shadow-lg mb-6">
              <Users className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.15em', fontWeight: 600 }}>
                Trusted Results
              </span>
            </div>
            <h2 className="tracking-tight mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700 }}>
              <span className="text-gray-900">Real </span>
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent inline-block">
                Success Stories
              </span>
            </h2>
            <div className="flex items-center justify-center gap-2 text-emerald-600 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                98% feel safer with medical-grade AI suggestions
              </span>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto" style={{ fontSize: '1rem' }}>
              Need extra guidance? You can get in contact with a physician
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white/70 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-xl p-8"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                    >
                      <Award className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.feedback}"
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-gray-900" style={{ fontWeight: 600 }}>
                      {testimonial.name}
                    </p>
                    <p className="text-gray-600 text-sm">{testimonial.goal}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-600" style={{ fontWeight: 700 }}>
                      {testimonial.stat}
                    </p>
                    <p className="text-gray-600 text-xs">Clinically Improved</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Minimal Footer
  const MinimalFooter = () => (
    <footer className="relative py-12 px-6 border-t border-gray-200/50">
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-900" style={{ fontSize: '1.125rem', fontWeight: 700 }}>
              Vital Box
            </span>
          </div>
          <p className="text-gray-600 text-sm">
            Your safety is our top priority—every recommendation is AI-personalized and clinically verified.
          </p>
          <p className="text-gray-400 text-xs">
            © 2025 Vital Box. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <button className="text-gray-600 hover:text-emerald-600 transition-colors">
              Privacy Policy
            </button>
            <button className="text-gray-600 hover:text-emerald-600 transition-colors">
              Medical Assurance
            </button>
          </div>
        </motion.div>
      </div>
    </footer>
  );

  return (
    <div className="relative min-h-screen bg-white">
      <AnimatedBackground />
      <div className="relative z-10">
        <HeroSection />
        <PersonalizedPicks />
        <MedicalAssurance />
        <HowAIWorks />
        <InstantQuizCTA />
        <Testimonials />
        <MinimalFooter />
      </div>
    </div>
  );
}