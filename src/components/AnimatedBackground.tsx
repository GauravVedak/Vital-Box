import { motion } from "motion/react";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Bright animated gradient base */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, rgba(236, 253, 245, 0.8) 0%, rgba(240, 253, 250, 0.7) 50%, rgba(236, 254, 255, 0.8) 100%)",
        }}
        animate={{
          background: [
            "linear-gradient(135deg, rgba(236, 253, 245, 0.8) 0%, rgba(240, 253, 250, 0.7) 50%, rgba(236, 254, 255, 0.8) 100%)",
            "linear-gradient(135deg, rgba(240, 253, 250, 0.8) 0%, rgba(236, 254, 255, 0.7) 50%, rgba(236, 253, 245, 0.8) 100%)",
            "linear-gradient(135deg, rgba(236, 254, 255, 0.8) 0%, rgba(236, 253, 245, 0.7) 50%, rgba(240, 253, 250, 0.8) 100%)",
            "linear-gradient(135deg, rgba(236, 253, 245, 0.8) 0%, rgba(240, 253, 250, 0.7) 50%, rgba(236, 254, 255, 0.8) 100%)",
          ],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />

      {/* Bright clinical grid pattern */}
      <svg className="absolute w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="clinical-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#10b981" strokeWidth="2"/>
            <circle cx="30" cy="30" r="2.5" fill="#10b981" />
            <circle cx="0" cy="0" r="2" fill="#14b8a6" />
            <circle cx="60" cy="60" r="2" fill="#06b6d4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#clinical-grid)" />
      </svg>

      {/* Large animated molecular structures - BRIGHT */}
      <motion.div
        className="absolute top-20 right-20 w-[550px] h-[550px] opacity-25"
        animate={{
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{
          rotate: { duration: 60, repeat: Infinity, ease: "linear" },
          scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <motion.circle
            cx="100"
            cy="100"
            r="12"
            fill="#10b981"
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          {[0, 72, 144, 216, 288].map((angle, i) => {
            const x = 100 + 65 * Math.cos((angle * Math.PI) / 180);
            const y = 100 + 65 * Math.sin((angle * Math.PI) / 180);
            return (
              <g key={i}>
                <motion.circle
                  cx={x}
                  cy={y}
                  r="10"
                  fill={i % 2 === 0 ? "#14b8a6" : "#06b6d4"}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                />
                <motion.line
                  x1="100"
                  y1="100"
                  x2={x}
                  y2={y}
                  stroke="#10b981"
                  strokeWidth="3.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: [0, 1, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: i * 0.3 }}
                />
              </g>
            );
          })}
        </svg>
      </motion.div>

      {/* Second molecule cluster - BRIGHT */}
      <motion.div
        className="absolute bottom-32 left-32 w-[450px] h-[450px] opacity-30"
        animate={{
          rotate: -360,
          scale: [1, 1.3, 1],
        }}
        transition={{
          rotate: { duration: 80, repeat: Infinity, ease: "linear" },
          scale: { duration: 10, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <svg viewBox="0 0 150 150" className="w-full h-full">
          <circle cx="75" cy="75" r="10" fill="#0ea5e9" />
          <circle cx="50" cy="50" r="8" fill="#10b981" />
          <circle cx="100" cy="50" r="8" fill="#14b8a6" />
          <circle cx="50" cy="100" r="8" fill="#06b6d4" />
          <line x1="75" y1="75" x2="50" y2="50" stroke="#10b981" strokeWidth="3" />
          <line x1="75" y1="75" x2="100" y2="50" stroke="#14b8a6" strokeWidth="3" />
          <line x1="75" y1="75" x2="50" y2="100" stroke="#06b6d4" strokeWidth="3" />
        </svg>
      </motion.div>

      {/* BRIGHT ECG Heartbeat lines */}
      <svg
        className="absolute top-1/3 left-0 w-full h-40 opacity-25"
        viewBox="0 0 1200 100"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0,50 L200,50 L220,20 L240,80 L260,5 L280,50 L400,50 L420,20 L440,80 L460,5 L480,50 L600,50 L620,20 L640,80 L660,5 L680,50 L800,50 L820,20 L840,80 L860,5 L880,50 L1000,50 L1020,20 L1040,80 L1060,5 L1080,50 L1200,50"
          fill="none"
          stroke="url(#ecg-gradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: [0, 1],
            opacity: [0, 1, 1, 0],
            x: [0, 200],
          }}
          transition={{
            pathLength: { duration: 3, repeat: Infinity, ease: "linear" },
            opacity: { duration: 3, repeat: Infinity, ease: "linear" },
            x: { duration: 3, repeat: Infinity, ease: "linear" },
          }}
        />
        <defs>
          <linearGradient id="ecg-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>

      {/* Secondary ECG line */}
      <svg
        className="absolute bottom-1/3 left-0 w-full h-40 opacity-20"
        viewBox="0 0 1200 100"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0,50 L200,50 L220,20 L240,80 L260,5 L280,50 L400,50 L420,20 L440,80 L460,5 L480,50 L600,50 L620,20 L640,80 L660,5 L680,50 L800,50 L820,20 L840,80 L860,5 L880,50 L1000,50 L1020,20 L1040,80 L1060,5 L1080,50 L1200,50"
          fill="none"
          stroke="url(#ecg-gradient-2)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: [0, 1],
            opacity: [0, 1, 1, 0],
            x: [0, 200],
          }}
          transition={{
            pathLength: { duration: 4, repeat: Infinity, ease: "linear", delay: 1.5 },
            opacity: { duration: 4, repeat: Infinity, ease: "linear", delay: 1.5 },
            x: { duration: 4, repeat: Infinity, ease: "linear", delay: 1.5 },
          }}
        />
        <defs>
          <linearGradient id="ecg-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>

      {/* Large bright floating orbs */}
      <motion.div
        className="absolute top-1/4 right-1/3 w-[650px] h-[650px] rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-400/30 blur-3xl"
        animate={{
          scale: [1, 1.5, 1],
          x: [0, 100, 0],
          y: [0, 60, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-1/4 left-1/4 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-teal-400/25 to-cyan-400/35 blur-3xl"
        animate={{
          scale: [1, 1.6, 1],
          x: [0, -80, 0],
          y: [0, -80, 0],
          opacity: [0.25, 0.4, 0.25],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Additional accent orb */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-cyan-400/20 to-emerald-400/25 blur-3xl"
        animate={{
          scale: [1, 1.4, 1],
          rotate: [0, 180, 360],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Bright pulsing medical cross */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.12]"
        animate={{
          scale: [1, 2, 1],
          opacity: [0.12, 0.2, 0.12],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg width="350" height="350" viewBox="0 0 100 100">
          <rect x="40" y="20" width="20" height="60" fill="#10b981" />
          <rect x="20" y="40" width="60" height="20" fill="#14b8a6" />
        </svg>
      </motion.div>

      {/* Floating particles - BRIGHT */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500"
          style={{
            left: `${15 + i * 7}%`,
            top: `${25 + (i % 4) * 15}%`,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 3 + i * 0.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
}
