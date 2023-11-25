import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { DataPoint } from '../types';

type Props = {
  data: DataPoint[];
  width?: number;
  height?: number;
};

export const Chart: React.FC<Props> = ({ data, width = 460, height = 400 }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove(); // Clear svg content

    const margin = { top: 10, right: 30, bottom: 30, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Scales
    const xScale = d3.scaleTime()
                     .domain(d3.extent(data, d => d.x) as any)
                     .range([0, chartWidth]);
    
    const yScale = d3.scaleLinear()
                     .domain([0, d3.max(data, d => d.y)] as any)
                     .range([chartHeight, 0]);

    // Line generator
    const line = d3.line<DataPoint>()
                   .x(d => xScale(d.x))
                   .y(d => yScale(d.y));

    // Append the line
    svg.append("path")
       .datum(data)
       .attr("fill", "none")
       .attr("stroke", "steelblue")
       .attr("stroke-width", 1.5)
       .attr("d", line);

    // Axes
    svg.append("g")
       .attr("transform", `translate(0,${chartHeight})`)
       .call(d3.axisBottom(xScale));

    svg.append("g")
       .call(d3.axisLeft(yScale));

  }, [data, height, width]);

  return (
    <svg ref={ref} width={width} height={height}>
      {/* Line chart will be rendered here */}
    </svg>
  );
};
