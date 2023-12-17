'use client'
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ColorTypeToHex, ColorTypeToString, ColorTypes, DataPoint } from '../types';
import { ResponsiveLine } from '@nivo/line'
import { ReactDOM } from 'react';
import { IgrFinancialChart, IgrFinancialChartModule } from 'igniteui-react-charts';

import { scaleTime } from "d3-scale";
import { curveMonotoneX } from "d3-shape";
import { timeFormat } from "d3-time-format";
import { format } from "d3-format";


import { ChartCanvas, Chart } from "react-stockcharts";
import { AreaSeries } from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import { createVerticalLinearGradient, hexToRGBA } from "react-stockcharts/lib/utils";
import {
	CrossHairCursor,
	MouseCoordinateX,
	MouseCoordinateY
} from "react-stockcharts/lib/coordinates";

import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { OHLCTooltip } from "react-stockcharts/lib/tooltip";
import { fitWidth } from "react-stockcharts/lib/helper";
import { last } from "react-stockcharts/lib/utils";

const canvasGradient = createVerticalLinearGradient([
	{ stop: 0, color: hexToRGBA("#b5d0ff", 0.2) },
	{ stop: 0.7, color: hexToRGBA("#6fa4fc", 0.4) },
	{ stop: 1, color: hexToRGBA("#4286f4", 0.8) },
]);

import { tsvParse, csvParse } from  "d3-dsv";
import { timeParse } from "d3-time-format";

function parseData(parse: any) {
	return function(d: any) {
		d.date = parse(d.date);
		d.open = +d.open;
		d.high = +d.high;
		d.low = +d.low;
		d.close = +d.close;
		d.volume = +d.volume;

		return d;
	};
}

const parseDate = timeParse("%Y-%m-%d");

export function getData() {
	const promiseMSFT = fetch("https://cdn.rawgit.com/rrag/react-stockcharts/master/docs/data/MSFT.tsv")
		.then(response => response.text())
		.then(data => tsvParse(data, parseData(parseDate)))
	return promiseMSFT;
}



export function ChartMain({ colorType, dataIn }: {colorType: ColorTypes, dataIn: DataPoint[]}) {
  const ref = useRef();
  const [width, setWidth] = useState(window.innerWidth);

  const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(
      d => d?.date ?? new Date()
);
const { data, xScale, xAccessor, displayXAccessor } = xScaleProvider(
      dataIn
);

const start = xAccessor(last(data));
const end = xAccessor(data[Math.max(0, data.length - 150)]);
const xExtents = [start, end];

  return (
      <ChartCanvas ratio={10}  height={400}
      margin={{ left: 90, right: 70, top: 10, bottom: 30 }}

      mouseMoveEvent={true}
    panEvent={true}
    
    zoomEvent={true}
    clamp={false}
      width={800}
      seriesName={ColorTypeToString[colorType]}
      data={data} type="svg"
      xScale={xScale}
				xAccessor={xAccessor}
				displayXAccessor={displayXAccessor}
				xExtents={xExtents}
>
      <Chart id={1} yExtents={[d => [d.high, d.low]]}>
            <defs>
                  <linearGradient id="MyGradient" x1="0" y1="100%" x2="0" y2="0%">
                        <stop offset="0%" stopColor={ColorTypeToHex[colorType]} stopOpacity={0.2} />
                        <stop offset="70%" stopColor={ColorTypeToHex[colorType]}  stopOpacity={0.4} />
                        <stop offset="100%"  stopColor={ColorTypeToHex[colorType]}  stopOpacity={0.8} />
                  </linearGradient>
            </defs>
            <XAxis axisAt="bottom" orient="bottom" ticks={6}/>
            <YAxis axisAt="left" orient="left" />
            <AreaSeries
                  yAccessor={d => d.close}
                  fill="url(#MyGradient)"
                  strokeWidth={2}
                  interpolation={curveMonotoneX}
                  canvasGradient={canvasGradient}
            />
     

      </Chart>
      <CrossHairCursor />

</ChartCanvas>
      );
}

