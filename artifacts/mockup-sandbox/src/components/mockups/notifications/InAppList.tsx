export function InAppList() {
  const notifications = [
    {
      id: 1,
      sport: "⚽",
      home: "Arsenal",
      away: "Chelsea",
      market: "Moneyline",
      bookmaker: "Pinnacle",
      prevOdds: 2.18,
      currOdds: 2.09,
      drop: 4.1,
      time: "now",
      isNew: true,
    },
    {
      id: 2,
      sport: "⚽",
      home: "PSG",
      away: "Bayern Munich",
      market: "Asian Handicap",
      bookmaker: "Pinnacle",
      prevOdds: 1.92,
      currOdds: 1.85,
      drop: 3.6,
      time: "2m ago",
      isNew: true,
    },
    {
      id: 3,
      sport: "🏀",
      home: "Lakers",
      away: "Celtics",
      market: "Moneyline",
      bookmaker: "Pinnacle",
      prevOdds: 2.45,
      currOdds: 2.31,
      drop: 5.7,
      time: "5m ago",
      isNew: false,
    },
    {
      id: 4,
      sport: "🎾",
      home: "Djokovic",
      away: "Alcaraz",
      market: "Moneyline",
      bookmaker: "Pinnacle",
      prevOdds: 1.72,
      currOdds: 1.65,
      drop: 4.1,
      time: "12m ago",
      isNew: false,
    },
    {
      id: 5,
      sport: "⚽",
      home: "Man City",
      away: "Liverpool",
      market: "Total Goals O/U",
      bookmaker: "Pinnacle",
      prevOdds: 1.91,
      currOdds: 1.80,
      drop: 5.8,
      time: "18m ago",
      isNew: false,
    },
  ];

  const dropColor = (drop: number) =>
    drop >= 5 ? "#f87171" : drop >= 3 ? "#fb923c" : "#facc15";

  return (
    <div
      className="w-full min-h-screen flex flex-col"
      style={{
        background: "#0a0c14",
        fontFamily: "-apple-system, 'SF Pro Text', BlinkMacSystemFont, sans-serif",
        color: "white",
      }}
    >
      {/* App header */}
      <div
        style={{
          background: "linear-gradient(180deg, #0d1120 0%, #0a0c14 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "16px 20px 14px",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                boxShadow: "0 2px 8px rgba(79,70,229,0.4)",
              }}
            >
              ⚡
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.3 }}>Notifications</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: -1 }}>5 alerts today</div>
            </div>
          </div>
          <button
            style={{
              fontSize: 12,
              color: "rgba(99,102,241,0.9)",
              fontWeight: 600,
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.25)",
              borderRadius: 20,
              padding: "4px 12px",
              cursor: "pointer",
            }}
          >
            Clear all
          </button>
        </div>
      </div>

      {/* New section header */}
      <div style={{ padding: "12px 20px 6px", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1 }}>
        New
      </div>

      {/* Notification list */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {notifications.map((n, idx) => {
          const showOlderHeader = idx === 2;
          return (
            <div key={n.id}>
              {showOlderHeader && (
                <div style={{ padding: "12px 20px 6px", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1 }}>
                  Earlier
                </div>
              )}
              <div
                style={{
                  margin: "0 12px 8px",
                  borderRadius: 14,
                  background: n.isNew
                    ? "rgba(99,102,241,0.07)"
                    : "rgba(255,255,255,0.04)",
                  border: n.isNew
                    ? "1px solid rgba(99,102,241,0.2)"
                    : "1px solid rgba(255,255,255,0.07)",
                  padding: "14px 16px",
                  position: "relative",
                }}
              >
                {/* Unread dot */}
                {n.isNew && (
                  <div
                    style={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#6366f1",
                      boxShadow: "0 0 6px rgba(99,102,241,0.8)",
                    }}
                  />
                )}

                <div className="flex items-start gap-3">
                  {/* Sport + drop badge */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20,
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      {n.sport}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: dropColor(n.drop),
                        letterSpacing: 0.2,
                      }}
                    >
                      ▼{n.drop}%
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Match name */}
                    <div style={{ fontSize: 13, fontWeight: 700, color: "white", lineHeight: 1.3, marginBottom: 3 }}>
                      {n.home} <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>vs</span> {n.away}
                    </div>

                    {/* Market + bookmaker */}
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>
                      {n.market}  ·  {n.bookmaker}
                    </div>

                    {/* Odds change */}
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        background: "rgba(0,0,0,0.3)",
                        borderRadius: 8,
                        padding: "4px 10px",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", fontVariantNumeric: "tabular-nums" }}>
                        {n.prevOdds.toFixed(2)}
                      </span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>→</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: dropColor(n.drop), fontVariantNumeric: "tabular-nums" }}>
                        {n.currOdds.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", flexShrink: 0, paddingTop: 1 }}>
                    {n.time}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(10,12,20,0.95)",
          padding: "12px 20px 24px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)" }} />
      </div>
    </div>
  );
}
