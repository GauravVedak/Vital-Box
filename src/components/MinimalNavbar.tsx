"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  LogOut,
  Activity,
  Brain,
  Home,
  Zap,
  Shield,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import s from "./MinimalNavbar.module.css";

interface MinimalNavbarProps {
  onSignInClick: () => void;
}

const navItems = [
  { id: "home",       label: "Home",       href: "#home",       icon: Home },
  { id: "bmi",        label: "BMI",         href: "#bmi",        icon: Activity },
  { id: "ai-advisor", label: "AI Advisor",  href: "#ai-advisor", icon: Brain },
];

const spring = { type: "spring", stiffness: 380, damping: 30, mass: 0.8 } as const;
const ease   = [0.16, 1, 0.3, 1] as const;

export function MinimalNavbar({ onSignInClick }: MinimalNavbarProps) {
  const [active, setActive]     = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const pillRef                 = useRef<HTMLDivElement>(null);
  const { user, logout }        = useAuth();

  /* ── scroll + hash ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    const onHash   = () => {
      const hash = window.location.hash.replace("#", "") || "home";
      setActive(hash);
    };
    window.addEventListener("scroll", onScroll);
    window.addEventListener("hashchange", onHash);
    onHash();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("hashchange", onHash);
    };
  }, []);

  /* ── close dropdown on outside click ── */
  useEffect(() => {
    if (!userOpen) return;
    const handler = (e: MouseEvent) => {
      if (pillRef.current && !pillRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [userOpen]);

  const navigate = (id: string, href: string) => {
    window.location.hash = href;
    setActive(id);
    setUserOpen(false);
  };

  const handleLogout = () => {
    logout();
    setUserOpen(false);
    window.location.hash = "#home";
    setActive("home");
  };

  const getUserInitial = () =>
    user?.name?.trim().charAt(0).toUpperCase() ?? "U";

  return (
    <div className={s.navRoot}>

      {/* ═══════════════════════════════════════
          DESKTOP — frosted glass pill
          ═══════════════════════════════════════ */}
      <motion.div
        className={s.desktopWrapper}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
      >
        <div
          ref={pillRef}
          className={`${s.bar} ${scrolled ? s.scrolled : ""}`}
        >

          {/* Logo — wordmark only, no dot */}
          <button className={s.logo} onClick={() => navigate("home", "#home")}>
            <span className={s.logoText}>Vital Box</span>
          </button>

          <div className={s.sep} />

          {/* Nav links */}
          <nav className={s.navLinks}>
            {navItems.map((item) => {
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  className={`${s.navBtn} ${isActive ? s.navBtnActive : ""}`}
                  onClick={() => navigate(item.id, item.href)}
                >
                  {isActive && (
                    <motion.span
                      layoutId="active-pill"
                      className={s.activePill}
                      transition={spring}
                    />
                  )}
                  <span className={s.navBtnLabel}>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className={s.sep} />

          {/* User / Sign In */}
          <div className={s.userArea}>
            {user ? (
              <>
                <button
                  className={s.avatarBtn}
                  onClick={() => setUserOpen((o) => !o)}
                  aria-label="Open user menu"
                >
                  <div className={s.avatar}>{getUserInitial()}</div>
                </button>

                <AnimatePresence>
                  {userOpen && (
                    <motion.div
                      className={s.dropdown}
                      initial={{ opacity: 0, scale: 0.96, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: 6 }}
                      transition={{ duration: 0.2, ease }}
                    >
                      {/* Header */}
                      <div className={s.dropdownHeader}>
                        <div className={s.dropdownHeaderAvatar}>
                          {getUserInitial()}
                        </div>
                        <div className={s.dropdownHeaderText}>
                          <div className={s.dropdownName}>{user.name}</div>
                          <div className={s.dropdownEmail}>{user.email}</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className={s.dropdownActions}>
                        <button
                          className={s.dropdownItem}
                          onClick={() => { setUserOpen(false); window.location.hash = "#user-panel"; }}
                        >
                          <span className={s.dropdownItemIcon}><User /></span>
                          My Profile
                        </button>

                        {user?.role === "admin" && (
                          <button
                            className={`${s.dropdownItem} ${s.admin}`}
                            onClick={() => { setUserOpen(false); window.location.hash = "#admin-panel"; }}
                          >
                            <span className={s.dropdownItemIcon}><Shield /></span>
                            Admin Panel
                          </button>
                        )}

                        <hr className={s.dropdownDivider} />

                        <button
                          className={`${s.dropdownItem} ${s.danger}`}
                          onClick={handleLogout}
                        >
                          <span className={s.dropdownItemIcon}><LogOut /></span>
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <motion.button
                className={s.signInBtn}
                onClick={onSignInClick}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
              >
                <Zap />
                Sign In
              </motion.button>
            )}
          </div>

        </div>
      </motion.div>

      {/* ═══════════════════════════════════════
          MOBILE — iOS bottom tab bar
          ═══════════════════════════════════════ */}
      <div className={s.mobileBar}>
        <div className={s.mobileBarInner}>

          {navItems.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                className={s.mobileTab}
                onClick={() => navigate(item.id, item.href)}
              >
                <motion.div
                  className={`${s.mobileTabPill} ${isActive ? s.tabActive : s.tabInactive}`}
                  animate={{ scale: isActive ? 1 : 0.9 }}
                  transition={spring}
                >
                  <item.icon
                    className={`${s.mobileTabIcon} ${isActive ? s.iconActive : s.iconInactive}`}
                  />
                </motion.div>
                <span className={`${s.mobileTabLabel} ${isActive ? s.labelActive : s.labelInactive}`}>
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Profile / Sign In */}
          <button
            className={s.mobileTab}
            onClick={user
              ? () => { window.location.hash = "#user-panel"; }
              : onSignInClick
            }
          >
            <div className={`${s.mobileTabPill} ${s.tabInactive}`}>
              {user
                ? <div className={s.mobileAvatar}>{getUserInitial()}</div>
                : <User className={`${s.mobileTabIcon} ${s.iconInactive}`} />
              }
            </div>
            <span className={`${s.mobileTabLabel} ${s.labelInactive}`}>
              {user ? "Profile" : "Sign In"}
            </span>
          </button>

        </div>
      </div>

      {/* Spacer — keeps content above mobile bar */}
      <div className={s.mobileSpacer} aria-hidden />

    </div>
  );
}