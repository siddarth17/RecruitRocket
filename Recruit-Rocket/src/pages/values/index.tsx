import React, { useState, useEffect } from 'react';
import { List, Button, Card, Space, Modal, Input, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@/api';

const { TextArea } = Input;

export const Values: React.FC = () => {
  const [values, setValues] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentValue, setCurrentValue] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchValues();
  }, []);

  const fetchValues = async () => {
    try {
      const response = await api.get('/company-values');
      setValues(response.data.values);
    } catch (error) {
      console.error('Failed to fetch company values:', error);
      message.error('Failed to load company values');
    }
  };

  const showModal = (index?: number) => {
    if (index !== undefined) {
      setEditIndex(index);
      setCurrentValue(values[index]);
    } else {
      setEditIndex(null);
      setCurrentValue('');
    }
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    if (currentValue.trim()) {
      try {
        if (editIndex !== null) {
          await api.put(`/company-values/${editIndex}`, { value: currentValue.trim() });
        } else {
          await api.post('/company-values', { value: currentValue.trim() });
        }
        fetchValues();
        message.success(editIndex !== null ? 'Value updated successfully' : 'Value added successfully');
      } catch (error) {
        console.error('Failed to save company value:', error);
        message.error('Failed to save company value');
      }
    }
    setIsModalVisible(false);
    setCurrentValue('');
    setEditIndex(null);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentValue('');
    setEditIndex(null);
  };

  const handleRemoveValue = async (index: number) => {
    try {
      await api.delete(`/company-values/${index}`);
      fetchValues();
      message.success('Value deleted successfully');
    } catch (error) {
      console.error('Failed to delete company value:', error);
      message.error('Failed to delete company value');
    }
  };

  return (
    <Card 
      title="Company Values" 
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>Add Value</Button>}
    >
      <List
        dataSource={values}
        renderItem={(value, index) => (
          <List.Item
            actions={[
              <Button icon={<EditOutlined />} onClick={() => showModal(index)}>Edit</Button>,
              <Button icon={<DeleteOutlined />} onClick={() => handleRemoveValue(index)} danger>Delete</Button>
            ]}
          >
            <Space>
              <strong>{`Value ${index + 1}:`}</strong>
              {value}
            </Space>
          </List.Item>
        )}
      />
      <Modal
        title={editIndex !== null ? "Edit Value" : "Add New Value"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <TextArea
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          autoSize={{ minRows: 2, maxRows: 6 }}
          placeholder="Enter company value"
        />
      </Modal>
    </Card>
  );
};

export default Values;