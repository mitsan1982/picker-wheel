import { useEffect, useRef, useState } from 'react';

interface WheelProps {
  options: string[];
  spinning: boolean;
  onSpinEnd?: () => void;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function Wheel({ options: initialOptions, spinning, onSpinEnd }: WheelProps) {
  const wheelRef = useRef<SVGSVGElement>(null);
  const rotationRef = useRef(0);
  const [options, setOptions] = useState(initialOptions);

  const segments = options.length;
  const anglePerSegment = 360 / segments;
  const radius = 180;
  const centerX = 240;
  const centerY = 240;
  const textRadius = radius * 0.7;

  useEffect(() => {
    if (spinning && wheelRef.current) {
      const wheel = wheelRef.current;
      const randomDegrees = 1800 + Math.random() * 1800;
      rotationRef.current += randomDegrees;
      
      wheel.style.transition = 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
      wheel.style.transform = `rotate(${rotationRef.current}deg)`;

      const timer = setTimeout(() => {
        // Segment selection logic (no blinking)
        // (You can keep the index calculation here for future use)
        // const effectiveAngle = ((rotationRef.current - 90) % 360 + 360) % 360;
        // const index = (segments - Math.floor(effectiveAngle / anglePerSegment)) % segments;
        if (onSpinEnd) onSpinEnd();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [spinning, onSpinEnd, anglePerSegment, segments, options]);

  const generatePath = (index: number) => {
    const startAngle = (index * anglePerSegment - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * anglePerSegment - 90) * (Math.PI / 180);
    
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    return `M ${centerX},${centerY} L ${x1},${y1} A ${radius},${radius} 0 0 1 ${x2},${y2} Z`;
  };

  const getTextPosition = (index: number) => {
    const angle = (index * anglePerSegment + anglePerSegment / 2 - 90) * (Math.PI / 180);
    const x = centerX + textRadius * Math.cos(angle);
    const y = centerY + textRadius * Math.sin(angle);
    return { x, y, angle: (angle * 180) / Math.PI + 90 };
  };

  const handleShuffle = () => {
    setOptions(shuffleArray(options));
    if (wheelRef.current) {
      wheelRef.current.style.transition = 'none';
      wheelRef.current.style.transform = 'rotate(0deg)';
      rotationRef.current = 0;
    }
  };

  return (
    <div className="wheel-container" style={{ position: 'relative', width: 400, height: 400, overflow: 'visible' }}>
      {/* Static pointer above the wheel, now pointing downward */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          left: '50%',
          transform: 'translate(-50%, 0)',
          zIndex: 2,
          width: 40,
          height: 40,
          pointerEvents: 'none',
        }}
      >
        <svg width="40" height="40">
          <polygon
            points="20,32 10,8 30,8"
            fill="#fff"
            stroke="#0984E3"
            strokeWidth="3"
            style={{ filter: 'drop-shadow(0 2px 6px rgba(9,132,227,0.15))' }}
          />
        </svg>
      </div>
      {/* Shuffle button in the center */}
      <button
        className="shuffle-btn"
        onClick={handleShuffle}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 3,
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: '#fff',
          border: '2px solid #0984E3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(9,132,227,0.10)',
          cursor: 'pointer',
          padding: 0,
        }}
        title="Shuffle options"
        aria-label="Shuffle options"
        disabled={spinning}
      >
        {/* Material Icons refresh icon: smooth arc with arrowhead */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M17.65 6.35A7.95 7.95 0 0 0 12 4a8 8 0 1 0 8 8" stroke="#0984E3" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="21 4 21 9 16 9" stroke="#0984E3" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <svg
        ref={wheelRef}
        width="480"
        height="480"
        viewBox="0 0 480 480"
        className="wheel"
        style={{ display: 'block', position: 'absolute', top: '-40px', left: '-40px' }}
      >
        {(() => {
          const palette = ['#7bb661', '#a3d977', '#4e7d32', '#b6e388', '#5e8c3a', '#8fc866'];
          return options.map((option, index) => {
            const { x, y, angle } = getTextPosition(index);
            const color = palette[index % palette.length];
            return (
              <g key={index}>
                <path
                  d={generatePath(index)}
                  fill={color}
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={y}
                  transform={`rotate(${angle}, ${x}, ${y})`}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="16"
                  fontWeight="bold"
                  style={{
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    userSelect: 'none',
                  }}
                >
                  {option}
                </text>
              </g>
            );
          });
        })()}
        <circle cx={centerX} cy={centerY} r="12" fill="white" />
      </svg>
    </div>
  );
} 