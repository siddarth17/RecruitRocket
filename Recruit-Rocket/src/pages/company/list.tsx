import React, { useState, useEffect } from 'react';
import { List, CreateButton, EditButton, DeleteButton } from '@refinedev/antd';
import { Table, Space, Image } from 'antd';
import { Text } from '@/components/text';
import { Applicant } from '@/graphql/types';
import applicantsData from "../../mocks/mock-applicants";
import CreateApplicant from './create';

export const CompanyList: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [applicants, setApplicants] = useState<Applicant[]>([]);

  useEffect(() => {
    // Load applicants from localStorage and combine with pre-built applicants
    const storedApplicants = JSON.parse(localStorage.getItem('applicants') || '[]');
    setApplicants([...applicantsData, ...storedApplicants]);
  }, []);

  const getUniqueEvaluators = (stages: Applicant['stages']) => {
    const evaluatorsSet = new Set<string>();
    stages.forEach(stage => {
      stage.stage_evaluators.forEach(evaluator => evaluatorsSet.add(evaluator));
    });
    return Array.from(evaluatorsSet);
  };

  const handleCreateApplicant = (newApplicant: Applicant) => {
    const updatedApplicants = [...applicants, newApplicant];
    setApplicants(updatedApplicants);
    // Store in localStorage
    localStorage.setItem('applicants', JSON.stringify(updatedApplicants.filter(a => !applicantsData.some(preBuilt => preBuilt.id === a.id))));
    setIsModalVisible(false);
  };

  return (
    <div>
      <List 
        breadcrumb={false}
        headerButtons={
          <CreateButton 
            onClick={() => setIsModalVisible(true)}
          />
        }
      >
        <Table
          dataSource={applicants}
          rowKey="id"
        >
          <Table.Column<Applicant>
            dataIndex="name"
            title="Name"
            render={(value) => <Text>{value}</Text>}
          />
          <Table.Column<Applicant>
            dataIndex="status"
            title="Status"
            render={(value) => <Text>{value}</Text>}
          />
          {/* <Table.Column<Applicant>
            dataIndex="imageUrl"
            title="Image"
            render={(value) => <Image src={value} alt="Applicant" width={50} />}
          /> */}
          <Table.Column<Applicant>
            dataIndex="stages"
            title="Evaluators"
            render={(stages: Applicant['stages']) => {
              const uniqueEvaluators = getUniqueEvaluators(stages);
              return <>{uniqueEvaluators.join(', ')}</>;
            }}
          />
          <Table.Column<Applicant>
            dataIndex="id"
            title="Actions"
            render={(value) => (
              <Space>
                <EditButton 
                  hideText 
                  size="small" 
                  recordItemId={value}
                />
                <DeleteButton hideText size="small" recordItemId={value} />
              </Space>
            )}
          />
        </Table>
      </List>
      <CreateApplicant 
        visible={isModalVisible} 
        onCancel={() => setIsModalVisible(false)}
        onCreateSuccess={handleCreateApplicant}
      />
      {children}
    </div>
  );
};

export default CompanyList;