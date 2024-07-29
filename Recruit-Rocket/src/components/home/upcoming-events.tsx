import { Badge, Card, List, Button, Modal, Form, Input, DatePicker, Popconfirm } from 'antd'
import React, { useState } from 'react'
import { CalendarOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { Text } from '../text'
import UpcomingEventsSkeleton from '../skeleton/upcoming-events'
import { useList, useCreate, useDelete } from '@refinedev/core'
import { DASHBORAD_CALENDAR_UPCOMING_EVENTS_QUERY } from '@/graphql/queries'
import dayjs from 'dayjs'
import { BaseKey } from '@refinedev/core'

const { RangePicker } = DatePicker;

const getRandomColor = () => {
  return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
};

// Updated getDate function to only show hours and minutes
const getDate = (startDate: string, endDate: string) => {
  const start = dayjs(startDate).format("MMM DD, YYYY - HH:mm");
  const end = dayjs(endDate).format("MMM DD, YYYY - HH:mm");
  return `${start} - ${end}`;
};

export const UpcomingEvents = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const { data, isLoading, refetch } = useList({
    resource: 'events',
    pagination: { pageSize: 100 },
    sorters: [
      {
        field: 'startDate',
        order: 'asc'
      }
    ],
    meta: {
      gqlQuery: DASHBORAD_CALENDAR_UPCOMING_EVENTS_QUERY
    }
  });

  const { mutate: createEvent } = useCreate();
  const { mutate: deleteEvent } = useDelete();

  const handleAddEvent = (values: any) => {
    createEvent({
      resource: 'events',
      values: {
        title: values.title,
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
        description: values.title,
        categoryId: "1",
        participantIds: [],
        color: getRandomColor(),
      },
    }, {
      onSuccess: () => {
        refetch();
        setIsModalVisible(false);
        form.resetFields();
      }
    });
  };

  const handleDeleteEvent = (id: BaseKey) => {
    if (id !== undefined) {
      deleteEvent({
        resource: 'events',
        id,
      }, {
        onSuccess: () => refetch()
      });
    } else {
      console.error("Cannot delete event: ID is undefined");
    }
  };

  return (
    <Card
      style={{ height: '100%' }}
      headStyle={{ padding: '8px 16px' }}
      bodyStyle={{ padding: '0 1rem', maxHeight: '400px', overflowY: 'auto' }}
      title={
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarOutlined />
            <Text size="sm" style={{ marginLeft: "0.7rem" }}>
              Upcoming Events
            </Text>
          </div>
          <Button icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
            Add Event
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <List
          itemLayout="horizontal"
          dataSource={Array.from({ length: 5 }).map((_, index) => ({
            id: index,
          }))}
          renderItem={() => <UpcomingEventsSkeleton />}
        />
      ) : (
        <List
          itemLayout='horizontal'
          dataSource={data?.data || []}
          renderItem={(item) => {
            const renderDate = getDate(item.startDate, item.endDate);
            return (
              <List.Item
                actions={[
                  <Popconfirm
                    title="Are you sure to delete this event?"
                    onConfirm={() => item.id !== undefined ? handleDeleteEvent(item.id) : undefined}
                    okText="Yes"
                    cancelText="No"
                  >
                    <DeleteOutlined style={{ color: 'red' }} />
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  avatar={<Badge color={item.color} />}
                  title={<Text size="xs">{renderDate}</Text>}
                  description={
                    <Text ellipsis={{ tooltip: true }} strong>
                      {item.title}
                    </Text>
                  }
                />
              </List.Item>
            )
          }}
        />
      )}

      {!isLoading && data?.data.length === 0 && (
        <span
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '220px'
          }}
        >
          No upcoming events
        </span>
      )}

      <Modal
        title="Add New Event"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAddEvent}>
          <Form.Item
            name="title"
            rules={[{ required: true, message: 'Please input the event title!' }]}
          >
            <Input placeholder="Event Title" />
          </Form.Item>
          <Form.Item
            name="dateRange"
            rules={[{ required: true, message: 'Please select the event date range!' }]}
          >
            <RangePicker 
              showTime={{ format: 'HH:mm' }} 
              format="YYYY-MM-DD HH:mm"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add Event
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default UpcomingEvents