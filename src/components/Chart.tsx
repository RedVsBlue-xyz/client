import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ColorTypeToHex, ColorTypeToString, ColorTypes, DataPoint } from '../types';
import { ResponsiveLine } from '@nivo/line'

export function Chart({ colorType, data }: {colorType: ColorTypes, data: DataPoint[]}) {
  const ref = useRef();
  const [width, setWidth] = useState(window.innerWidth);


  return (
    <div style={{height:"400px", width:"100%", zIndex:10000000}}>
<ResponsiveLine
    data={[{
        id: ColorTypeToString[colorType] ?? "Unknown",
        color: "#ff0000",
        data: data
    }]}
    curve='monotoneX'
    margin={{ top: 0, right: 110, bottom: 50, left: 60 }}
    xScale={{ type: 'point' }}
    yScale={{
        type: 'linear',
        min: 'auto',
        max: 'auto',
        stacked: true,
        reverse: false
    }}
    yFormat=" >-.2f"
    axisTop={null}
    axisRight={null}
    axisBottom={{
        tickSize: 1,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'Block Number',
        legendOffset: 36,
        legendPosition: 'middle'
    }}
    enableArea={true}
    areaOpacity={0.8}
    axisLeft={{
        tickSize: 1,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'count',
        legendOffset: -40,
        legendPosition: 'middle'
    }}
    
    pointSize={10}
    pointBorderWidth={1}
    pointLabelYOffset={-12}
    useMesh={true}
/>

    </div>
      );
}

