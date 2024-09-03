import React from 'react';
import { Card } from 'antd';
import { Pie, PieConfig } from '@ant-design/plots';
import { UserOutlined } from '@ant-design/icons';
import { Text } from '../text';

interface GenderDistribution {
  gender: string;
  value: number;
}

interface GenderDistributionChartProps {
  data: GenderDistribution[];
}

export const GenderDistributionChart: React.FC<GenderDistributionChartProps> = ({ data }) => {
  const config: PieConfig = {
    data,
    angleField: 'value',
    colorField: 'gender',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [
      {
        type: 'pie-legend-active',
      },
      {
        type: 'element-active',
      },
    ],
  };

  return (
    <Card
      style={{ height: '100%' }}
      headStyle={{ padding: '8px 16px' }}
      bodyStyle={{ padding: '24px 24px 0 24px' }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserOutlined />
          <Text size="sm" style={{ marginLeft: '0.5rem' }}>
            Gender Distribution
          </Text>
        </div>
      }
    >
      {data && data.length > 0 ? (
        <Pie {...config} />
      ) : (
        <div>No data available</div>
      )}
    </Card>
  );
};

export default GenderDistributionChart;