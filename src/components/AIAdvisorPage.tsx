"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { useAIGuidance, type AmazonLink } from "./useAIGuidance";
import {
  Send,
  Sparkles,
  Package,
  Activity,
  TrendingUp,
  Heart,
  Zap,
  ShoppingCart,
  AlertCircle,
  Copy,
  Trash2,
  ArrowDown,
  Info,
  ExternalLink,
  Check,
} from "lucide-react";
import s from "./AIAdvisorPage.module.css";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  amazonLinks?: AmazonLink[];
  disclaimers?: string[];
}

export function AIAdvisorPage() {
  const { user } = useAuth();
  const { ask } = useAIGuidance();

  const [messages, setMessages]           = useState<Message[]>([]);
  const [inputMessage, setInputMessage]   = useState("");
  const [isTyping, setIsTyping]           = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [copiedId, setCopiedId]           = useState<string | null>(null);

  const messagesEndRef       = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  /* ── scroll helpers ── */
  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 80);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  /* ── initial greeting ── */
  useEffect(() => {
    const bmi         = user?.fitnessMetrics?.latestBMI?.value;
    const bmiCategory = user?.fitnessMetrics?.latestBMI?.category;

    let greeting: string;
    if (user && bmi) {
      greeting = `Hi ${user.name}, your BMI is ${bmi.toFixed(1)} (${bmiCategory}). I'm here to help you find the right supplements for your goals. What would you like to work on?`;
    } else if (user) {
      greeting = `Hi ${user.name}. I'm your AI supplement advisor. Tell me about your fitness goals and I'll tailor recommendations for you.`;
    } else {
      greeting = "Welcome. I'm your AI supplement advisor. Sign in and log your BMI for personalised recommendations, or ask me anything about fitness and supplements.";
    }

    setMessages([{ id: "1", content: greeting, sender: "ai", timestamp: new Date() }]);
  }, [user]);

  /* ── send ── */
  const handleSend = useCallback(async (overrideInput?: string) => {
    const text = overrideInput ?? inputMessage;
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      content: text,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((p) => [...p, userMsg]);
    setInputMessage("");
    setIsTyping(true);
    setError(null);

    try {
      const data = await ask(text);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        content: data.summary,
        sender: "ai",
        timestamp: new Date(),
        amazonLinks: data.amazonLinks ?? [],
        disclaimers: data.disclaimers ?? [],
      };
      setMessages((p) => [...p, aiMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get AI response");
      setMessages((p) => [
        ...p,
        {
          id: (Date.now() + 1).toString(),
          content: "Having a bit of trouble connecting right now — please try again in a moment.",
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [inputMessage, isTyping, ask]);

  const handleQuickAction = (query: string) => {
    if (isTyping) return;
    handleSend(query);
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () =>
    setMessages((p) => (p.length ? [p[0]] : []));

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  /* ── Rich AI response rendering ── */
  const renderInlineChips = (text: string): React.ReactNode => {
    const parts = text.split(/(\([^)]{3,30}\))/g);
    if (parts.length === 1) return <>{text}</>;
    return (
      <>
        {parts.map((part, i) =>
          /^\([^)]{3,30}\)$/.test(part)
            ? <span key={i} className={s.aiChip}>{part.slice(1, -1)}</span>
            : <span key={i}>{part}</span>
        )}
      </>
    );
  };

  const renderAIContent = (text: string) => {
    const lines = text.split("\n").filter((l) => l.trim() !== "");
    const nodes: React.ReactNode[] = [];
    let listBuffer: string[] = [];

    const flushList = (key: number) => {
      if (!listBuffer.length) return;
      nodes.push(
        <ul key={"list-" + key} className={s.aiList}>
          {listBuffer.map((item, i) => (
            <li key={i} className={s.aiListItem}>
              <span>{renderInlineChips(item)}</span>
            </li>
          ))}
        </ul>
      );
      listBuffer = [];
    };

    lines.forEach((line, i) => {
      const t = line.trim();
      if (/^[-•*]\s+/.test(t) || /^\d+\.\s+/.test(t)) {
        listBuffer.push(t.replace(/^[-•*\d+.\s]+/, "").trim());
        return;
      }
      flushList(i);
      const isLabel =
        (t.endsWith(":") && t.length < 64 && !/^[a-z]/.test(t)) ||
        (/^[A-Z][A-Z\s]+:?$/.test(t) && t.length < 50);
      nodes.push(
        isLabel
          ? <div key={i} className={s.aiSectionLabel}>{t.replace(/:$/, "")}</div>
          : <p key={i}>{renderInlineChips(t)}</p>
      );
    });

    flushList(lines.length);
    return <div className={s.aiBody}>{nodes}</div>;
  };

  const quickActions = [
    { label: "Build muscle", icon: TrendingUp, query: "I want to build muscle and gain strength" },
    { label: "Lose weight",  icon: Activity,   query: "Help me lose weight and burn fat" },
    { label: "More energy",  icon: Zap,        query: "I need more energy for workouts" },
    { label: "Recovery",     icon: Heart,      query: "What's best for recovery after training?" },
  ];

  /* ── render ── */
  return (
    <div className={s.root}>
      <div className={s.ambient} aria-hidden>
        <div className={s.ambientOrb1} />
        <div className={s.ambientOrb2} />
      </div>

      <div className={s.page}>
        <div className={s.inner}>

          {/* Header */}
          <header className={s.header}>
            <h1 className={s.title}>
              Your supplement <span className={s.titleAccent}>advisor</span>
            </h1>
            <p className={s.subtitle}>Personalised guidance, grounded in your data</p>
          </header>

          {/* Stats bar */}
          {user?.fitnessMetrics?.latestBMI && (
            <div className={s.statsBar}>
              <div className={s.statItem}>
                <div className={s.statValue}>{user.fitnessMetrics.latestBMI.value.toFixed(1)}</div>
                <div className={s.statLabel}>BMI</div>
              </div>
              <div className={s.statDivider} />
              <div className={s.statItem}>
                <div className={s.statValue}>
                  {user.fitnessMetrics.latestBMI.weight}
                  <span style={{ fontSize: "0.72em", fontWeight: 400, marginLeft: 3 }}>
                    {user.fitnessMetrics.latestBMI.unit === "imperial" ? "lbs" : "kg"}
                  </span>
                </div>
                <div className={s.statLabel}>Weight</div>
              </div>
              <div className={s.statDivider} />
              <div className={s.statItem}>
                <div className={s.statBadge}>{user.fitnessMetrics.latestBMI.category}</div>
                <div className={s.statLabel} style={{ marginTop: 5 }}>Status</div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className={s.errorBanner}>
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Chat shell */}
          <div className={s.chatShell}>

            {/* Chat header */}
            <div className={s.chatHeader}>
              <div className={s.chatHeaderLeft}>
                <div className={s.advisorAvatar}>
                  <div className={s.advisorAvatarGlow} />
                  <Sparkles />
                </div>
                <div>
                  <div className={s.advisorName}>AI Health Advisor</div>
                  <div className={s.advisorStatus}>
                    <span className={s.statusDot} />
                    Online
                  </div>
                </div>
              </div>
              <button className={s.clearBtn} onClick={handleClear} title="Clear conversation">
                <Trash2 />
              </button>
            </div>

            {/* Messages */}
            <div className={s.messages} ref={messagesContainerRef}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${s.messageRow} ${msg.sender === "user" ? s.userRow : ""}`}
                >
                  <div className={`${s.avatar} ${msg.sender === "ai" ? s.aiAvatar : s.userAvatar}`}>
                    {msg.sender === "ai" ? <Sparkles /> : getUserInitials()}
                  </div>

                  <div className={s.bubbleWrap}>
                    <div className={`${s.bubble} ${msg.sender === "ai" ? s.aiBubble : s.userBubble}`}>
                      {msg.sender === "ai" ? renderAIContent(msg.content) : msg.content}
                    </div>

                    <div className={s.bubbleMeta}>
                      <span className={s.bubbleTime}>
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {msg.sender === "ai" && (
                        <button
                          className={`${s.copyBtn} ${copiedId === msg.id ? s.copied : ""}`}
                          onClick={() => handleCopy(msg.id, msg.content)}
                        >
                          {copiedId === msg.id ? <><Check size={9} />Copied</> : <><Copy size={9} />Copy</>}
                        </button>
                      )}
                    </div>

                    {msg.amazonLinks && msg.amazonLinks.length > 0 && (
                      <div className={s.productCards}>
                        {msg.amazonLinks.map((link, i) => (
                          <div key={i} className={s.productCard}>
                            <div className={s.productCardHeader}>
                              <div className={s.productIcon}><Package size={11} /></div>
                              <div className={s.productTitle}>{link.searchQuery}</div>
                              <span className={s.productCategory}>{link.category}</span>
                            </div>
                            <p className={s.productPurpose}>{link.purpose}</p>
                            {link.redFlags && (
                              <div className={s.redFlagBox}>
                                <AlertCircle size={11} />
                                <p className={s.redFlagText}>{link.redFlags}</p>
                              </div>
                            )}
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className={s.amazonBtn}>
                              <ShoppingCart size={10} />
                              View on Amazon
                              <ExternalLink size={9} />
                            </a>
                          </div>
                        ))}

                        {msg.disclaimers && msg.disclaimers.length > 0 && (
                          <div className={s.disclaimerBox}>
                            <Info size={11} />
                            <div className={s.disclaimerText}>
                              {msg.disclaimers.map((d, i) => <p key={i}>{d}</p>)}
                            </div>
                          </div>
                        )}

                        <div className={s.doctorNotice}>
                          <Heart size={11} />
                          <p className={s.doctorText}>
                            <strong>Consult your doctor</strong> before starting any new supplement regimen.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Thinking — three dots */}
              {isTyping && (
                <div className={s.thinkingRow}>
                  <div className={`${s.avatar} ${s.aiAvatar}`}>
                    <Sparkles size={13} />
                  </div>
                  <div className={s.thinkingBubble}>
                    <div className={s.thinkingDot} style={{ animationDelay: "0s" }} />
                    <div className={s.thinkingDot} style={{ animationDelay: "0.22s" }} />
                    <div className={s.thinkingDot} style={{ animationDelay: "0.44s" }} />
                  </div>
                </div>
              )}

              {showScrollBtn && (
                <button className={s.scrollBtn} onClick={scrollToBottom}>
                  <ArrowDown size={12} />
                </button>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick actions */}
            <div className={s.quickActions}>
              {quickActions.map((a, i) => (
                <button
                  key={i}
                  className={s.quickBtn}
                  onClick={() => handleQuickAction(a.query)}
                  disabled={isTyping}
                >
                  <a.icon size={11} />
                  {a.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className={s.inputArea}>
              <input
                className={s.textInput}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isTyping && handleSend()}
                placeholder="Ask me about supplements…"
                disabled={isTyping}
              />
              <button
                className={s.sendBtn}
                onClick={() => handleSend()}
                disabled={!inputMessage.trim() || isTyping}
              >
                <Send size={15} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}