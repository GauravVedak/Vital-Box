"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Menu,
  X,
  User,
  LogOut,
  Activity,
  Brain,
  PackageOpen,
  Home,
  Zap,
} from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useAuth } from "./AuthContext";

interface MinimalNavbarProps {
  onSignInClick: () => void;
}

const menuItems = [
  { id: "home", label: "Home", href: "#home", icon: Home },
  { id: "bmi", label: "BMI Calculator", href: "#bmi", icon: Activity },
  { id: "ai-advisor", label: "AI Advisor", href: "#ai-advisor", icon: Brain },
  { id: "choose-box", label: "Choose Box", href: "#choose-box", icon: PackageOpen },
];

export function MinimalNavbar({ onSignInClick }: MinimalNavbarProps) {
  const [activeItem, setActiveItem] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "") || "home";
      setActiveItem(hash);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const handleLogoClick = () => {
    window.location.hash = "#home";
    setActiveItem("home");
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    window.location.hash = "#home";
  };

  const handleOpenUserPanel = () => {
    setShowUserMenu(false);
    window.location.hash = "#user-panel";
  };

  const handleOpenUserPanelMobile = () => {
    setMobileMenuOpen(false);
    window.location.hash = "#user-panel";
  };

  return (
    <>
      {/* Desktop Navbar */}
      <motion.nav
        className="hidden md:block fixed top-6 left-1/2 -translate-x-1/2 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-full px-6 py-2.5 border border-gray-200/50"
          animate={{
            boxShadow: scrolled
              ? "0 10px 30px rgba(0, 0, 0, 0.08)"
              : "0 4px 15px rgba(0, 0, 0, 0.04)",
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-6">
            {/* Logo - Text */}
            <motion.button
              onClick={handleLogoClick}
              className="flex items-center gap-2 text-gray-900 shrink-0"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="font-bold tracking-tight text-lg">Vital Box</span>
            </motion.button>

            {/* Menu Items */}
            <div className="flex items-center gap-1">
              {menuItems.map((item) => (
                <motion.a
                  key={item.id}
                  href={item.href}
                  className={`relative px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-300 overflow-hidden ${
                    activeItem === item.id
                      ? "text-white"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.2 },
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {activeItem === item.id && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600"
                      layoutId="activeTab"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      style={{ borderRadius: "9999px" }}
                    />
                  )}
                  {activeItem !== item.id && (
                    <motion.div
                      className="absolute inset-0 bg-gray-100"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      style={{ borderRadius: "9999px" }}
                    />
                  )}
                  <item.icon className="w-4 h-4 relative z-10" />
                  <span className="text-sm whitespace-nowrap relative z-10">
                    {item.label}
                  </span>
                </motion.a>
              ))}
            </div>

            {/* Sign In / User Menu */}
            {user ? (
              <div className="relative shrink-0">
                <motion.button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-full text-gray-900 transition-all duration-200"
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgb(243 244 246)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Avatar className="w-7 h-7 border-2 border-emerald-500">
                    <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs">
                      {user.name?.trim().charAt(0).toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>

                      <button
                        onClick={handleOpenUserPanel}
                        className="w-full px-4 py-3 flex items-center gap-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Open User Panel</span>
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 flex items-center gap-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                onClick={onSignInClick}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full shrink-0 relative overflow-hidden"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-500"
                  initial={{ x: "100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <Zap className="w-4 h-4 relative z-10" />
                <span className="text-sm relative z-10">Sign In</span>
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.nav>

      {/* Mobile Menu Button */}
      <motion.button
        className="md:hidden fixed top-6 right-6 z-50 w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg text-white"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        whileHover={{
          scale: 1.05,
          boxShadow: "0 8px 20px rgba(16, 185, 129, 0.4)",
        }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <AnimatePresence mode="wait">
          {mobileMenuOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Mobile Logo */}
      <motion.div
        className="md:hidden fixed top-6 left-6 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2 bg-white/90 backdrop-blur-xl text-gray-900 px-4 py-2.5 rounded-full shadow-lg border border-gray-200/50"
        >
          <span className="font-bold text-sm">Vital Box</span>
        </button>
      </motion.div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              className="md:hidden fixed top-24 right-6 left-6 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 z-40 overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-6 space-y-2">
                {menuItems.map((item, index) => (
                  <motion.a
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-2xl flex items-center gap-3 transition-all ${
                      activeItem === item.id
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </motion.a>
                ))}

                <div className="pt-4 mt-4 border-t border-gray-200">
                  {user ? (
                    <>
                      <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl mb-2">
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>

                      <button
                        onClick={handleOpenUserPanelMobile}
                        className="w-full px-4 py-3 flex items-center gap-2 text-gray-700 hover:bg-gray-50 rounded-2xl transition-colors mb-2"
                      >
                        <User className="w-4 h-4" />
                        <span>Open User Panel</span>
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 flex items-center gap-2 text-red-600 hover:bg-red-50 rounded-2xl transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onSignInClick();
                      }}
                      className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-medium shadow-lg"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
