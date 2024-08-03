import React from 'react';
import { List, EditButton, DeleteButton } from '@refinedev/antd';
import { Table, Space, Image } from 'antd';
import { Text } from '@/components/text';
import { Applicant } from '@/graphql/types';
import applicantsData from "../../mocks/mock-applicants";

console.log("Imported applicantsData:", applicantsData);

export const CompanyList: React.FC<React.PropsWithChildren> = ({ children }) => {
  console.log("CompanyList component rendering");

  return (
    <div>
      <List breadcrumb={false}>
        <Table
          dataSource={applicantsData}
          rowKey="id"
        >
          {console.log("Rendering Table component")}
          <Table.Column<Applicant>
            dataIndex="name"
            title="Name"
            render={(value) => {
              console.log("Rendering Name column, value:", value);
              return <Text>{value}</Text>;
            }}
          />
          <Table.Column<Applicant>
            dataIndex="status"
            title="Status"
            render={(value) => {
              console.log("Rendering Status column, value:", value);
              return <Text>{value}</Text>;
            }}
          />
          <Table.Column<Applicant>
            dataIndex="strength"
            title="Strength"
            render={(value) => {
              console.log("Rendering Strength column, value:", value);
              return <Text>{value}</Text>;
            }}
          />
          <Table.Column<Applicant>
            dataIndex="imageUrl"
            title="Image"
            render={(value) => {
              console.log("Rendering Image column, value:", value);
              return <Image src={value} alt="Applicant" width={50} />;
            }}
          />
          <Table.Column<Applicant>
            dataIndex="year"
            title="Year"
            render={(value) => {
              console.log("Rendering Year column, value:", value);
              return <Text>{value}</Text>;
            }}
          />
          <Table.Column<Applicant>
            dataIndex="major"
            title="Major"
            render={(value) => {
              console.log("Rendering Major column, value:", value);
              return <Text>{value}</Text>;
            }}
          />
          <Table.Column<Applicant>
            dataIndex="gender"
            title="Gender"
            render={(value) => {
              console.log("Rendering Gender column, value:", value);
              return <Text>{value}</Text>;
            }}
          />
          <Table.Column<Applicant>
            dataIndex="summary"
            title="Summary"
            render={(value) => {
              console.log("Rendering Summary column, value:", value);
              return <Text>{value}</Text>;
            }}
          />
          <Table.Column<Applicant>
            dataIndex="evaluators"
            title="Evaluators"
            render={(evaluators: string[]) => {
              console.log("Rendering Evaluators column, value:", evaluators);
              return <>{evaluators.join(', ')}</>;
            }}
          />
          <Table.Column<Applicant>
            dataIndex="stages"
            title="Stages"
            render={(stages: Applicant['stages']) => {
              console.log("Rendering Stages column, value:", stages);
              return (
                <>
                  {stages.map(stage => (
                    <div key={stage.stage_name}>
                      <div>Stage: {stage.stage_name}</div>
                      <div>Evaluators: {stage.stage_evaluators.join(', ')}</div>
                      <div>Notes: {stage.notes}</div>
                      <div>Performance: {stage.performance}</div>
                    </div>
                  ))}
                </>
              );
            }}
          />
          <Table.Column<Applicant>
            dataIndex="id"
            title="Actions"
            fixed="right"
            render={(value) => {
              console.log("Rendering Actions column, value:", value);
              return (
                <Space>
                  <EditButton hideText size="small" recordItemId={value} />
                  <DeleteButton hideText size="small" recordItemId={value} />
                </Space>
              );
            }}
          />
        </Table>
      </List>
      {children}
    </div>
  );
};

console.log("CompanyList component defined");

export default CompanyList;

