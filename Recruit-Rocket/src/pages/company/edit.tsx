import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Edit, useForm } from '@refinedev/antd';
import { Row, Col, Card, Button, Modal, Form, Input, InputNumber, Select, Table, message, Space } from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined, SyncOutlined } from '@ant-design/icons';
import { Applicant, Stage } from '@/graphql/types';
import api from '@/api';
import { FormInstance } from 'antd/lib/form';

const { TextArea } = Input;

const AIEvaluation: React.FC<{ evaluation: string }> = ({ evaluation }) => {
  return (
    <Card title="AI-Generated Evaluation">
      <div dangerouslySetInnerHTML={{ __html: evaluation }} />
    </Card>
  );
};

const ApplicantEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [applicant, setApplicant] = useState<Applicant | undefined>(undefined);
  const [isGeneralInfoModalVisible, setIsGeneralInfoModalVisible] = useState(false);
  const [isSummaryModalVisible, setIsSummaryModalVisible] = useState(false);
  const [isStageModalVisible, setIsStageModalVisible] = useState(false);
  const [editingStageIndex, setEditingStageIndex] = useState<number | null>(null);
  const [aiEvaluation, setAiEvaluation] = useState<string>('');
  const [isGeneratingEvaluation, setIsGeneratingEvaluation] = useState(false);

  const stageFormRef = React.useRef<FormInstance>(null);

  const { formProps, saveButtonProps } = useForm<Applicant>({
    redirect: false,
  });

  useEffect(() => {
    fetchApplicant();
  }, [id]);

  const fetchApplicant = async () => {
    try {
      const response = await api.get(`/applicants/${id}`);
      setApplicant(response.data);
    } catch (error) {
      console.error('Failed to fetch applicant:', error);
      message.error('Failed to load applicant');
    }
  };

  const handleGeneralInfoSave = async (values: Partial<Applicant>) => {
    try {
      const response = await api.put(`/applicants/${id}`, values);
      setApplicant(response.data);
      setIsGeneralInfoModalVisible(false);
      message.success('General information updated successfully');
    } catch (error) {
      console.error('Failed to update general information:', error);
      message.error('Failed to update general information');
    }
  };

  const handleSummarySave = async (values: { summary: string }) => {
    try {
      const response = await api.put(`/applicants/${id}`, values);
      setApplicant(response.data);
      setIsSummaryModalVisible(false);
      message.success('Summary updated successfully');
    } catch (error) {
      console.error('Failed to update summary:', error);
      message.error('Failed to update summary');
    }
  };

  const handleStageAdd = async (values: Stage) => {
    try {
      const response = await api.post(`/applicants/${id}/stages`, values);
      setApplicant(response.data);
      setIsStageModalVisible(false);
      stageFormRef.current?.resetFields();
      message.success('Stage added successfully');
    } catch (error) {
      console.error('Failed to add stage:', error);
      message.error('Failed to add stage');
    }
  };

  const handleStageUpdate = async (values: Stage) => {
    if (editingStageIndex === null) return;
    try {
      const response = await api.put(`/applicants/${id}/stages/${editingStageIndex}`, values);
      setApplicant(response.data);
      setIsStageModalVisible(false);
      setEditingStageIndex(null);
      stageFormRef.current?.resetFields();
      message.success('Stage updated successfully');
    } catch (error) {
      console.error('Failed to update stage:', error);
      message.error('Failed to update stage');
    }
  };

  const handleStageDelete = async (stageIndex: number) => {
    try {
      const response = await api.delete(`/applicants/${id}/stages/${stageIndex}`);
      setApplicant(response.data);
      message.success('Stage deleted successfully');
    } catch (error) {
      console.error('Failed to delete stage:', error);
      message.error('Failed to delete stage');
    }
  };

  const generateAIEvaluation = async () => {
    setIsGeneratingEvaluation(true);
    try {
      const response = await api.post(`/applicants/${id}/ai-evaluation`);
      setAiEvaluation(response.data.evaluation);
      message.success('AI evaluation generated successfully');
    } catch (error) {
      console.error('Failed to generate AI evaluation:', error);
      message.error('Failed to generate AI evaluation');
    } finally {
      setIsGeneratingEvaluation(false);
    }
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
    {
      title: 'Actions',
      key: 'actions',
      render: (text: string, record: Stage, index: number) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => {
              setEditingStageIndex(index);
              setIsStageModalVisible(true);
            }}
          />
          <Button 
            icon={<DeleteOutlined />} 
            onClick={() => handleStageDelete(index)}
          />
        </Space>
      ),
    },
  ];

  if (!applicant) {
    return <div>Loading...</div>;
  }

  return (
    <Edit saveButtonProps={saveButtonProps}>
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
              extra={
                <Button 
                  icon={<PlusOutlined />} 
                  onClick={() => {
                    setEditingStageIndex(null);
                    stageFormRef.current?.resetFields();
                    setIsStageModalVisible(true);
                  }}
                >
                  Add Stage
                </Button>
              }
            >
              <Table dataSource={applicant.stages} columns={columns} rowKey="stage_name" />
            </Card>
            <Card
              style={{ marginTop: 16 }}
              title="AI-Generated Evaluation"
              extra={
                <Button 
                  icon={<SyncOutlined spin={isGeneratingEvaluation} />} 
                  onClick={generateAIEvaluation}
                  loading={isGeneratingEvaluation}
                >
                  {isGeneratingEvaluation ? 'Generating...' : 'Generate Evaluation'}
                </Button>
              }
            >
              {aiEvaluation ? (
                <div dangerouslySetInnerHTML={{ __html: aiEvaluation.replace('<h2>AI-Generated Evaluation</h2>', '') }} />
              ) : (
                <p>Click the button to generate an AI evaluation.</p>
              )}
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
        title={editingStageIndex !== null ? "Edit Stage" : "Add Stage"}
        visible={isStageModalVisible}
        onCancel={() => {
          setIsStageModalVisible(false);
          setEditingStageIndex(null);
          stageFormRef.current?.resetFields();
        }}
        footer={null}
      >
        <Form 
            ref={stageFormRef}
            onFinish={(values) => {
              if (editingStageIndex !== null) {
                handleStageUpdate(values);
              } else {
                handleStageAdd(values);
              }
            }}
            initialValues={editingStageIndex !== null ? applicant.stages[editingStageIndex] : undefined}
        >
          <Form.Item name="stage_name" label="Stage Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="stage_evaluators" label="Stage Evaluators" rules={[{ required: true }]}>
            <Select mode="tags" style={{ width: '100%' }} placeholder="Enter stage evaluators" />
          </Form.Item>
          <Form.Item name="performance" label="Performance">
            <InputNumber min={0} max={100} />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingStageIndex !== null ? "Update Stage" : "Add Stage"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Edit>
  );
};

export default ApplicantEditPage;