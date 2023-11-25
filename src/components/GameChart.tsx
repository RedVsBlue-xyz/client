import React, { useEffect, useMemo, useState } from 'react';
import { ColorTypes, ColorTypeToHex, Color, ColorTypeToString } from '../types';
import { formatEther } from 'viem';
import { ActionBuyShare } from './actions/ActionBuyShare';
import { ActionSellShare } from './actions/ActionSellShare';
import { ActionEndRound } from './actions/ActionEndRound';
import { Connected } from './Connected';
import { Connect } from './Connect';
import { ModalColorStatistics } from './modals/ModalColorStatistics';

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
  const [segments, setSegments] = useState<SegmentInfo[]>([]);
  const [hoveredSegmentIndex, setHoveredSegmentIndex] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [total, setTotal] = useState(0);
  const [colorType, setColorType] = useState<ColorTypes>(ColorTypes.Blue);
  const [show, setShow] = useState(false);
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
    setTotal(total);
    let cumulativePercent = 0;

    const segmentsCount = values.length;
    const areAllValuesZero = total === 0;
    const minimumTotalDegrees = MIN_DEGREE_PER_SEGMENT * segmentsCount;
    const availableDegrees = areAllValuesZero ? 360 : (360 - minimumTotalDegrees);

    const newSegments = values.map((value, index) => {
      const basePercent = areAllValuesZero ? 1 / segmentsCount : value / total;
      const extraPercent = areAllValuesZero ? 0 : (basePercent * availableDegrees / 360);
      const finalPercent = (MIN_DEGREE_PER_SEGMENT / 360) + extraPercent;

      const startAngle = cumulativePercent * 360;
      const endAngle = startAngle + (finalPercent * 360);
      cumulativePercent += finalPercent;

      const { path, textX, textY } = calculateSegment(startAngle, endAngle, dimensions, index === hoveredSegmentIndex);

      return {
        path,
        textX,
        textY,
        value,
        colorType: Object.keys(colors)[index]
      };
    });

    setSegments(newSegments as any);
  }, [colors, dimensions, hoveredSegmentIndex]);

  const showColorModal = useMemo(() => {
    return (colorType: ColorTypes) => {
      setColorType(colorType);
      setShow(true);
    };
  }, [colorType])

  const calculateSegment = (startAngle:any, endAngle:any, { width, height }:{width:any, height:any}, isHovered:any) => {

    if (isHovered) {
        const hoverExpansion = EXPANSION_DEGREE;
        startAngle -= hoverExpansion;
        endAngle += hoverExpansion;
      }

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.sqrt(centerX * centerX + centerY * centerY)*10;

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
    // Calculate the angle size and distance from the center
  const angleSize = endAngle - startAngle;
  const distanceFromCenter = 250+radius / (angleSize**1.2) 

  // Calculate text position based on the new distance
  const textX = centerX + distanceFromCenter * Math.cos(middleRadians);
  const textY = centerY + distanceFromCenter * Math.sin(middleRadians);

  return { path, textX, textY };
  };

  return (
    <div style={{ position: 'absolute', width: '100vw', height: '100vh', top: '0', left: '0', overflow: 'hidden' }}>
      <ModalColorStatistics show={show} colorStats={{color: colorType}} onClose={() => setShow(false)} />
      <svg width="100%" height="100%">
      <defs>
        {Object.keys(ColorTypeToHex).map((colorType, index) => (
          <linearGradient id={`gradient-${colorType}`} key={colorType} gradientUnits="userSpaceOnUse">
          <animate attributeName="x1" values="50%;0%" dur="1s" repeatCount="indefinite" />
          <animate attributeName="y1" values="50%;0%" dur="1s" repeatCount="indefinite" />
          <animate attributeName="x2" values="50%;100%" dur="1s" repeatCount="indefinite" />
          <animate attributeName="y2" values="50%;100%" dur="1s" repeatCount="indefinite" />
          <stop offset="10%" stopColor={ColorTypeToHex[colorType]} stopOpacity="0.7" />
      <stop offset="50%" stopColor={ColorTypeToHex[colorType]} stopOpacity="1" />
      <stop offset="90%" stopColor={ColorTypeToHex[colorType]} stopOpacity="0.7" />
          </linearGradient>
        ))}
        {/* <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter> */}
      </defs>
      {segments.map((segment, index) => (
        <path
        key={index}
        d={segment.path}
        fill={ColorTypeToHex[segment.colorType]}
        onMouseEnter={() => setHoveredSegmentIndex(index)}
        onMouseLeave={() => setHoveredSegmentIndex(null)}
        style={{ transition: 'd 0.3s ease' }}
        className="radiating-segment" // Apply the CSS class here
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
          <h1 >{ColorTypeToString[segment.colorType]}</h1>
          <div style={{display:"flex", gap:"20px"}}>
            <p>{parseFloat(formatEther(BigInt(segment.value))).toFixed(4)}ETH</p>
            <p>{Math.round((segment.value / total) * 100)}%</p>
          </div>
          {hoveredSegmentIndex === index && <a onClick={()=>{showColorModal(segment.colorType)}} href='#'>Buy/Sell</a>}          
          {/* <div style={{display:"flex", gap:"20px"}}>
            <h1>{parseFloat(formatEther(BigInt(segment.value))).toFixed(4)} ETH</h1>
            {hoveredSegmentIndex === index && <h1>{Math.round((segment.value / total) * 100)}%</h1>}
          </div>
          <div style={{display:"flex", gap:"20px"}}>
            <p ><span style={{textDecoration:"underline"}}>Share Price</span>: {parseFloat(formatEther(BigInt(colorsPrice[segment.colorType]))).toFixed(4)}ETH</p>
            <p><span style={{textDecoration:"underline"}}>Supply</span>: {colors[segment.colorType].supply}</p>
          </div>
          {hoveredSegmentIndex === index && 
          <div style={{display:"flex", gap:"10px"}}>
            <ActionBuyShare colorType={segment.colorType} />
            <ActionSellShare colorType={segment.colorType} />
          </div>
          }
          {hoveredSegmentIndex === index && <a href='#'>More stats</a>} */}
        </div>
      ))}
      <div className='timer'>
        <div style={{textAlign:"center"}}>Next <br></br> clash in:</div>
        <h1>{timeLeft}</h1>
        <Connect/>

        </div>  
    </div>
  );
};

export default RectangularPieChart;
