import { UserOutlined } from '@ant-design/icons'
import { Card } from 'antd'
import { Text } from '../text'
import { Pie, PieConfig } from '@ant-design/plots'
import React from 'react'

export const ApplicantPieChart = () => {
    const data = [
        { type: 'Direct Entry', value: 30 },
        { type: 'Strong', value: 25 },
        { type: 'Decent', value: 20 },
        { type: 'Average', value: 15 },
        { type: 'Weak', value: 10 },
    ];

    const config: PieConfig = {
        data,
        angleField: 'value',
        colorField: 'type',
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
            style={{height:'100%'}}
            headStyle={{padding: '8px 16px'}}
            bodyStyle={{padding: '24px 24px 0 24px'}}
            title={
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <UserOutlined />
                    <Text size="sm" style={{ marginLeft: '0.5rem'}}>
                        Applicant Distribution
                    </Text>
                </div>
            }
        >
            <Pie {...config} />
        </Card>
    )
}

export default ApplicantPieChart