import React, { useEffect, useState } from "react";
import { Col, Row, Card } from "antd";
import { DashboardTotalCountCard, ApplicantPieChart, UpcomingEvents } from "@/components";
import { useGetIdentity } from "@refinedev/core";
import api from "@/api";
import { Pie, PieConfig, Column, ColumnConfig } from '@ant-design/plots';
import { UserOutlined, BookOutlined } from '@ant-design/icons';
import { Text } from '@/components/text';

interface Applicant {
  id: string;
  name: string;
  status: string;
  strength: number;
  gender: string;
  major: string;
}

export const Home = () => {
  const { data: user } = useGetIdentity<{ id: string; name: string; email: string }>();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const applicantsResponse = await api.get<Applicant[]>("/applicants");
        setApplicants(applicantsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getApplicantCounts = () => {
    const counts = {
      total: applicants.length,
      accepted: 0,
      considering: 0,
      rejected: 0
    };

    applicants.forEach(applicant => {
      if (applicant.status === "accepted") counts.accepted++;
      else if (applicant.status === "considering") counts.considering++;
      else if (applicant.status === "rejected") counts.rejected++;
    });

    return counts;
  };

  const getApplicantDistribution = () => {
    const distribution = [
      { type: 'Strong', value: 0 },
      { type: 'Average', value: 0 },
      { type: 'Weak', value: 0 }
    ];

    applicants.forEach(applicant => {
      if (applicant.strength > 70) distribution[0].value++;
      else if (applicant.strength > 40) distribution[1].value++;
      else distribution[2].value++;
    });

    return distribution;
  };

  const getGenderDistribution = () => {
    const distribution: { [key: string]: number } = {
      'Male': 0,
      'Female': 0,
      'Non-binary': 0
    };
    applicants.forEach(applicant => {
      const normalizedGender = applicant.gender.replace(/[^a-zA-Z]/g, '').toLowerCase();
      if (normalizedGender === 'male') distribution['Male']++;
      else if (normalizedGender === 'female') distribution['Female']++;
      else distribution['Non-binary']++;
    });
    return Object.entries(distribution)
      .filter(([_, value]) => value > 0)
      .map(([gender, value]) => ({ gender, value }));
  };

  const getMajorDistribution = () => {
    const distribution: { [key: string]: number } = {};
    applicants.forEach(applicant => {
      if (distribution[applicant.major]) {
        distribution[applicant.major]++;
      } else {
        distribution[applicant.major] = 1;
      }
    });
    return Object.entries(distribution)
      .map(([major, value]) => ({ major, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); 
  };

  const applicantCounts = getApplicantCounts();
  const applicantDistribution = getApplicantDistribution();
  const genderDistribution = getGenderDistribution();
  const majorDistribution = getMajorDistribution();

  const GenderDistributionChart = () => {
    const config: PieConfig = {
      data: genderDistribution,
      angleField: 'value',
      colorField: 'gender',
      radius: 0.8,
      label: {
        type: 'outer',
        content: '{name}: {percentage}',
      },
      interactions: [
        {
          type: 'element-active',
        },
      ],
      legend: {
        position: 'bottom',
        flipPage: false,
      },
      theme: {
        colors10: ['#1890ff', '#ff6b72', '#ffc53d'],
      },
    };

    return (
      <Card
        style={{ height: '100%' }}
        headStyle={{ padding: '8px 16px' }}
        bodyStyle={{ padding: '16px', display: 'flex', flexDirection: 'column', height: 'calc(100% - 56px)' }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserOutlined />
            <Text size="sm" style={{ marginLeft: '0.5rem' }}>
              Gender Distribution
            </Text>
          </div>
        }
      >
        {genderDistribution.length > 0 ? (
          <div style={{ flex: 1, minHeight: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Pie {...config} style={{ height: '100%', width: '100%' }} />
          </div>
        ) : (
          <div>No data available</div>
        )}
      </Card>
    );
  };

  const MajorDistributionChart = () => {
    const config: ColumnConfig = {
      data: majorDistribution,
      xField: 'major',
      yField: 'value',
      label: {
        position: 'top',
        style: {
          fill: '#000000',
          opacity: 0.6,
        },
      },
      xAxis: {
        label: {
          autoHide: true,
          autoRotate: false,
        },
      },
      meta: {
        major: {
          alias: 'Major',
        },
        value: {
          alias: 'Number of Applicants',
        },
      },
      color: '#1890ff',
    };

    return (
      <Card
        style={{ height: '100%' }}
        headStyle={{ padding: '8px 16px' }}
        bodyStyle={{ padding: '24px 24px 0 24px', display: 'flex', flexDirection: 'column', height: 'calc(100% - 56px)' }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOutlined />
            <Text size="sm" style={{ marginLeft: '0.5rem' }}>
              Top 10 Majors
            </Text>
          </div>
        }
      >
        {majorDistribution.length > 0 ? (
          <div style={{ flex: 1, minHeight: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Column {...config} style={{ height: '100%', width: '100%' }} />
          </div>
        ) : (
          <div>No data available</div>
        )}
      </Card>
    );
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <DashboardTotalCountCard 
            resource="total"
            isLoading={isLoading}
            totalCount={applicantCounts.total}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <DashboardTotalCountCard 
            resource="accepted"
            isLoading={isLoading}
            totalCount={applicantCounts.accepted}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <DashboardTotalCountCard 
            resource="considering"
            isLoading={isLoading}
            totalCount={applicantCounts.considering}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <DashboardTotalCountCard 
            resource="rejected"
            isLoading={isLoading}
            totalCount={applicantCounts.rejected}
          />
        </Col>
      </Row>
      <Row
        gutter={[32, 32]}
        style={{
          marginTop: '32px'
        }}
      >
        <Col xs={24} sm={24} xl={8} style={{ height: '460px' }}>
          <UpcomingEvents />
        </Col>
        <Col xs={24} sm={24} xl={16} style={{ height: '460px' }}>
          <ApplicantPieChart data={applicantDistribution} />
        </Col>
      </Row>
      <Row
        gutter={[32, 32]}
        style={{
          marginTop: '32px'
        }}
      >
        <Col xs={24} sm={24} xl={12} style={{ height: '450px' }}>
          <GenderDistributionChart />
        </Col>
        <Col xs={24} sm={24} xl={12} style={{ height: '450px' }}>
          <MajorDistributionChart />
        </Col>
      </Row>
    </div>
  );
};

export default Home;