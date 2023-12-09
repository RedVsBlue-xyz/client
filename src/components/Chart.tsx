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
            zoomSliderType="Line"
            overlayBrushes="rgba(130, 13, 0, 0.17)"
            overlayOutlines="rgba(150, 13, 0, 0.4)"
            overlayThickness={1}
            dataSource={data} />
      );
}

