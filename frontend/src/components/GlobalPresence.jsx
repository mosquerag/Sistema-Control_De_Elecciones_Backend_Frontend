function GlobalPresence() {
  const dots = [
    { cx: 60, cy: 50, delay: "0s" },
    { cx: 115, cy: 38, delay: "0.5s" },
    { cx: 135, cy: 85, delay: "1s" },
    { cx: 82, cy: 105, delay: "0.7s" },
    { cx: 40, cy: 88, delay: "1.3s" },
  ];

  return (
    <div className="flex items-center gap-8">
      {/* GLOBO */}
      <div className="relative">
        <svg
          width="180"
          height="180"
          viewBox="0 0 180 180"
          className="drop-shadow-2xl"
        >
          {/* Fondo */}
          <circle
            cx="90"
            cy="90"
            r="72"
            fill="#E6F1FB"
            stroke="#378ADD"
            strokeWidth="2"
          />

          {/* Órbita */}
          <ellipse
            cx="90"
            cy="90"
            rx="35"
            ry="72"
            fill="none"
            stroke="#378ADD"
            strokeWidth="1.5"
            strokeDasharray="6 5"
            className="animate-spin-slow origin-center"
          />

          {/* Líneas */}
          <line
            x1="18"
            y1="90"
            x2="162"
            y2="90"
            stroke="#378ADD"
            strokeWidth="1"
            opacity="0.5"
          />

          <line
            x1="90"
            y1="18"
            x2="90"
            y2="162"
            stroke="#378ADD"
            strokeWidth="1"
            opacity="0.5"
          />

          {/* PUNTOS */}
          {dots.map((dot, i) => (
            <circle
              key={i}
              cx={dot.cx}
              cy={dot.cy}
              r="6"
              fill="#EF4444"
              style={{
                animation: `pulse-dot 1.8s ease-in-out ${dot.delay} infinite`,
              }}
            />
          ))}
        </svg>

        {/* Glow */}
        <div
          className="
            absolute
            inset-0
            rounded-full
            bg-blue-500/20
            blur-3xl
            animate-pulse
            -z-10
          "
        />
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%,100% {
            transform: scale(1);
            opacity: .9;
          }

          50% {
            transform: scale(2.2);
            opacity: .25;
          }
        }

        .animate-spin-slow {
          animation: spinSlow 16s linear infinite;
        }

        @keyframes spinSlow {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default GlobalPresence;