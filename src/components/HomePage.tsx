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
  Award,
  TrendingUp,
  Users,
  User,
  Package,
} from "lucide-react";
import { useAuth } from "./AuthContext";

const typography = {
  h1: {
    fontSize: "clamp(2.5rem, 5vw, 4rem)",
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: "-0.04em",
  } as const,
  h2: {
    fontSize: "clamp(2rem, 4vw, 3rem)",
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: "-0.03em",
  } as const,
  h3: {
    fontSize: "1.25rem",
    fontWeight: 700,
    lineHeight: 1.3,
  } as const,
  body: {
    fontSize: "1.125rem",
    lineHeight: 1.7,
    fontWeight: 400,
  } as const,
  bodySm: {
    fontSize: "0.875rem",
    lineHeight: 1.6,
    fontWeight: 500,
  } as const,
  eyebrow: {
    fontSize: "0.75rem",
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    fontWeight: 600,
  } as const,
};

export function HomePage() {
  const { user } = useAuth();

  // Hero Section
  const HeroSection = () => (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-32 pb-24">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <h1
              className="mb-6 tracking-tight leading-tight"
              style={typography.h1}
            >
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Supplements Tailored
              </motion.span>
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                To You{"  "}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Clinically Verified, AI-Powered.
                </span>
              </motion.span>
            </h1>

            {/* Mission / why strip in hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8 flex flex-col gap-3 max-w-xl mx-auto lg:mx-0"
            >
              <p className="text-gray-700" style={typography.bodySm}>
                We exist because the supplement aisle is confusing and often
                unsafe. Vital Box uses AI and medical logic to keep you away
                from guesswork and risky combinations.
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <motion.button
                onClick={() => (window.location.hash = "#bmi")}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(16, 185, 129, 0.3)",
                }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white rounded-2xl shadow-xl relative overflow-hidden group"
                style={{ ...typography.body, fontWeight: 600 }}
              >
                <motion.div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Take the Instant AI Quiz
                  <ArrowRight className="w-5 h-5" />
                </span>
              </motion.button>

              <motion.button
                onClick={() => {
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/80 backdrop-blur-xl border-2 border-gray-200 text-gray-700 rounded-2xl hover:border-emerald-300 transition-all"
                style={{ ...typography.body, fontWeight: 600 }}
              >
                <span className="flex items-center justify-center gap-2">
                  Learn How It Works
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
                transition={{ delay: 0.7 }}
                className="mt-6 flex justify-center lg:justify-start"
              >
                <motion.button
                  onClick={() => (window.location.hash = "#user-panel")}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-3 bg-white/90 backdrop-blur-xl border-2 border-emerald-300 text-emerald-600 rounded-2xl hover:bg-emerald-50 transition-all flex items-center gap-2 shadow-lg"
                  style={{ ...typography.bodySm, fontWeight: 600 }}
                >
                  <User className="w-5 h-5" />
                  <span>Go to my panel</span>
                </motion.button>
              </motion.div>
            )}
          </motion.div>

          {/* Right: AI + Medical Logic Flow Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Soft background glows */}
            <div className="pointer-events-none absolute -top-10 -right-4 w-40 h-40 bg-emerald-400/30 blur-3xl rounded-full" />
            <div className="pointer-events-none absolute bottom-0 -left-10 w-56 h-56 bg-cyan-400/25 blur-3xl rounded-full" />

            <div className="relative w-full max-w-lg mx-auto">
              <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-gray-200/60 shadow-[0_30px_70px_rgba(15,23,42,0.15)] p-8 md:p-10">
                <div className="flex items-center justify-between mb-7">
                  <div>
                    <p
                      className="text-emerald-600 mb-1"
                      style={typography.eyebrow}
                    >
                      How decisions are made
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>

                <div className="space-y-2">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Users className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-900" style={typography.bodySm}>
                        1. You share health basics
                      </p>
                      <p className="text-gray-500" style={typography.bodySm}>
                        Height, weight, goals, medications, and conditions —
                        always in your control.
                      </p>
                    </div>
                  </div>

                  {/* Connector */}
                  <div className="pl-4 border-l-2 border-dashed border-emerald-100 h-1" />

                  {/* Step 2 */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-cyan-50 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-cyan-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-900" style={typography.bodySm}>
                        2. AI simulates supplement choices
                      </p>
                      <p className="text-gray-500" style={typography.bodySm}>
                        Our models compare your profile against medical logic and
                        interaction rules.
                      </p>
                    </div>
                  </div>

                  {/* Connector */}
                  <div className="pl-4 border-l-2 border-dashed border-emerald-100 h-2" />

                  {/* Step 3 */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-900" style={typography.bodySm}>
                        3. Medical standards are applied
                      </p>
                      <p className="text-gray-500" style={typography.bodySm}>
                        Recommendations are checked against clinical references
                        and safety constraints.
                      </p>
                    </div>
                  </div>

                  {/* Connector */}
                  <div className="pl-4 border-l-2 border-dashed border-emerald-100 h-2" />

                  {/* Step 4 */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
                      <Package className="w-4 h-4 text-teal-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-900" style={typography.bodySm}>
                        4. You see a clear plan
                      </p>
                      <p className="text-gray-500" style={typography.bodySm}>
                        You review a human-readable supplement plan and decide
                        what to order.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Confidence meter */}
                <div className="mt-8 p-3 rounded-2xl bg-slate-50 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-slate-900" style={typography.bodySm}>
                      AI + Medical Confidence Meter
                    </p>
                    <p className="text-slate-500" style={typography.bodySm}>
                      Shows how closely your plan aligns with our safety and
                      efficacy rules.
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="w-24 h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full w-11/12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                    </div>
                    <span className="text-emerald-600" style={typography.bodySm}>
                      92% match
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );

  // Mission
  const MissionSection = () => (
    <section className="relative py-32 px-6 bg-gradient-to-b from-white to-emerald-50/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-14"
        >
          <p className="text-emerald-700 mb-3" style={typography.eyebrow}>
            Why Vital Box exists
          </p>
          <h2 className="text-gray-900 mb-4" style={typography.h2}>
            The supplement world shouldn't feel like a gamble.
          </h2>
          <p className="text-gray-600" style={typography.body}>
            Most people are left to piece together advice from ads, trends, and
            forums. Vital Box exists to bring clarity, safety, and medical logic
            to everyday supplementation.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 pt-4">
          {/* Problem */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-3xl shadow-lg p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-2xl bg-rose-50 flex items-center justify-center">
                <Activity className="w-4 h-4 text-rose-500" />
              </div>
              <span className="text-gray-900" style={typography.bodySm}>
                The Problem
              </span>
            </div>
            <p className="text-gray-700" style={typography.body}>
              The supplement industry is crowded, confusing, and lightly
              regulated. It's easy to take too much, combine the wrong products,
              or follow trends that were never meant for you.
            </p>
          </motion.div>

          {/* Solution */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-3xl shadow-lg p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <Brain className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-gray-900" style={typography.bodySm}>
                Our Approach
              </span>
            </div>
            <p className="text-gray-700" style={typography.body}>
              We combine your health data with AI models that are grounded in
              medical logic. Every recommendation is shaped by safety rules, not
              influencer trends.
            </p>
          </motion.div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-3xl shadow-lg p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-2xl bg-sky-50 flex items-center justify-center">
                <Shield className="w-4 h-4 text-sky-600" />
              </div>
              <span className="text-gray-900" style={typography.bodySm}>
                What we stand for
              </span>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li style={typography.bodySm}>
                Clinically informed, not hype-driven.
              </li>
              <li style={typography.bodySm}>
                User-first recommendations, always in your control.
              </li>
              <li style={typography.bodySm}>
                AI-assisted, doctor-informed decision logic.
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );

  // How It Works / Process Section
  const HowAIWorks = () => {
    const steps = [
      {
        number: "01",
        title: "Share your health basics",
        description:
          "Tell us about your height, weight, goals, medications, and existing conditions.",
        icon: Users,
      },
      {
        number: "02",
        title: "AI analyzes your profile",
        description:
          "Our models process your data against medical logic and supplement interaction rules.",
        icon: Brain,
      },
      {
        number: "03",
        title: "Apply medical standards",
        description:
          "Recommendations are filtered through clinical guidelines and safety thresholds.",
        icon: Shield,
      },
      {
        number: "04",
        title: "Get your personalized plan",
        description:
          "You receive a clear, human-friendly supplement plan that you can adjust and order.",
        icon: Package,
      },
    ];

    return (
      <section id="how-it-works" className="relative py-36 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-emerald-700 mb-3" style={typography.eyebrow}>
              Clear, transparent steps
            </p>
            <h2 className="text-gray-900 mb-4" style={typography.h2}>
              How Vital Box works from quiz to plan.
            </h2>
            <p
              className="text-gray-600 max-w-2xl mx-auto"
              style={typography.body}
            >
              No mystery algorithms. Just a step-by-step process you can
              understand and revisit whenever your goals change.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
            {steps.map((step, idx) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative"
              >
                <motion.div
                  whileHover={{ y: -6, scale: 1.01 }}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-xl p-8 h-full"
                >
                  <div
                    className="text-emerald-600/20 mb-4"
                    style={{
                      fontSize: "3.5rem",
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    {step.number}
                  </div>
                  <div className="w-14 h-14 mb-6 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center">
                    <step.icon className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-gray-900 mb-3" style={typography.h3}>
                    {step.title}
                  </h3>
                  <p className="text-gray-600" style={typography.bodySm}>
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

  // Benefits / Value Proposition Section
  const BenefitsSection = () => {
    const benefits = [
      {
        icon: Zap,
        title: "Save time and mental load",
        description:
          "Skip hours of research. Go from uncertainty to a clear plan in a few minutes.",
      },
      {
        icon: Shield,
        title: "Reduce risk of unsafe mixes",
        description:
          "Our logic checks for potential conflicts and flags risky combinations before they reach your cart.",
      },
      {
        icon: Brain,
        title: "Medical logic, not marketing",
        description:
          "Recommendations are grounded in clinical references and safety guidelines — not trending hashtags.",
      },
      {
        icon: Heart,
        title: "Stay aligned with your goals",
        description:
          "Your plan evolves with you. Update your goals and see how your recommendations adapt.",
      },
    ];

    return (
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-emerald-700 mb-3" style={typography.eyebrow}>
              Why Vital Box is worth your time
            </p>
            <h2 className="text-gray-900 mb-4" style={typography.h2}>
              The benefits of personalized, verified supplementation.
            </h2>
            <p
              className="text-gray-600 max-w-2xl mx-auto"
              style={typography.body}
            >
              When your supplements match your health story, you're more likely
              to stay consistent, safe, and on track with your goals.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {benefits.map((benefit, idx) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ y: -4 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-lg p-6"
              >
                <div className="w-10 h-10 mb-4 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <benefit.icon className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-gray-900 mb-2" style={typography.h3}>
                  {benefit.title}
                </h3>
                <p className="text-gray-600" style={typography.bodySm}>
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Personalized Supplement Preview / Examples
  const PersonalizedPicks = () => {
    const personas = [
      {
        goal: "Muscle Gain",
        icon: TrendingUp,
        color: "from-blue-500 to-purple-600",
        description: "Build strength and muscle mass safely",
      },
      {
        goal: "Weight Loss",
        icon: Activity,
        color: "from-orange-500 to-red-600",
        description: "Support healthy fat loss and metabolism",
      },
      {
        goal: "Wellness / General Health",
        icon: Heart,
        color: "from-emerald-500 to-teal-600",
        description: "Maintain overall health and immunity",
      },
      {
        goal: "Performance & Energy",
        icon: Zap,
        color: "from-yellow-500 to-orange-600",
        description: "Boost workout performance and energy",
      },
    ];

    return (
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-emerald-700 mb-3" style={typography.eyebrow}>
              A glimpse at what you might see
            </p>
            <h2 className="text-gray-900 mb-4" style={typography.h2}>
              Example plans for common health goals.
            </h2>
            <p
              className="text-gray-600 max-w-2xl mx-auto"
              style={typography.body}
            >
              Every plan is unique, but here's how Vital Box might support
              different health journeys — all AI-verified and logic-checked.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {personas.map((persona, idx) => (
              <motion.div
                key={persona.goal}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -6 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-xl overflow-hidden"
              >
                <div className={`h-2 bg-gradient-to-r ${persona.color}`} />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${persona.color} flex items-center justify-center`}
                    >
                      <persona.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-gray-900" style={typography.h3}>
                      {persona.goal}
                    </h3>
                  </div>

                  <p className="text-gray-600 mb-6" style={typography.bodySm}>
                    {persona.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                      <p className="text-gray-700 text-center" style={typography.bodySm}>
                        Your personalized supplements will appear here after you complete the AI quiz.
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => (window.location.hash = "#bmi")}
                    className="w-full py-2.5 bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200 rounded-xl text-gray-700 hover:border-emerald-300 transition-all"
                    style={{ ...typography.bodySm, fontWeight: 600 }}
                  >
                    Take the AI Quiz
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Medical Assurance / Trust Section
  const MedicalAssurance = () => {
    const providers = [
      { name: "FDA-Aware Logic", stat: "Aligned", icon: Shield },
      { name: "Lab Tested Inputs", stat: "Every Batch", icon: Award },
      { name: "Medical-Grade Criteria", stat: "Clinical", icon: CheckCircle },
      { name: "AI Safety Checks", stat: "Real-time", icon: Sparkles },
    ];

    return (
      <section className="relative py-32 px-6 bg-gradient-to-b from-white to-emerald-50/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-emerald-700 mb-3" style={typography.eyebrow}>
              Medical assurance & trust
            </p>
            <h2 className="text-gray-900 mb-4" style={typography.h2}>
              Clinically verified. AI-assisted. Built to be trusted.
            </h2>
            <p
              className="text-gray-600 max-w-2xl mx-auto"
              style={typography.body}
            >
              Vital Box doesn't replace medical care, but it does hold itself to
              medical-grade standards for how recommendations are generated and
              reviewed.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {providers.map((provider, idx) => (
              <motion.div
                key={provider.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-xl p-8 text-center"
              >
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center"
                  whileHover={{ scale: 1.05, rotate: 2 }}
                >
                  <provider.icon className="w-8 h-8 text-emerald-600" />
                </motion.div>
                <h3 className="text-gray-900 mb-1" style={typography.h3}>
                  {provider.name}
                </h3>
                <p className="text-emerald-600 mb-3" style={typography.bodySm}>
                  {provider.stat}
                </p>
                <p className="text-gray-500" style={typography.bodySm}>
                  Each rule in our system is checked against reputable medical
                  references before it influences your plan.
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // CTA / Instant Quiz Section
  const InstantQuizCTA = () => (
    <section className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 rounded-[3rem] p-12 md:p-16 text-center relative overflow-hidden"
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                backgroundSize: "30px 30px",
              }}
            />
          </div>
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

            <h2 className="text-white mb-6" style={typography.h2}>
              Find your supplement plan in minutes.
            </h2>
            <p
              className="text-white/90 mb-10 max-w-2xl mx-auto"
              style={typography.body}
            >
              Take our AI health quiz and see a personalized, medically informed
              supplement plan in seconds. No signup required — just honest
              questions and clear answers.
            </p>

            <motion.button
              onClick={() => (window.location.hash = "#bmi")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 bg-white text-emerald-600 rounded-2xl shadow-2xl inline-flex items-center gap-3 group"
              style={{
                ...typography.body,
                fontSize: "1.25rem",
                fontWeight: 700,
              }}
            >
              Take the AI Quiz Now
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-6 h-6" />
              </motion.div>
            </motion.button>

            <p className="text-white/80 mt-6 text-sm" style={typography.bodySm}>
              Most people finish in under 2 minutes.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );

  // Minimal Footer
  const MinimalFooter = () => (
    <footer className="relative py-12 px-6 border-t border-gray-200/50 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-gray-900" style={typography.h3}>
            Vital Box
          </span>
        </div>
        <div className="flex items-center gap-6 text-gray-400">
          <p style={typography.bodySm}>
            © 2026 Vital Box. All rights reserved.
          </p>
          <div className="hidden md:flex items-center gap-4">
            <button
              className="text-gray-400 hover:text-gray-700 transition-colors"
              style={typography.bodySm}
            >
              About
            </button>
            <button
              className="text-gray-400 hover:text-gray-700 transition-colors"
              style={typography.bodySm}
            >
              Privacy
            </button>
            <button
              className="text-gray-400 hover:text-gray-700 transition-colors"
              style={typography.bodySm}
            >
              Contact
            </button>
          </div>
        </div>
      </div>
    </footer>
  );

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,_#ecfeff,_#f9fafb_40%,_#eef2ff)]">
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-[0.06] mix-blend-soft-light" />
      <div className="relative z-10">
        <HeroSection />
        <MissionSection />
        <HowAIWorks />
        <BenefitsSection />
        <PersonalizedPicks />
        <MedicalAssurance />
        <InstantQuizCTA />
        <MinimalFooter />
      </div>
    </div>
  );
}