import React, { useEffect, useState } from 'react';
import { ColorTypes, ColorTypeToHex, Color } from '../types';
import { formatEther } from 'viem';
import { ActionBuyShare } from './actions/ActionBuyShare';
import { ActionSellShare } from './actions/ActionSellShare';

type RectangularPieChartProps = {
  colors: { [key in ColorTypes]: Color };
};

type SegmentInfo = {
  path: string;
  textX: number;
  textY: number;
  value: number;
  colorType: ColorTypes;
};

const RectangularPieChart: React.FC<RectangularPieChartProps> = ({ colors }) => {
  const [segments, setSegments] = useState<SegmentInfo[]>([]);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    function handleResize() {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const values = Object.values(colors).map(color => color.value);
    const total = values.reduce((acc, value) => acc + value, 0);
    let cumulativePercent = 0;

    const newSegments = values.map((value, index) => {
      const percent = value / total;
      const startAngle = cumulativePercent * 360;
      const endAngle = (cumulativePercent + percent) * 360;
      cumulativePercent += percent;

      // Calculate SVG path and text position
      const { path, textX, textY } = calculateSegment(startAngle, endAngle, dimensions);

      return {
        path,
        textX,
        textY,
        value,
        colorType: Object.keys(colors)[index] as ColorTypes
      };
    });

    setSegments(newSegments);
  }, [colors, dimensions]);

  const calculateSegment = (startAngle, endAngle, { width, height }) => {
    // Define the center and radius
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.sqrt(centerX * centerX + centerY * centerY);

    // Convert angles to radians
    const startRadians = (Math.PI / 180) * startAngle;
    const endRadians = (Math.PI / 180) * endAngle;

    // Calculate start and end points
    const startX = centerX + radius * Math.cos(startRadians);
    const startY = centerY + radius * Math.sin(startRadians);
    const endX = centerX + radius * Math.cos(endRadians);
    const endY = centerY + radius * Math.sin(endRadians);

    // Large arc flag
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    // Construct the path
    const path = `M ${centerX},${centerY} L ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY} Z`;

    // Calculate text position
    const middleAngle = (startAngle + endAngle) / 2;
    const middleRadians = (Math.PI / 180) * middleAngle;
    const textX = centerX + (radius / 2) * Math.cos(middleRadians);
    const textY = centerY + (radius / 2) * Math.sin(middleRadians);

    return { path, textX, textY };
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <svg width="100%" height="100%">
        {segments.map((segment, index) => (
          <path key={index} d={segment.path} fill={ColorTypeToHex[segment.colorType]} />
        ))}
      </svg>
      {segments.map((segment, index) => (
        console.log("segment",segment),
        <div key={index} style={{ position: 'absolute', left: segment.textX, top: segment.textY, transform: 'translate(-50%, -50%)', color: 'white' }}>
          <h3>{formatEther(segment.value)} ETH</h3>
          {/* <ActionBuyShare colorType={segment.colorType} />
          <ActionSellShare colorType={segment.colorType} /> */}
        </div>
      ))}
    </div>
  );
};

export default RectangularPieChart;
