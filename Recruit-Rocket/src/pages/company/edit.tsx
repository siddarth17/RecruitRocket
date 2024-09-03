import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Edit, useForm } from '@refinedev/antd';
import { Row, Col, Card, Button, Modal, Form, Input, InputNumber, Select, Table, message } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Applicant, Stage } from '@/graphql/types';
import applicantsData from "../../mocks/mock-applicants";
import api from '@/api';

const { TextArea } = Input;

const ApplicantEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [applicant, setApplicant] = useState<Applicant | undefined>(undefined);
  const [isGeneralInfoModalVisible, setIsGeneralInfoModalVisible] = useState(false);
  const [isSummaryModalVisible, setIsSummaryModalVisible] = useState(false);
  const [isStageModalVisible, setIsStageModalVisible] = useState(false);

  const { formProps, saveButtonProps } = useForm<Applicant>({
    redirect: false,
  });

  useEffect(() => {
    const fetchApplicant = async () => {
      try {
        const response = await api.get(`/applicants/${id}`);
        setApplicant(response.data);
      } catch (error) {
        console.error('Failed to fetch applicant:', error);
        message.error('Failed to load applicant');
      }
    };

    if (id) {
      fetchApplicant();
    }
  }, [id]);

  if (!applicant) {
    return <div>Loading...</div>;
  }

  const handleGeneralInfoSave = (values: Partial<Applicant>) => {
    setApplicant(prev => prev ? { ...prev, ...values } : undefined);
    setIsGeneralInfoModalVisible(false);
  };

  const handleSummarySave = (values: { summary: string }) => {
    setApplicant(prev => prev ? { ...prev, summary: values.summary } : undefined);
    setIsSummaryModalVisible(false);
  };

  const handleStageAdd = (values: Stage) => {
    setApplicant(prev => prev ? { 
      ...prev, 
      stages: [...prev.stages, values] 
    } : undefined);
    setIsStageModalVisible(false);
  };

  const columns = [
    {
      title: 'Stage Name',
      dataIndex: 'stage_name',
      key: 'stage_name',
    },
    {
      title: 'Evaluators',
      dataIndex: 'stage_evaluators',
      key: 'stage_evaluators',
      render: (evaluators: string[]) => evaluators.join(', '),
    },
    {
      title: 'Performance',
      dataIndex: 'performance',
      key: 'performance',
    },
  ];

  return (
    <Edit 
        saveButtonProps={saveButtonProps}
        headerButtons={({ defaultButtons }) => (
          <>
          </>
        )}
      >
      <Form {...formProps} layout="vertical">
        <Row gutter={[32, 32]}>
          <Col xs={24} xl={12}>
            <Card
              title="General Information"
              extra={<Button icon={<EditOutlined />} onClick={() => setIsGeneralInfoModalVisible(true)}>Edit</Button>}
            >
              <p><strong>Name:</strong> {applicant.name}</p>
              <p><strong>Year:</strong> {applicant.year}</p>
              <p><strong>Major:</strong> {applicant.major}</p>
              <p><strong>Gender:</strong> {applicant.gender}</p>
              <p><strong>Overall Strength:</strong> {applicant.strength}</p>
              <p><strong>Status:</strong> {applicant.status}</p>
            </Card>
            <Card
              style={{ marginTop: 16 }}
              title="Summary"
              extra={<Button icon={<EditOutlined />} onClick={() => setIsSummaryModalVisible(true)}>Edit</Button>}
            >
              <p>{applicant.summary}</p>
            </Card>
          </Col>
          <Col xs={24} xl={12}>
            <Card
              title="Stages"
              extra={<Button icon={<PlusOutlined />} onClick={() => setIsStageModalVisible(true)}>Add Stage</Button>}
            >
              <Table dataSource={applicant.stages} columns={columns} rowKey="stage_name" />
            </Card>
          </Col>
        </Row>
      </Form>

      <Modal
        title="Edit General Information"
        visible={isGeneralInfoModalVisible}
        onCancel={() => setIsGeneralInfoModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleGeneralInfoSave} initialValues={applicant}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="year" label="Year" rules={[{ required: true }]}>
            <InputNumber min={1} max={5} />
          </Form.Item>
          <Form.Item name="major" label="Major" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="strength" label="Overall Strength" rules={[{ required: true }]}>
            <InputNumber min={0} max={100} />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="rejected">Rejected</Select.Option>
              <Select.Option value="considering">Considering</Select.Option>
              <Select.Option value="accepted">Accepted</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit Summary"
        visible={isSummaryModalVisible}
        onCancel={() => setIsSummaryModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleSummarySave} initialValues={applicant}>
          <Form.Item name="summary" label="Summary" rules={[{ required: true }]}>
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add Stage"
        visible={isStageModalVisible}
        onCancel={() => setIsStageModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleStageAdd}>
          <Form.Item name="stage_name" label="Stage Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="stage_evaluators" label="Stage Evaluators" rules={[{ required: true }]}>
            <Select mode="tags" style={{ width: '100%' }} placeholder="Enter stage evaluators">
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item name="performance" label="Performance" rules={[{ required: true }]}>
            <InputNumber min={0} max={100} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add Stage
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Edit>
  );
};

export default ApplicantEditPage;