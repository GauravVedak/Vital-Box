import { motion } from "motion/react";
import { Activity, Brain, PackageOpen, LineChart, ArrowRight, FlaskConical } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const steps = [
  {
    number: "01",
    icon: Activity,
    title: "Calculate Health Metrics",
    description: "Medical-grade BMI and body composition analysis",
    medicalIcon: FlaskConical,
  },
  {
    number: "02",
    icon: Brain,
    title: "Get Custom Recommendations",
    description: "AI analyzes your data for optimal supplement matches",
    medicalIcon: FlaskConical,
  },
  {
    number: "03",
    icon: PackageOpen,
    title: "Build My Box",
    description: "Curate your personalized supplement selection",
    highlighted: true,
    medicalIcon: FlaskConical,
  },
  {
    number: "04",
    icon: LineChart,
    title: "Track & Adjust",
    description: "Monitor progress with health data insights",
    medicalIcon: FlaskConical,
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-32 px-6 bg-gradient-to-b from-white via-gray-50/50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-10 w-72 h-72 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <h2 
            className="text-4xl md:text-5xl mb-4"
            style={{ 
              fontWeight: 700,
              color: '#030213'
            }}
          >
            <span className="inline-block">How It</span>{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent inline-block">
              Works
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Four simple steps to your personalized fitness journey
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.15,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="relative"
            >
              <motion.div
                whileHover={{ y: -8, scale: step.highlighted ? 1.02 : 1.05 }}
                transition={{ duration: 0.3 }}
                className={`h-full p-8 rounded-3xl transition-all duration-500 relative overflow-hidden ${
                  step.highlighted
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl"
                    : "bg-white border-2 border-gray-100 hover:border-emerald-200 shadow-sm hover:shadow-xl"
                }`}
              >
                {/* Shine effect on hover */}
                {!step.highlighted && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.8 }}
                  />
                )}

                {/* Step Number */}
                <div className="relative z-10">
                  <motion.div 
                    className={`text-7xl mb-4 font-bold ${
                      step.highlighted 
                        ? "text-white/20" 
                        : "text-emerald-100"
                    }`}
                    style={{ lineHeight: 1 }}
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  >
                    {step.number}
                  </motion.div>

                  {/* Icon */}
                  <motion.div 
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 ${
                      step.highlighted
                        ? "bg-white/20 backdrop-blur-sm"
                        : "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg"
                    }`}
                    whileHover={{ 
                      scale: 1.1, 
                      rotate: 5,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <step.icon 
                      className={`w-7 h-7 ${
                        step.highlighted ? "text-white" : "text-white"
                      }`}
                    />
                  </motion.div>

                  {/* Content */}
                  <h3 
                    className={`mb-2 ${
                      step.highlighted ? "text-white" : "text-gray-900"
                    }`}
                    style={{ fontWeight: 600 }}
                  >
                    {step.title}
                  </h3>
                  <p 
                    className={`leading-relaxed ${
                      step.highlighted ? "text-white/90" : "text-gray-600"
                    }`}
                  >
                    {step.description}
                  </p>

                  {/* Highlighted badge */}
                  {step.highlighted && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 }}
                      className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"
                    >
                      <motion.div
                        className="w-2 h-2 rounded-full bg-white"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <span className="text-xs text-white font-medium">Most Popular</span>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Connector Arrow (hidden on last item and mobile) */}
              {index < steps.length - 1 && (
                <motion.div
                  className="hidden lg:block absolute top-1/2 -right-3 z-10"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + index * 0.15 }}
                >
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-6 h-6 text-emerald-400" />
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Featured Step 3 - Expanded View */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 md:p-12 shadow-2xl"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left - Text Content */}
            <div className="text-white">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-6">
                  <PackageOpen className="w-5 h-5" />
                  <span className="text-sm font-medium">Step 03</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold mb-4">
                  Build My Box
                </h3>
                <p className="text-white/90 text-lg mb-6 leading-relaxed">
                  Curate your personalized supplement selection with our intuitive box builder. Choose from premium quality products recommended specifically for your health profile and fitness goals.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span className="text-white/90">AI-curated supplement recommendations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span className="text-white/90">Flexible monthly or one-time delivery</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span className="text-white/90">Medical-grade quality supplements</span>
                  </li>
                </ul>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => window.location.hash = "#choose-box"}
                    className="bg-white text-emerald-600 hover:bg-gray-50 px-8 py-6 rounded-2xl font-semibold shadow-lg"
                  >
                    Build My Box Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </motion.div>
              </motion.div>
            </div>

            {/* Right - Protein Powder Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="relative"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1693996045346-d0a9b9470909?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm90ZWluJTIwcG93ZGVyJTIwc3VwcGxlbWVudHxlbnwxfHx8fDE3NjAyMDA0NDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Premium Protein Powder"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              
              {/* Floating Badge */}
              <motion.div
                className="absolute -top-4 -right-4 bg-white rounded-2xl px-4 py-3 shadow-xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <FlaskConical className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Premium Quality</p>
                    <p className="text-sm font-bold text-gray-900">Lab Tested</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => window.location.hash = "#bmi"}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-7 rounded-2xl shadow-xl relative overflow-hidden group"
              style={{ fontSize: '1.125rem', fontWeight: 600 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-500"
                initial={{ x: "100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10 flex items-center gap-2">
                Start Your Journey
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </span>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
