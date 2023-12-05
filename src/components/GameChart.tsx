import React, { useEffect, useMemo, useState } from 'react';
import { ColorTypes, ColorTypeToHex, Color, ColorTypeToString } from '../types';
import { formatEther } from 'viem';
import { useDebounce } from '../hooks/useDebounce';
import { ModalColorStatistics } from './modals/ModalColorStatistics';
import { Connect } from './Connect';

const EXPANSION_DEGREE = 2; // Degree by which a segment expands on hover
const MIN_DEGREE_PER_SEGMENT = 10; // Minimum degree for a segment

type RectangularPieChartProps = {
  colors: { [key in ColorTypes]: Color };
  colorsPrice: { [key in ColorTypes]: number };
  timeLeft: string;
};

type SegmentInfo = {
  path: string;
  textX: number;
  textY: number;
  value: number;
  colorType: ColorTypes;
};

const RectangularPieChart: React.FC<RectangularPieChartProps> = ({ colors, colorsPrice, timeLeft }) => {
  const [hoveredSegmentIndex, setHoveredSegmentIndex] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const debouncedDimensions = useDebounce(dimensions, 300);
  const [colorType, setColorType] = useState<ColorTypes>(ColorTypes.Blue);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const total = useMemo(() => Object.values(colors).reduce((acc, color) => acc + color.value, 0), [colors]);

  const calculateSegment = (startAngle:any, endAngle:any, { width, height }:{width:any, height:any}, isHovered:any) => {
    if (isHovered) {
      startAngle -= EXPANSION_DEGREE;
      endAngle += EXPANSION_DEGREE;
    }

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.sqrt(centerX * centerX + centerY * centerY) * 10;

    const startRadians = (Math.PI / 180) * startAngle;
    const endRadians = (Math.PI / 180) * endAngle;

    const startX = centerX + radius * Math.cos(startRadians);
    const startY = centerY + radius * Math.sin(startRadians);
    const endX = centerX + radius * Math.cos(endRadians);
    const endY = centerY + radius * Math.sin(endRadians);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 1;

    const path = `M ${centerX},${centerY} L ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY} Z`;

    const middleAngle = (startAngle + endAngle) / 2;
    const middleRadians = (Math.PI / 180) * middleAngle;
    const angleSize = endAngle - startAngle;
    const distanceFromCenter = 250 + radius / (angleSize ** 1.2);

    const textX = centerX + distanceFromCenter * Math.cos(middleRadians);
    const textY = centerY + distanceFromCenter * Math.sin(middleRadians);

    return { path, textX, textY };
  };

  const segments = useMemo(() => {
    let cumulativePercent = 0;
    const segmentsCount = Object.keys(colors).length;
    const areAllValuesZero = total === 0;
    const minimumTotalDegrees = MIN_DEGREE_PER_SEGMENT * segmentsCount;
    const availableDegrees = areAllValuesZero ? 360 : (360 - minimumTotalDegrees);

    return Object.entries(colors).map(([colorType, color], index) => {
      const value = color.value;
      const basePercent = areAllValuesZero ? 1 / segmentsCount : value / total;
      const extraPercent = areAllValuesZero ? 0 : (basePercent * availableDegrees / 360);
      const finalPercent = (MIN_DEGREE_PER_SEGMENT / 360) + extraPercent;

      const startAngle = cumulativePercent * 360;
      const endAngle = startAngle + (finalPercent * 360);
      cumulativePercent += finalPercent;

      const { path, textX, textY } = calculateSegment(startAngle, endAngle, debouncedDimensions, index === hoveredSegmentIndex);

      return {
        path,
        textX,
        textY,
        value,
        colorType: colorType as any,
      };
    });
  }, [colors, debouncedDimensions, hoveredSegmentIndex, total]);

  const showColorModal = (colorType: ColorTypes) => {
    setColorType(colorType);
    setShow(true);
  };

  return (
    <div style={{ position: 'absolute', width: '100vw', height: '100vh', top: '0', left: '0', overflow: 'hidden' }}>
      <ModalColorStatistics show={show} colorStats={{ color: colorType }} onClose={() => setShow(false)} />
      <svg width="100%" height="100%">
        {segments.map((segment, index) => (
          <path
            onClick={() => showColorModal(segment.colorType)}
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
          onClick={() => showColorModal(segment.colorType)}
          onMouseEnter={() => setHoveredSegmentIndex(index)}
          key={index}
          style={{
            position: 'absolute', 
            left: segment.textX, 
            top: segment.textY,
            transform: 'translate(-50%, -50%)', 
            color: 'white',
            transition: 'left 0.3s ease, top 0.3s ease'
          }}>
          <h1>{ColorTypeToString[segment.colorType]}</h1>
          <div style={{ display: "flex", gap: "20px" }}>
            <p>{parseFloat(formatEther(BigInt(segment.value))).toFixed(4)} ETH</p>
            <p>{Math.round((segment.value / total) * 100)}%</p>
          </div>
          {hoveredSegmentIndex === index && <a onClick={() => showColorModal(segment.colorType)} href='#'>Buy/Sell</a>}
        </div>
      ))}
      <div className='timer'>
        <div style={{ textAlign: "center" }}>Next <br></br> clash in:</div>
        <h1>{timeLeft}</h1>
        <Connect />
      </div>  
    </div>
  );
};

export default RectangularPieChart;
