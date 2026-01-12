import { motion } from "motion/react";
import { Button } from "./ui/button";
import { ArrowRight, Sparkles, Award, Check } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden pt-20 bg-white">
      <div className="max-w-7xl mx-auto w-full relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content - Text */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 rounded-full border border-emerald-200 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="font-medium text-emerald-700 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                Medical Grade Supplements
              </span>
            </motion.div>

            {/* Main Headline */}
            <div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl mb-6 tracking-tight" style={{ fontWeight: 700, lineHeight: 1.1 }}>
                Build Your Personalized
                <br />
                <motion.span 
                  className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  style={{ backgroundSize: "200% 200%" }}
                >
                  Fitness & Wellness Box
                </motion.span>
              </h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="text-xl md:text-2xl text-gray-700 max-w-xl"
                style={{ fontWeight: 400 }}
              >
                AI-powered, medically informed supplement recommendations tailored specifically for your fitness goals and health needs.
              </motion.p>
            </div>

            {/* Key Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="space-y-3"
            >
              {[
                "Premium protein formulations",
                "Lab-tested for purity & potency",
                "Customized to your body metrics",
                "Trusted by 50,000+ athletes"
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700 text-lg">{feature}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row gap-5 pt-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => window.location.hash = "#choose-box"}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-10 py-8 rounded-full shadow-2xl relative overflow-hidden border-0 group"
                  style={{ fontSize: '1.125rem', fontWeight: 600 }}
                >
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-500"
                    initial={{ x: "100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.4 }}
                  />
                  <span className="relative z-10 flex items-center gap-3 uppercase tracking-wider" style={{ fontSize: '0.875rem', letterSpacing: '0.1em' }}>
                    START NOW
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  onClick={() => {
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-10 py-8 rounded-full transition-all duration-300 bg-white/80 backdrop-blur-xl shadow-xl"
                  style={{ fontSize: '1.125rem', fontWeight: 600 }}
                >
                  <span className="uppercase tracking-wider" style={{ fontSize: '0.875rem', letterSpacing: '0.1em' }}>
                    HOW IT WORKS
                  </span>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Content - Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <motion.div 
              className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl"
              whileHover={{ 
                scale: 1.02,
              }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1693996045899-7cf0ac0229c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm90ZWluJTIwcG93ZGVyJTIwY29udGFpbmVyfGVufDF8fHx8MTc2MDI5Nzk1NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Premium Protein Powder"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 via-transparent to-transparent" />
              </div>

              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="absolute top-6 right-6"
              >
                <motion.div
                  className="bg-white/95 backdrop-blur-xl rounded-2xl px-6 py-3 shadow-2xl border border-emerald-200 flex items-center gap-3"
                  whileHover={{ scale: 1.05, y: -4 }}
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg"
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </motion.div>
                  <div className="text-left">
                    <p className="text-xs text-emerald-700 uppercase tracking-wider" style={{ fontWeight: 600, letterSpacing: '0.05em' }}>
                      AI Curated
                    </p>
                    <p className="text-sm font-bold text-gray-900">Medical Grade</p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Quality Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.4 }}
                className="absolute bottom-6 left-6"
              >
                <motion.div
                  className="bg-white/95 backdrop-blur-xl rounded-2xl px-6 py-3 shadow-2xl border border-teal-200 flex items-center gap-3"
                  whileHover={{ scale: 1.05, y: -4 }}
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }
                  }}
                >
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg"
                  >
                    <Award className="w-5 h-5 text-white" />
                  </motion.div>
                  <div className="text-left">
                    <p className="text-xs text-teal-700 uppercase tracking-wider" style={{ fontWeight: 600, letterSpacing: '0.05em' }}>
                      Lab Tested
                    </p>
                    <p className="text-sm font-bold text-gray-900">99.9% Pure</p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Floating decorative elements */}
            <motion.div
              className="absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br from-emerald-400/25 to-teal-400/25 rounded-full blur-3xl"
              animate={{ 
                y: [0, -35, 0],
                scale: [1, 1.3, 1],
                opacity: [0.25, 0.5, 0.25]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute -bottom-16 -left-16 w-48 h-48 bg-gradient-to-br from-teal-400/25 to-cyan-400/25 rounded-full blur-3xl"
              animate={{ 
                y: [0, 35, 0],
                scale: [1, 1.4, 1],
                opacity: [0.25, 0.45, 0.25]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
