import { useEffect, useRef } from 'react';

interface WheelProps {
  options: string[];
  spinning: boolean;
  onSpinEnd?: () => void;
}

export function Wheel({ options, spinning, onSpinEnd }: WheelProps) {
  const wheelRef = useRef<SVGSVGElement>(null);
  const rotationRef = useRef(0);

  useEffect(() => {
    if (spinning && wheelRef.current) {
      const wheel = wheelRef.current;
      const randomDegrees = 1800 + Math.random() * 1800; // 5-10 full rotations
      rotationRef.current += randomDegrees;
      
      wheel.style.transition = 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
      wheel.style.transform = `rotate(${rotationRef.current}deg)`;

      const timer = setTimeout(() => {
        if (onSpinEnd) onSpinEnd();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [spinning, onSpinEnd]);

  const segments = options.length;
  const anglePerSegment = 360 / segments;
  const radius = 180; // 20% larger than 150
  const centerX = 240; // 20% larger than 200
  const centerY = 240; // 20% larger than 200
  const textRadius = radius * 0.7; // Position text at 70% of the wheel radius

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

  return (
    <div className="wheel-container" style={{ position: 'relative', width: 400, height: 400, overflow: 'visible' }}>
      {/* Static pointer above the wheel, now pointing downward */}
      <div
        style={{
          position: 'absolute',
          top: '-20px', // move up to match larger wheel
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
      <svg
        ref={wheelRef}
        width="480"
        height="480"
        viewBox="0 0 480 480"
        className="wheel"
        style={{ display: 'block', position: 'absolute', top: '-40px', left: '-40px' }}
      >
        {options.map((option, index) => {
          const { x, y, angle } = getTextPosition(index);
          return (
            <g key={index}>
              <path
                d={generatePath(index)}
                fill={`hsl(${(index * 360) / segments}, 70%, 60%)`}
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
        })}
        <circle cx={centerX} cy={centerY} r="12" fill="white" />
      </svg>
    </div>
  );
} 