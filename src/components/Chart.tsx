'use client'
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ColorTypeToHex, ColorTypeToString, ColorTypes, DataPoint } from '../types';
import { ResponsiveLine } from '@nivo/line'
import { ReactDOM } from 'react';
import { IgrFinancialChart, IgrFinancialChartModule } from 'igniteui-react-charts';

IgrFinancialChartModule.register();


export function Chart({ colorType, data }: {colorType: ColorTypes, data: DataPoint[]}) {
  const ref = useRef();
  const [width, setWidth] = useState(window.innerWidth);


  return (
        <IgrFinancialChart
            width="100%"
            height="500px"
            chartType="Line"
            overlayBrushes="Blue"
            indicatorBrushes="Blue"
            volumeOutlines="Blue"
            volumeBrushes="Blue"
            negativeBrushes="Blue"
            negativeOutlines="Blue"
            overlayOutlines="Blue"
            zoomSliderType="Area"
            indicatorNegativeBrushes="Blue"
            yAxisFormatLabel={(s) => s.toFixed(4) + " ETH"}
            volumeType="Area"
            thickness={2}
            overlayThickness={1}
            dataSource={data} />
      );
}

