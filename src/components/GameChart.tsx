import React, { useEffect, useState } from 'react';
import { ColorTypes, ColorTypeToHex, Color } from '../types';
import { formatEther } from 'viem';
import { ActionBuyShare } from './actions/ActionBuyShare';
import { ActionSellShare } from './actions/ActionSellShare';
import { ActionEndRound } from './actions/ActionEndRound';

const EXPANSION_DEGREE = 3; // Degree by which a segment expands on hover

type RectangularPieChartProps = {
  colors: { [key in ColorTypes]: Color };
  timeLeft: string;
};

type SegmentInfo = {
  path: string;
  textX: number;
  textY: number;
  value: number;
  colorType: ColorTypes;
};

const RectangularPieChart: React.FC<RectangularPieChartProps> = ({ colors, timeLeft }) => {
  const [segments, setSegments] = useState<SegmentInfo[]>([]);
  const [hoveredSegmentIndex, setHoveredSegmentIndex] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const values = Object.values(colors).map(color => color.value);
    const total = values.reduce((acc, value) => acc + value, 0);
    let cumulativePercent = 0;

    const newSegments = values.map((value, index) => {
      const percent = value / total;
      const extraPercent = hoveredSegmentIndex === index ? EXPANSION_DEGREE / 360 : 0;
      const startAngle = cumulativePercent * 360;
      const endAngle = (cumulativePercent + percent + extraPercent) * 360;
      cumulativePercent += percent + extraPercent;

      const { path, textX, textY } = calculateSegment(startAngle, endAngle, dimensions);

      return {
        path,
        textX,
        textY,
        value,
        colorType: Object.keys(colors)[index] as ColorTypes,
      };
    });

    setSegments(newSegments);
  }, [colors, dimensions, hoveredSegmentIndex]);

  const calculateSegment = (startAngle, endAngle, { width, height }) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.sqrt(centerX * centerX + centerY * centerY)*10;

    const startRadians = (Math.PI / 180) * startAngle;
    const endRadians = (Math.PI / 180) * endAngle;

    const startX = centerX + radius * Math.cos(startRadians);
    const startY = centerY + radius * Math.sin(startRadians);
    const endX = centerX + radius * Math.cos(endRadians);
    const endY = centerY + radius * Math.sin(endRadians);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    const path = `M ${centerX},${centerY} L ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY} Z`;

    const middleAngle = (startAngle + endAngle) / 2;
    const middleRadians = (Math.PI / 180) * middleAngle;
    const textX = centerX + (radius / 33) * Math.cos(middleRadians);
    const textY = centerY + (radius / 33) * Math.sin(middleRadians);

    return { path, textX, textY };
  };

  return (
    <div style={{ position: 'absolute', width: '100vw', height: '100vh', top: '0', left: '0', overflow: 'hidden' }}>
      <svg width="100%" height="100%">
        {segments.map((segment, index) => (
          <path
            key={index}
            d={segment.path}
            fill={ColorTypeToHex[segment.colorType]}
            onMouseEnter={() => setHoveredSegmentIndex(index)}
            onMouseLeave={() => setHoveredSegmentIndex(null)}
            style={{ transition: 'd 0.3s ease' }}
          />
        ))}
      </svg>
      {segments.map((segment, index) => (
        <div 
        onMouseEnter={() => setHoveredSegmentIndex(index)}
        key={index} style={{
          position: 'absolute', 
          left: segment.textX, 
          top: segment.textY,
          transform: 'translate(-50%, -50%)', 
          color: 'white',
          transition: 'left 0.3s ease, top 0.3s ease'
        }}>
          <h1>{parseFloat(formatEther(segment.value)).toFixed(4)} ETH</h1>
          {hoveredSegmentIndex === index && 
          <div style={{display:"flex", gap:"5px"}}>
            <ActionBuyShare colorType={segment.colorType} />
            <ActionSellShare colorType={segment.colorType} />
          </div>
          }
        </div>
      ))}
      <div className='timer'>
        <h1>Timer</h1>
        <h1>{timeLeft}</h1>
        <ActionEndRound />
        </div>  
    </div>
  );
};

export default RectangularPieChart;
