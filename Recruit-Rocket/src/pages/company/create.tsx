import React from 'react';
import { Form, Input, Modal, Select, InputNumber, Space, Button } from "antd";
import { Applicant } from '@/graphql/types';

interface CreateApplicantProps {
    visible: boolean;
    onCancel: () => void;
    onCreateSuccess: (newApplicant: Applicant) => void;
  }
  
  const CreateApplicant: React.FC<CreateApplicantProps> = ({ visible, onCancel, onCreateSuccess }) => {
    const [form] = Form.useForm();
  
    const onFinish = (values: any) => {
      const newApplicant: Applicant = {
        id: Math.floor(Math.random() * 1000000).toString(), // Generate a smaller, string ID
        name: values.name,
        status: values.status as Applicant['status'],
        strength: Number(values.strength),
        stages: [],
        imageUrl: values.imageUrl,
        year: Number(values.year),
        major: values.major,
        gender: values.gender,
        summary: values.summary
      };
      onCreateSuccess(newApplicant);
      form.resetFields();
    };

  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      title="Create Applicant"
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="rejected">Rejected</Select.Option>
            <Select.Option value="considering">Considering</Select.Option>
            <Select.Option value="accepted">Accepted</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="strength" label="Strength" rules={[{ required: true }]}>
          <InputNumber min={0} max={100} />
        </Form.Item>
        <Form.Item name="imageUrl" label="Image URL" rules={[{ required: true }]}>
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
        <Form.Item name="summary" label="Summary" rules={[{ required: true }]}>
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Create
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateApplicant;