import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useAuth } from "./AuthContext";
import {
  Home,
  Activity,
  Brain,
  PackageOpen,
  User,
  Settings,
  LogOut,
  Sparkles,
  Menu,
  X,
} from "lucide-react";

interface FuturisticNavbarProps {
  onSignInClick?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  gradient: string;
}

const menuItems: MenuItem[] = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    href: "#home",
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    id: "bmi",
    label: "BMI Calculator",
    icon: Activity,
    href: "#bmi",
    gradient: "from-teal-400 to-cyan-500",
  },
  {
    id: "ai-advisor",
    label: "AI Advisor",
    icon: Brain,
    href: "#ai-advisor",
    gradient: "from-cyan-400 to-blue-500",
  },
  {
    id: "choose-box",
    label: "Choose Your Box",
    icon: PackageOpen,
    href: "#choose-box",
    gradient: "from-blue-400 to-emerald-500",
  },
];

// Mock athlete data
const athletes = [
  { name: "Alex M.", image: "AM", role: "Elite Athlete" },
  { name: "Sarah K.", image: "SK", role: "Pro Trainer" },
  { name: "Marcus J.", image: "MJ", role: "Champion" },
];

export function FuturisticNavbar({ onSignInClick }: FuturisticNavbarProps) {
  const { user, logout } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState("home");
  const [showAthletes, setShowAthletes] = useState(false);
  const [currentAthlete, setCurrentAthlete] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const athleteInterval = setInterval(() => {
      setCurrentAthlete((prev) => (prev + 1) % athletes.length);
    }, 3000);
    return () => clearInterval(athleteInterval);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "") || "home";
      setActiveItem(hash);
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleLogoClick = () => {
    window.location.hash = "#home";
  };

  const handleSignOut = () => {
    logout();
    setShowUserMenu(false);
    window.location.hash = "#home";
  };

  return (
    <>
      {/* Background particles effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          className="absolute w-full h-full"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.03) 0%, transparent 50%)",
          }}
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Desktop Futuristic Navbar */}
      <motion.nav
        className="hidden lg:block fixed top-6 left-1/2 -translate-x-1/2 z-50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
      >
        <motion.div
          className="relative"
          animate={{
            y: scrolled ? -5 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Main nav container with arc shape */}
          <div className="relative backdrop-blur-2xl bg-gradient-to-b from-slate-900/90 via-slate-800/85 to-slate-900/90 rounded-[2.5rem] border border-emerald-500/20 shadow-[0_0_80px_rgba(16,185,129,0.15)]">
            {/* Animated gradient border effect */}
            <motion.div
              className="absolute inset-0 rounded-[2.5rem] opacity-0 hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(16,185,129,0.3), transparent)",
                backgroundSize: "200% 100%",
              }}
              animate={{
                backgroundPosition: ["0% 0%", "200% 0%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            />

            <div className="relative flex items-center gap-2 px-4 py-3">
              {/* 3D Logo Medallion */}
              <motion.div
                className="relative cursor-pointer mr-2"
                onClick={handleLogoClick}
                whileHover={{ scale: 1.05, rotateY: 15 }}
                whileTap={{ scale: 0.95 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <motion.div
                  className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 p-[2px] shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                  animate={{
                    boxShadow: [
                      "0 0 30px rgba(16,185,129,0.4)",
                      "0 0 50px rgba(16,185,129,0.6)",
                      "0 0 30px rgba(16,185,129,0.4)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <PackageOpen className="w-6 h-6 text-emerald-400" />
                    </motion.div>
                  </div>
                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/20 to-transparent"
                    animate={{
                      x: ["-100%", "200%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                  />
                </motion.div>
                <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </motion.div>

              {/* Separator */}
              <div className="w-px h-10 bg-gradient-to-b from-transparent via-emerald-500/30 to-transparent mx-1" />

              {/* Menu Items */}
              {menuItems.map((item, index) => (
                <motion.a
                  key={item.id}
                  href={item.href}
                  className="relative group"
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  whileHover={{ y: -8 }}
                >
                  {/* 3D Card Container */}
                  <motion.div
                    className={`relative w-16 h-16 rounded-xl backdrop-blur-sm transition-all duration-300 ${
                      activeItem === item.id
                        ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/40"
                        : "bg-slate-800/40 border border-slate-700/40 hover:border-emerald-500/40"
                    }`}
                    style={{
                      transformStyle: "preserve-3d",
                      boxShadow:
                        activeItem === item.id
                          ? "0 0 30px rgba(16,185,129,0.3), inset 0 0 20px rgba(16,185,129,0.1)"
                          : "0 4px 15px rgba(0,0,0,0.3)",
                    }}
                    whileHover={{
                      boxShadow: "0 0 40px rgba(16,185,129,0.4), inset 0 0 20px rgba(16,185,129,0.15)",
                    }}
                  >
                    {/* Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{
                          scale: hoveredItem === item.id ? [1, 1.2, 1] : 1,
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        <item.icon
                          className={`w-6 h-6 transition-colors duration-300 ${
                            activeItem === item.id
                              ? "text-emerald-400"
                              : "text-slate-400 group-hover:text-emerald-300"
                          }`}
                        />
                      </motion.div>
                    </div>

                    {/* Glow effect on hover */}
                    <AnimatePresence>
                      {hoveredItem === item.id && (
                        <motion.div
                          className={`absolute inset-0 rounded-xl bg-gradient-to-br ${item.gradient} opacity-20 blur-xl`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 0.3, scale: 1.2 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Active indicator */}
                    {activeItem === item.id && (
                      <motion.div
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"
                        layoutId="activeIndicator"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}

                    {/* Progress ring */}
                    <svg
                      className="absolute inset-0 w-full h-full -rotate-90"
                      style={{ filter: "drop-shadow(0 0 8px rgba(16,185,129,0.4))" }}
                    >
                      <motion.circle
                        cx="50%"
                        cy="50%"
                        r="30"
                        stroke="url(#gradient)"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="188.4"
                        initial={{ strokeDashoffset: 188.4 }}
                        animate={{
                          strokeDashoffset: hoveredItem === item.id ? 0 : 188.4,
                        }}
                        transition={{ duration: 0.6 }}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#14b8a6" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </motion.div>

                  {/* Tooltip */}
                  <AnimatePresence>
                    {hoveredItem === item.id && (
                      <motion.div
                        className="absolute top-full mt-3 left-1/2 -translate-x-1/2 whitespace-nowrap"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="relative bg-slate-900/95 backdrop-blur-sm text-emerald-400 px-4 py-2 rounded-lg border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                          <span className="text-sm font-medium">{item.label}</span>
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-slate-900 border-l border-t border-emerald-500/30" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.a>
              ))}

              {/* Separator */}
              <div className="w-px h-10 bg-gradient-to-b from-transparent via-emerald-500/30 to-transparent mx-1" />

              {/* Sign In / User Profile */}
              {user ? (
                <div className="relative">
                  <motion.button
                    className="relative w-16 h-16 rounded-xl group"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    whileHover={{ scale: 1.05, y: -8 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl border border-emerald-400/40 backdrop-blur-sm shadow-[0_0_30px_rgba(16,185,129,0.3)]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Avatar className="w-10 h-10 border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </motion.button>

                  {/* User dropdown */}
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        className="absolute top-full mt-3 right-0 w-64"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.3)] overflow-hidden">
                          <div className="p-4 border-b border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent">
                            <p className="text-white">{user.name}</p>
                            <p className="text-emerald-400 text-sm">{user.email}</p>
                          </div>
                          <div className="p-2">
                            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-500/10 transition-colors text-slate-300 hover:text-emerald-400">
                              <User className="w-4 h-4" />
                              <span>View Profile</span>
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-500/10 transition-colors text-slate-300 hover:text-emerald-400">
                              <Settings className="w-4 h-4" />
                              <span>Settings</span>
                            </button>
                            <div className="h-px bg-emerald-500/20 my-2" />
                            <button
                              onClick={handleSignOut}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-colors text-slate-300 hover:text-red-400"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.button
                  onClick={onSignInClick}
                  className="relative h-16 px-6 rounded-xl group overflow-hidden"
                  whileHover={{ scale: 1.05, y: -8 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {/* Animated gradient background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 opacity-90"
                    style={{ backgroundSize: "200% 100%" }}
                    animate={{
                      backgroundPosition: ["0% 50%", "200% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                    }}
                  />
                  
                  {/* Glow effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 blur-xl opacity-50"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />

                  <span className="relative flex items-center gap-2 text-white font-medium z-10">
                    <Sparkles className="w-4 h-4" />
                    Sign In
                  </span>
                </motion.button>
              )}
            </div>
          </div>

          {/* Featured Athletes Carousel */}
          <AnimatePresence>
            {showAthletes && (
              <motion.div
                className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-72"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onMouseEnter={() => setShowAthletes(true)}
                onMouseLeave={() => setShowAthletes(false)}
              >
                <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.3)] p-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentAthlete}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-4"
                    >
                      <div className="relative">
                        <Avatar className="w-12 h-12 border-2 border-emerald-400">
                          <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                            {athletes[currentAthlete].image}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">
                          {athletes[currentAthlete].name}
                        </p>
                        <p className="text-emerald-400 text-sm">
                          {athletes[currentAthlete].role}
                        </p>
                      </div>
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hover trigger for athletes */}
          <div
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-4"
            onMouseEnter={() => setShowAthletes(true)}
            onMouseLeave={() => setShowAthletes(false)}
          />
        </motion.div>
      </motion.nav>

      {/* Mobile Menu Button */}
      <motion.button
        className="lg:hidden fixed top-6 right-6 z-50 w-14 h-14 rounded-xl bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <AnimatePresence mode="wait">
          {mobileMenuOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6 text-emerald-400" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <Menu className="w-6 h-6 text-emerald-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Mobile Radial Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Radial Menu Items */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-80 h-80">
              {menuItems.map((item, index) => {
                const angle = (index * 360) / menuItems.length - 90;
                const radius = 120;
                const x = Math.cos((angle * Math.PI) / 180) * radius;
                const y = Math.sin((angle * Math.PI) / 180) * radius;

                return (
                  <motion.a
                    key={item.id}
                    href={item.href}
                    className="absolute top-1/2 left-1/2"
                    style={{
                      x: "-50%",
                      y: "-50%",
                    }}
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                    animate={{ x, y, opacity: 1, scale: 1 }}
                    exit={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                    transition={{
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                    whileTap={{ scale: 0.9 }}
                  >
                    <div className="relative w-20 h-20 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.3)] flex flex-col items-center justify-center gap-1">
                      <item.icon className="w-6 h-6 text-emerald-400" />
                      <span className="text-xs text-slate-300">{item.label.split(" ")[0]}</span>
                    </div>
                  </motion.a>
                );
              })}

              {/* Center Sign In Button */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: 0.4 }}
              >
                {user ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-[0_0_40px_rgba(16,185,129,0.5)] flex items-center justify-center"
                  >
                    <LogOut className="w-8 h-8 text-white" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onSignInClick?.();
                    }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-[0_0_40px_rgba(16,185,129,0.5)] flex items-center justify-center"
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </button>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
