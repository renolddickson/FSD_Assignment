interface EmergencyStopProps {
  onStop: () => void;
  isTriggered: boolean;
}

export const EmergencyStop = ({
  onStop,
  isTriggered,
}: EmergencyStopProps) => {
  return (
    <div className="absolute right-6 bottom-[156px] z-30 select-none">
      <button
        onClick={onStop}
        className="cursor-pointer transition-transform duration-150 active:scale-95"
        aria-label="Emergency Stop"
      >
        <svg
          className="w-24 h-24"
          viewBox="0 0 120 120"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Arcs for EMERGENCY and STOP text paths */}
            <path
              id="topArc"
              d="M 15,60 A 45,45 0 0,1 105,60"
            />
            <path
              id="bottomArc"
              d="M 105,60 A 45,45 0 0,1 15,60"
            />

            {/* Single Arrow segment definition: 100-degree arc with arrowhead */}
            <g id="arrowSegment">
              <path
                d="M -5.47,-15.06 A 16,16 0 0,1 15.75,-2.77"
                fill="none"
                stroke="white"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M 11.5,-5.5 L 16.5,-2 L 18.2,-7"
                fill="none"
                stroke="white"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </defs>

          {/* Outer yellow ring */}
          <circle
            cx="60"
            cy="60"
            r="55"
            fill="#F4C400"
          />

          {/* Red center button */}
          <circle
            cx="60"
            cy="60"
            r="35"
            fill={isTriggered ? "#B91C1C" : "#D91F26"}
          />

          {/* EMERGENCY text */}
          <text
            fill="#222"
            fontSize="8"
            fontWeight="700"
            letterSpacing="1"
            fontFamily="Arial, sans-serif"
          >
            <textPath
              href="#topArc"
              startOffset="50%"
              textAnchor="middle"
            >
              EMERGENCY
            </textPath>
          </text>

          {/* STOP text */}
          <text
            fill="#222"
            fontSize="8"
            fontWeight="700"
            letterSpacing="1"
            fontFamily="Arial, sans-serif"
          >
            <textPath
              href="#bottomArc"
              startOffset="50%"
              textAnchor="middle"
            >
              STOP
            </textPath>
          </text>

          {/* 3 Symmetrical Circular repeat arrows looped at 120-degree intervals */}
          <g
            transform="translate(60, 60)"
            className={`transition-transform duration-1000 origin-center ${
              isTriggered ? "rotate-180" : "hover:rotate-45"
            }`}
          >
            <use href="#arrowSegment" />
            <use href="#arrowSegment" transform="rotate(120)" />
            <use href="#arrowSegment" transform="rotate(240)" />
          </g>
        </svg>
      </button>
    </div>
  );
};