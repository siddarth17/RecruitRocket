import { Col, Row } from "antd"
import { DashboardTotalCountCard, ApplicantPieChart, DealsChart, LatestActivities, UpcomingEvents } from "@/components"
import { DASHBOARD_TOTAL_COUNTS_QUERY } from "@/graphql/queries"
import { useCustom } from "@refinedev/core"
import { DashboardTotalCountsQuery } from "@/graphql/types"
import { TotalCountType } from '@/constants';

export const Home = () => {
    const { data, isLoading } = useCustom<DashboardTotalCountsQuery> ({
        url: '',
        method: 'get',
        meta:{
            gqlQuery: DASHBOARD_TOTAL_COUNTS_QUERY    
        }
    })

    const cardTypes: TotalCountType[] = ['total', 'accepted', 'considering', 'rejected'];

    return(
        <div>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={24} xl={6}>
                    <DashboardTotalCountCard 
                         resource="total"
                         isLoading={isLoading}
                         totalCount={data?.data.companies.totalCount}
                    />
                </Col>
                <Col xs={24} sm={24} xl={6}>
                    <DashboardTotalCountCard 
                         resource="accepted"
                         isLoading={isLoading}
                         totalCount={data?.data.contacts.totalCount}
                    />
                </Col>
                <Col xs={24} sm={24} xl={6}>
                    <DashboardTotalCountCard 
                         resource="considering"
                         isLoading={isLoading}
                         totalCount={data?.data.deals.totalCount}
                    />
                </Col>
                <Col xs={24} sm={24} xl={6}>
                    <DashboardTotalCountCard 
                         resource="rejected"
                         isLoading={isLoading}
                         totalCount={data?.data.deals.totalCount}
                    />
                </Col>
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



