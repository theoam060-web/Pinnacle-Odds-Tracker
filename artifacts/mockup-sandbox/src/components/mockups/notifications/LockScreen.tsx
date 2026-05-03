export function LockScreen() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  const notifications = [
    {
      id: 1,
      app: "SharpTracker",
      time: "now",
      title: "⚡ Arsenal vs Chelsea",
      body: "Moneyline  ·  Pinnacle  ·  2.18 → 2.09  ▼ 4.1%",
      fresh: true,
    },
    {
      id: 2,
      app: "SharpTracker",
      time: "2m ago",
      title: "⚡ PSG vs Bayern Munich",
      body: "Asian Handicap  ·  Pinnacle  ·  1.92 → 1.85  ▼ 3.6%",
      fresh: false,
    },
    {
      id: 3,
      app: "SharpTracker",
      time: "5m ago",
      title: "⚡ Lakers vs Celtics",
      body: "Moneyline  ·  Pinnacle  ·  2.45 → 2.31  ▼ 5.7%",
      fresh: false,
    },
  ];

  return (
    <div
      className="relative w-full min-h-screen flex flex-col items-center overflow-hidden select-none"
      style={{
        background: "linear-gradient(160deg, #0a0e1a 0%, #0d1628 40%, #050811 100%)",
        fontFamily: "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Subtle ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Status bar */}
      <div className="w-full flex items-center justify-between px-6 pt-4 pb-1 z-10">
        <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>9:41</span>
        <div className="flex items-center gap-1.5">
          {/* Signal bars */}
          <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
            <rect x="0" y="7" width="3" height="5" rx="0.8" fill="white" opacity="0.9"/>
            <rect x="4.5" y="5" width="3" height="7" rx="0.8" fill="white" opacity="0.9"/>
            <rect x="9" y="2.5" width="3" height="9.5" rx="0.8" fill="white" opacity="0.9"/>
            <rect x="13.5" y="0" width="3" height="12" rx="0.8" fill="white" opacity="0.9"/>
          </svg>
          {/* WiFi */}
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path d="M8 10.5C8.55228 10.5 9 10.9477 9 11.5C9 12.0523 8.55228 12.5 8 12.5C7.44772 12.5 7 12.0523 7 11.5C7 10.9477 7.44772 10.5 8 10.5Z" fill="white" opacity="0.9"/>
            <path d="M3.5 7C5.29 5.34 7.02 4.5 8 4.5C8.98 4.5 10.71 5.34 12.5 7" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.9"/>
            <path d="M0.5 4C3.18 1.73 5.59 0.5 8 0.5C10.41 0.5 12.82 1.73 15.5 4" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
          </svg>
          {/* Battery */}
          <div className="flex items-center gap-0.5">
            <div style={{ width: 22, height: 11, borderRadius: 3, border: "1.5px solid rgba(255,255,255,0.7)", position: "relative", display: "flex", alignItems: "center", padding: "1.5px" }}>
              <div style={{ width: "75%", height: "100%", borderRadius: 1.5, background: "rgba(255,255,255,0.9)" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Time & Date */}
      <div className="flex flex-col items-center mt-8 mb-6 z-10">
        <div style={{ fontSize: 72, fontWeight: 200, color: "white", letterSpacing: -2, lineHeight: 1 }}>
          {timeStr}
        </div>
        <div style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", marginTop: 6, fontWeight: 400 }}>
          {dateStr}
        </div>
      </div>

      {/* Notification cards */}
      <div className="w-full px-4 space-y-2.5 z-10" style={{ maxWidth: 390 }}>
        {notifications.map((n, i) => (
          <div
            key={n.id}
            style={{
              background: n.fresh
                ? "rgba(15, 20, 40, 0.88)"
                : "rgba(10, 14, 28, 0.78)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              borderRadius: 18,
              border: n.fresh
                ? "1px solid rgba(99,102,241,0.4)"
                : "1px solid rgba(255,255,255,0.10)",
              padding: "14px 16px",
              boxShadow: n.fresh
                ? "0 4px 24px rgba(99,102,241,0.18), 0 1px 0 rgba(255,255,255,0.06) inset"
                : "0 2px 12px rgba(0,0,0,0.3)",
            }}
          >
            <div className="flex items-start gap-3">
              {/* App icon */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 2px 8px rgba(79,70,229,0.5)",
                }}
              >
                <span style={{ fontSize: 18 }}>⚡</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    SharpTracker
                  </span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>
                    {n.time}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "white", lineHeight: 1.3, marginBottom: 3 }}>
                  {n.title}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.4 }}>
                  {n.body}
                </div>
              </div>
            </div>

            {/* Expand hint on first card */}
            {i === 0 && (
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 10, paddingTop: 8, display: "flex", justifyContent: "space-around" }}>
                <button style={{ fontSize: 12, color: "rgba(99,102,241,0.9)", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
                  View Drop
                </button>
                <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
                <button style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500, background: "none", border: "none", cursor: "pointer" }}>
                  Dismiss
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Swipe hint */}
      <div className="mt-auto pb-8 pt-6 flex flex-col items-center gap-3 z-10">
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.3)" }} />
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 0.5 }}>Swipe up to unlock</span>
      </div>
    </div>
  );
}
