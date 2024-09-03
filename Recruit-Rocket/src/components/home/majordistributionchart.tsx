import React from 'react';
import { Card } from 'antd';
import { Pie, PieConfig } from '@ant-design/plots';
import { BookOutlined } from '@ant-design/icons';
import { Text } from '../text';

interface MajorDistribution {
  major: string;
  value: number;
}

interface MajorDistributionChartProps {
  data: MajorDistribution[];
}

export const MajorDistributionChart: React.FC<MajorDistributionChartProps> = ({ data }) => {
  const config: PieConfig = {
    data,
    angleField: 'value',
    colorField: 'major',
    radius: 0.8,
    label: {
      type: 'inner',
      style: {
        fontSize: 0, // Make the font size 0 to effectively hide all labels
      },
    },
    legend: false,
    interactions: [
      {
        type: 'element-active',
      },
    ],
    tooltip: {
      formatter: (datum) => {
        return { name: datum.major, value: `${datum.value} (${(datum.percent * 100).toFixed(2)}%)` };
      },
    },
    // Disable any auto-generated labels
    autoFit: true,
    appendPadding: 10,
  };

  return (
    <Card
      style={{ height: '100%' }}
      headStyle={{ padding: '8px 16px' }}
      bodyStyle={{ padding: '24px 24px 0 24px', display: 'flex', flexDirection: 'column' }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOutlined />
          <Text size="sm" style={{ marginLeft: '0.5rem' }}>
            Major Distribution
          </Text>
        </div>
      }
    >
      {data && data.length > 0 ? (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Pie {...config} />
        </div>
      ) : (
        <div>No data available</div>
      )}
    </Card>
  );
};

export default MajorDistributionChart;