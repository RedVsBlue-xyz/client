import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { DataPoint } from '../types';

export function Chart({ data }: {data: DataPoint[]}) {
  const ref = useRef();
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const totalWidth = width * 6;
    const height = 420;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 30;
    const marginLeft = 30;

    const x = d3.scaleUtc()
      .domain(d3.extent(data, d => d.x))
      .range([marginLeft, totalWidth - marginRight]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.y)]).nice(6)
      .range([height - marginBottom, marginTop]);

    const area = d3.area()
      .curve(d3.curveStep)
      .x(d => x(d.x))
      .y0(y(0))
      .y1(d => y(d.y));

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove(); // Clear previous renders

    const gAxisLeft = svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).ticks(6))
      .call(g => g.select(".domain").remove())
      .call(g => g.select(".tick:last-of-type text").clone()
          .attr("x", 3)
          .attr("text-anchor", "start")
          .attr("font-weight", "bold")
          .text("$ Close"));

    const scrollBody = d3.select('.scroll-body');
    scrollBody.selectAll("*").remove(); // Clear previous renders

    const scrollSvg = scrollBody.append("svg")
      .attr("width", totalWidth)
      .attr("height", height)
      .style("display", "block");

    scrollSvg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x).ticks(d3.utcMonth.every(1200 / width)).tickSizeOuter(0));

    scrollSvg.append("path")
      .datum(data)
      .attr("fill", "blue")
      .attr("d", area);
  }, [data, width]);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={ref} width={width} height={420} style={{ position: 'absolute', pointerEvents: 'none', zIndex: 1 }}></svg>
      <div className='scroll-body' style={{ overflowX: 'scroll', WebkitOverflowScrolling: 'touch' }}></div>
    </div>
  );
}

