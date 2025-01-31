import React, { useState, useEffect } from 'react';
import { List, CreateButton, EditButton, DeleteButton } from '@refinedev/antd';
import { useNavigation, useGetIdentity } from '@refinedev/core';
import { Table, Space, message, Button, Popconfirm } from 'antd';
import { Text } from '@/components/text';
import { Applicant } from '@/graphql/types';
import CreateApplicant from './create';
import BulkCreateApplicants from './bulk-create';
import { DeleteOutlined } from '@ant-design/icons';
import api from '@/api';

export const ApplicantList: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isBulkModalVisible, setIsBulkModalVisible] = useState(false);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: user } = useGetIdentity<{id: string, name: string, email: string}>();
  const { push } = useNavigation();

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  useEffect(() => {
    fetchApplicants();
  }, [user]);

  const fetchApplicants = async () => {
    if (user?.id) {
      setLoading(true);
      try {
        const response = await api.get('/applicants');
        setApplicants(response.data);
      } catch (error) {
        console.error('Failed to fetch applicants:', error);
        message.error('Failed to load applicants');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCreateApplicant = async (newApplicant: Omit<Applicant, 'id'>) => {
    try {
      const response = await api.post('/applicants', newApplicant);
      setApplicants([...applicants, response.data]);
      message.success('Applicant created successfully');
    } catch (error) {
      console.error('Failed to create applicant:', error);
      message.error('Failed to create applicant');
    }
    setIsModalVisible(false);
  };

  const handleDeleteApplicant = async (id: string) => {
    try {
      await api.delete(`/applicants/${id}`);
      setApplicants(applicants.filter(a => a.id !== id));
      message.success('Applicant deleted successfully');
    } catch (error) {
      console.error('Failed to delete applicant:', error);
      message.error('Failed to delete applicant');
    }
  };

  const getUniqueEvaluators = (stages: Applicant['stages']) => {
    const evaluatorsSet = new Set<string>();
    stages.forEach(stage => {
      stage.stage_evaluators.forEach(evaluator => evaluatorsSet.add(evaluator));
    });
    return Array.from(evaluatorsSet);
  };
  
  return (
    <div>
      <List 
        breadcrumb={false}
        headerButtons={
          <>
            <CreateButton 
              onClick={() => setIsModalVisible(true)}
            />
            <Button 
              onClick={() => setIsBulkModalVisible(true)}
              style={{ marginLeft: '10px' }}
            >
              Bulk Create
            </Button>
          </>
        }
      >
        <Table
          dataSource={applicants}
          rowKey="id"
          loading={loading}
        >
          <Table.Column<Applicant>
            dataIndex="name"
            title="Name"
            render={(value) => <Text>{value}</Text>}
          />
          <Table.Column<Applicant>
            dataIndex="status"
            title="Status"
            render={(value) => <Text>{capitalizeFirstLetter(value)}</Text>}
          />
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
                  onClick={() => push(`/applicants/edit/${value}`)}
                />
                <Popconfirm
                  title="Are you sure you want to delete this applicant?"
                  onConfirm={() => handleDeleteApplicant(value)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button 
                    icon={<DeleteOutlined />} 
                    size="small" 
                    danger
                  />
                </Popconfirm>
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
      <BulkCreateApplicants
        visible={isBulkModalVisible}
        onCancel={() => setIsBulkModalVisible(false)}
        onBulkCreateSuccess={() => {
          setIsBulkModalVisible(false);
          fetchApplicants();
        }}
      />
      {children}
    </div>
  );
};

export default ApplicantList;