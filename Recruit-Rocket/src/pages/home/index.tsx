import { Col, Row, Card, Typography } from "antd"
import { DashboardTotalCountCard, ApplicantPieChart, DealsChart, LatestActivities, UpcomingEvents } from "@/components"
import { DASHBOARD_TOTAL_COUNTS_QUERY } from "@/graphql/queries"
import { useCustom, useGetIdentity } from "@refinedev/core"
import { DashboardTotalCountsQuery } from "@/graphql/types"
import { TotalCountType } from '@/constants';
import { useEffect, useState } from "react";

const { Title, Text } = Typography;

export const Home = () => {
    console.log("Home component rendered");

    const { data, isLoading } = useCustom<DashboardTotalCountsQuery>({
        url: '',
        method: 'get',
        meta:{
            gqlQuery: DASHBOARD_TOTAL_COUNTS_QUERY    
        }
    })

    console.log("useCustom hook result:", { data, isLoading });

    const { data: user } = useGetIdentity<{ id: string; name: string; email: string }>();
    console.log("useGetIdentity hook result:", user);

    const [userDashboardData, setUserDashboardData] = useState<any>(null);

    useEffect(() => {
        console.log("useEffect for fetching user dashboard triggered");
        const fetchUserDashboard = async () => {
            const token = localStorage.getItem("token");
            console.log("Token from localStorage:", token);
            if (token) {
                try {
                    console.log("Fetching user dashboard data...");
                    const response = await fetch("http://127.0.0.1:8000/user/dashboard", {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    console.log("User dashboard response status:", response.status);
                    if (response.ok) {
                        const data = await response.json();
                        console.log("User dashboard data received:", data);
                        setUserDashboardData(data);
                    } else {
                        console.error("Failed to fetch user dashboard. Status:", response.status);
                    }
                } catch (error) {
                    console.error("Error fetching user dashboard:", error);
                }
            } else {
                console.log("No token found in localStorage");
            }
        };

        fetchUserDashboard();
    }, []);

    console.log("Current userDashboardData state:", userDashboardData);

    const cardTypes: TotalCountType[] = ['total', 'accepted', 'considering', 'rejected'];

    console.log("Rendering Home component JSX");
    return(
        <div>
            {user && userDashboardData && (
                <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
                    <Col span={24}>
                        <Card>
                            <Title level={2}>Welcome, {user.name}!</Title>
                            <Text>Email: {userDashboardData.user.email}</Text>
                            {userDashboardData.total_applications && (
                                <Text style={{ display: 'block', marginTop: '8px' }}>
                                    Total Applications: {userDashboardData.total_applications}
                                </Text>
                            )}
                        </Card>
                    </Col>
                </Row>
            )}
            <Row gutter={[16, 16]}>
                {cardTypes.map((type) => (
                    <Col key={type} xs={24} sm={24} xl={6}>
                        <DashboardTotalCountCard 
                            resource={type}
                            isLoading={isLoading}
                            totalCount={data?.data?.[type === 'total' ? 'companies' : type === 'accepted' ? 'contacts' : 'deals']?.totalCount}
                        />
                    </Col>
                ))}
            </Row>
            <Row
                gutter={[32, 32]}
                style={{
                    marginTop: '32px'
                }}
            >
                <Col
                    xs={24}
                    sm={24}
                    xl={8}
                    style={{
                        height: '460px'
                    }}
                >
                    <UpcomingEvents />
                </Col>
                <Col
                    xs={24}
                    sm={24}
                    xl={16}
                    style={{
                        height: '460px'
                    }}
                >
                    <ApplicantPieChart />
                </Col>
            </Row>

            <Row
              gutter={[32, 32]}
              style={{
                marginTop: '32px'
              }}
            >
                <Col xs={24}>
                    <LatestActivities />
                </Col>
            </Row>
        </div>
    )
}