import React, { useState } from 'react';
import { Modal, Upload, message, Progress } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import api from '@/api';

const { Dragger } = Upload;

interface BulkCreateApplicantsProps {
  visible: boolean;
  onCancel: () => void;
  onBulkCreateSuccess: () => void;
}

const BulkCreateApplicants: React.FC<BulkCreateApplicantsProps> = ({
  visible,
  onCancel,
  onBulkCreateSuccess,
}) => {
  const [file, setFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async () => {
    if (!file) {
      message.error('Please select a CSV file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setProgress(0);

    try {
      const response = await api.post('/applicants/bulk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
          setProgress(percentCompleted);
        },
      });

      setFile(null);
      message.success('Bulk applicant creation successful');
      onBulkCreateSuccess();
    } catch (error) {
      console.error('Bulk applicant creation failed:', error);
      message.error('Bulk applicant creation failed');
    } finally {
      setUploading(false);
    }
  };

  const props = {
    onRemove: () => {
      setFile(null);
    },
    beforeUpload: (file: any) => {
      if (file.type !== 'text/csv') {
        message.error(`${file.name} is not a CSV file`);
        return Upload.LIST_IGNORE;
      }
      setFile(file);
      return false;
    },
    fileList: file ? [file] : [],
  };

  return (
    <Modal
      visible={visible}
      title="Bulk Create Applicants"
      onCancel={onCancel}
      onOk={handleUpload}
      okText="Upload"
      okButtonProps={{ disabled: !file || uploading }}
      cancelButtonProps={{ disabled: uploading }}
    >
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag a CSV file to this area to upload</p>
        <p className="ant-upload-hint">
          Upload a single CSV file containing applicant information for bulk creation.
        </p>
      </Dragger>
      {uploading && <Progress percent={progress} />}
    </Modal>
  );
};

export default BulkCreateApplicants;