// src/pages/values/index.tsx

import React, { useState, useEffect } from 'react';
import { List, Button, Card, Space, Modal, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { TextArea } = Input;

export const Values: React.FC = () => {
  const [values, setValues] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentValue, setCurrentValue] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);

  useEffect(() => {
    const storedValues = JSON.parse(localStorage.getItem('companyValues') || '[]');
    setValues(storedValues);
  }, []);

  useEffect(() => {
    localStorage.setItem('companyValues', JSON.stringify(values));
  }, [values]);

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

  const handleOk = () => {
    if (currentValue.trim()) {
      if (editIndex !== null) {
        const updatedValues = [...values];
        updatedValues[editIndex] = currentValue.trim();
        setValues(updatedValues);
      } else {
        setValues([...values, currentValue.trim()]);
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

  const handleRemoveValue = (index: number) => {
    const updatedValues = values.filter((_, i) => i !== index);
    setValues(updatedValues);
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