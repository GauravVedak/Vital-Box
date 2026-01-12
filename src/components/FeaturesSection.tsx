import { motion, useScroll, useTransform } from "motion/react";
import { FlaskConical, Activity, LineChart, PackageOpen, ShieldCheck, Brain } from "lucide-react";
import { useRef } from "react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Matching",
    description: "Advanced algorithms analyze your health data to recommend optimal supplements",
    badge: "Smart Technology",
  },
  {
    icon: FlaskConical,
    title: "Medically Informed",
    description: "Evidence-based recommendations backed by clinical research and medical data",
    badge: "Clinical-Grade",
  },
  {
    icon: LineChart,
    title: "Data-Driven Tracking",
    description: "Monitor your progress with comprehensive health metrics and insights",
    badge: "Real-Time Analytics",
  },
  {
    icon: PackageOpen,
    title: "Seamless Integration",
    description: "Easy-to-manage supplement boxes that adapt to your evolving needs",
    badge: "Flexible Plans",
  },
  {
    icon: ShieldCheck,
    title: "Quality Assured",
    description: "Third-party tested, pharmaceutical-grade supplements from trusted brands",
    badge: "Verified Safe",
  },
  {
    icon: Activity,
    title: "Health Record Storage",
    description: "Securely store and access your personal health metrics and supplement history",
    badge: "HIPAA Compliant",
  },
];

export function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.2], [50, 0]);

  return (
    <section ref={sectionRef} className="py-32 px-6 bg-white relative overflow-hidden">
      {/* Medical grid background */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="medical-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#10b981" strokeWidth="0.5"/>
              <circle cx="30" cy="30" r="1" fill="#10b981"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#medical-grid)" />
        </svg>
      </div>

      {/* Pulse animation */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-emerald-400/5 to-teal-400/5"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div 
        className="max-w-6xl mx-auto relative"
        style={{ opacity, y }}
      >
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-full border border-blue-200 mb-6"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Activity className="w-4 h-4 text-blue-600" />
            </motion.div>
            <span className="text-sm font-medium text-blue-700">Health & Fitness Platform</span>
          </motion.div>

          <h2 
            className="text-4xl md:text-5xl mb-4"
            style={{ 
              fontWeight: 700,
              color: '#030213'
            }}
          >
            <span className="inline-block">Medical-Grade</span>{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent inline-block">
              Technology
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Professional health platform with clinical precision
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              <motion.div
                className="group h-full"
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative h-full p-8 rounded-3xl bg-white border-2 border-gray-100 hover:border-emerald-200 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  {/* Clinical gradient overlay */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-teal-50/30 to-cyan-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    initial={false}
                  />
                  
                  {/* ECG line effect on hover */}
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100"
                    initial={false}
                    transition={{ duration: 0.5 }}
                  />
                  
                  <div className="relative z-10">
                    {/* Badge */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full mb-4 border border-emerald-200"
                    >
                      <motion.div
                        className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <span className="text-xs font-medium text-emerald-700">{feature.badge}</span>
                    </motion.div>

                    {/* Icon */}
                    <motion.div 
                      className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-6 shadow-lg relative overflow-hidden"
                      whileHover={{ 
                        scale: 1.1, 
                        rotate: 5,
                        boxShadow: "0 20px 40px rgba(16, 185, 129, 0.3)"
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Pulse effect */}
                      <motion.div
                        className="absolute inset-0 bg-white rounded-2xl"
                        animate={{
                          scale: [1, 1.5],
                          opacity: [0.5, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      />
                      <feature.icon className="w-8 h-8 text-white relative z-10" />
                    </motion.div>

                    {/* Content */}
                    <h3 
                      className="mb-3 text-gray-900"
                      style={{ fontWeight: 600 }}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Medical checkmark */}
                    <motion.div
                      className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center opacity-0 group-hover:opacity-100"
                      initial={false}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.svg
                        className="w-4 h-4 text-emerald-600"
                        viewBox="0 0 24 24"
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        <motion.path
                          d="M5 13l4 4L19 7"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </motion.svg>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Bottom medical certification */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 text-center"
        >
          <motion.div
            className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl border border-emerald-200 shadow-lg"
            whileHover={{ scale: 1.05, y: -4 }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <ShieldCheck className="w-6 h-6 text-white" />
              </motion.div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Medical-Grade Standards</p>
                <p className="text-sm text-gray-600">Clinically verified & third-party tested</p>
              </div>
            </div>
            <div className="h-8 w-px bg-gray-300" />
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-emerald-500"
              />
              <span className="text-sm font-medium text-gray-700">50,000+ satisfied users</span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
