// import { Badge, Card, List, Button, Modal, Form, Input, DatePicker, Popconfirm, message } from 'antd'
// import React, { useState, useEffect } from 'react'
// import { CalendarOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
// import { Text } from '../text'
// import UpcomingEventsSkeleton from '../skeleton/upcoming-events'
// import { useList, useCreate, useDelete, useGetIdentity } from '@refinedev/core'
// import { GET_EVENTS_QUERY } from '@/graphql/queries'
// import { CREATE_EVENT_MUTATION, DELETE_EVENT_MUTATION } from '@/graphql/mutations'
// import dayjs from 'dayjs'
// import { BaseKey } from '@refinedev/core'

// const { RangePicker } = DatePicker;

// const getRandomColor = () => {
//   return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
// };

// const getDate = (startDate: string, endDate: string) => {
//   const start = dayjs(startDate).format("MMM DD, YYYY - HH:mm");
//   const end = dayjs(endDate).format("MMM DD, YYYY - HH:mm");
//   return `${start} - ${end}`;
// };

// export const UpcomingEvents: React.FC = () => {
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [form] = Form.useForm();

//   const { data: user } = useGetIdentity<{ id: string }>();
//   const [userId, setUserId] = useState<string | undefined>(undefined);

//   useEffect(() => {
//     if (user?.id) {
//       setUserId(user.id);
//     }
//   }, [user]);

//   const { data, isLoading, refetch } = useList({
//     resource: 'events',
//     meta: {
//       gqlQuery: GET_EVENTS_QUERY,
//       variables: {
//         userId: userId || '',
//       }
//     },
  
//     queryOptions: {
//       enabled: !!userId,
//     }
//   });


//   const { mutate: createEvent } = useCreate();
//   const { mutate: deleteEvent } = useDelete();

//   const handleAddEvent = (values: any) => {
//     if (!userId) {
//       message.error('User ID is not available. Please try again.');
//       return;
//     }
  
//     const newEvent = {
//       title: values.title,
//       startDate: values.dateRange[0].toISOString(),
//       endDate: values.dateRange[1].toISOString(),
//       color: getRandomColor(),
//       userId: userId,
//       description: values.title,
//       categoryId: "1",
//       participantIds: [],
//     };
  
//     console.log('New event data:', newEvent);
  
//     createEvent({
//       resource: 'events',
//       values: newEvent,  // Use 'values' instead of 'variables'
//       meta: {
//         gqlMutation: CREATE_EVENT_MUTATION
//       }
//     }, {
//       onSuccess: (response) => {
//         console.log('Create event response:', response);
//         refetch();
//         setIsModalVisible(false);
//         form.resetFields();
//         message.success('Event created successfully');
//       },
//       onError: (error) => {
//         console.error('Error creating event:', error);
//         message.error('Failed to create event');
//       }
//     });
//   };

//   const handleDeleteEvent = (id: BaseKey) => {
//     if (id !== undefined) {
//       deleteEvent({
//         resource: 'events',
//         id,
//         meta: {
//           gqlMutation: DELETE_EVENT_MUTATION
//         }
//       }, {
//         onSuccess: () => {
//           refetch();
//           message.success('Event deleted successfully');
//         },
//         onError: (error) => {
//           console.error('Error deleting event:', error);
//           message.error('Failed to delete event');
//         }
//       });
//     } else {
//       console.error("Cannot delete event: ID is undefined");
//     }
//   };

//   if (!userId) {
//     return <div>Loading user information...</div>;
//   }

//   return (
//     <Card
//       style={{ height: '100%' }}
//       headStyle={{ padding: '8px 16px' }}
//       bodyStyle={{ padding: '0 1rem', maxHeight: '400px', overflowY: 'auto' }}
//       title={
//         <div style={{
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//         }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//             <CalendarOutlined />
//             <Text size="sm" style={{ marginLeft: "0.7rem" }}>
//               Upcoming Events
//             </Text>
//           </div>
//           <Button icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
//             Add Event
//           </Button>
//         </div>
//       }
//     >
//       {isLoading ? (
//         <List
//           itemLayout="horizontal"
//           dataSource={Array.from({ length: 5 }).map((_, index) => ({
//             id: index,
//           }))}
//           renderItem={() => <UpcomingEventsSkeleton />}
//         />
//       ) : (
//         <List
//           itemLayout='horizontal'
//           dataSource={data?.data || []}
//           renderItem={(item) => {
//             const renderDate = getDate(item.startDate, item.endDate);
//             return (
//               <List.Item
//                 actions={[
//                   <Popconfirm
//                     title="Are you sure to delete this event?"
//                     onConfirm={() => item.id !== undefined ? handleDeleteEvent(item.id) : undefined}
//                     okText="Yes"
//                     cancelText="No"
//                   >
//                     <DeleteOutlined style={{ color: 'red' }} />
//                   </Popconfirm>
//                 ]}
//               >
//                 <List.Item.Meta
//                   avatar={<Badge color={item.color} />}
//                   title={<Text size="xs">{renderDate}</Text>}
//                   description={
//                     <Text ellipsis={{ tooltip: true }} strong>
//                       {item.title}
//                     </Text>
//                   }
//                 />
//               </List.Item>
//             )
//           }}
//         />
//       )}

//       {!isLoading && data?.data.length === 0 && (
//         <span
//           style={{
//             display: 'flex',
//             justifyContent: 'center',
//             alignItems: 'center',
//             height: '220px'
//           }}
//         >
//           No upcoming events
//         </span>
//       )}

//       <Modal
//         title="Add New Event"
//         open={isModalVisible}
//         onCancel={() => setIsModalVisible(false)}
//         footer={null}
//       >
//         <Form form={form} onFinish={handleAddEvent}>
//           <Form.Item
//             name="title"
//             rules={[{ required: true, message: 'Please input the event title!' }]}
//           >
//             <Input placeholder="Event Title" />
//           </Form.Item>
//           <Form.Item
//             name="dateRange"
//             rules={[{ required: true, message: 'Please select the event date range!' }]}
//           >
//             <RangePicker 
//               showTime={{ format: 'HH:mm' }} 
//               format="YYYY-MM-DD HH:mm"
//             />
//           </Form.Item>
//           <Form.Item>
//             <Button type="primary" htmlType="submit">
//               Add Event
//             </Button>
//           </Form.Item>
//         </Form>
//       </Modal>
//     </Card>
//   )
// }

// export default UpcomingEvents
import React, { useState, useEffect } from 'react';
import { Badge, Card, List, Button, Modal, Form, Input, DatePicker, Popconfirm, message } from 'antd';
import { CalendarOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Text } from '../text';
import UpcomingEventsSkeleton from '../skeleton/upcoming-events';
import dayjs, { Dayjs } from 'dayjs';
import api from '@/api';
import { AxiosError } from 'axios';

const { RangePicker } = DatePicker;

interface Event {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  color: string;
  description?: string;
}

interface EventFormValues {
  title: string;
  dateRange: [Dayjs, Dayjs];
}

const getRandomColor = (): string => {
  return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
};

const getDate = (startDate: string, endDate: string): string => {
  const start = dayjs(startDate).format("MMM DD, YYYY - HH:mm");
  const end = dayjs(endDate).format("MMM DD, YYYY - HH:mm");
  return `${start} - ${end}`;
};

export const UpcomingEvents: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm<EventFormValues>();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchEvents = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await api.get<Event[]>('/events');
      setEvents(response.data);
    } catch (error) {
      if (api.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error('Error fetching events:', axiosError.response?.data || axiosError.message);
        message.error(`Failed to fetch events: ${axiosError.response?.data?.detail || axiosError.message}`);
      } else {
        console.error('Error fetching events:', error);
        message.error('An unexpected error occurred while fetching events');
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = async (values: EventFormValues): Promise<void> => {
    const newEvent = {
      title: values.title,
      startDate: values.dateRange[0].toISOString(),
      endDate: values.dateRange[1].toISOString(),
      color: getRandomColor(),
      description: values.title,
    };

    try {
      const response = await api.post<Event>('events/', newEvent);  // Note the trailing slash
      console.log('Event creation response:', response.data);
      fetchEvents();
      setIsModalVisible(false);
      form.resetFields();
      message.success('Event created successfully');
    } catch (error) {
      if (api.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error('Error creating event:', axiosError.response?.data || axiosError.message);
        message.error(`Failed to create event: ${axiosError.response?.data?.detail || axiosError.message}`);
      } else {
        console.error('Error creating event:', error);
        message.error('An unexpected error occurred while creating the event');
      }
    }
  };


  const handleDeleteEvent = async (id: string): Promise<void> => {
    try {
      await api.delete(`/events/${id}`);
      fetchEvents();
      message.success('Event deleted successfully');
    } catch (error) {
      if (api.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error('Error deleting event:', axiosError.response?.data || axiosError.message);
        message.error(`Failed to delete event: ${axiosError.response?.data?.detail || axiosError.message}`);
      } else {
        console.error('Error deleting event:', error);
        message.error('An unexpected error occurred while deleting the event');
      }
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
            id: index.toString(),
          }))}
          renderItem={() => <UpcomingEventsSkeleton />}
        />
      ) : (
        <List
          itemLayout='horizontal'
          dataSource={events}
          renderItem={(item: Event) => {
            const renderDate = getDate(item.startDate, item.endDate);
            return (
              <List.Item
                actions={[
                  <Popconfirm
                    key="delete"
                    title="Are you sure to delete this event?"
                    onConfirm={() => handleDeleteEvent(item.id)}
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
            );
          }}
        />
      )}

      {!isLoading && events.length === 0 && (
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
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form<EventFormValues> form={form} onFinish={handleAddEvent}>
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
  );
};

export default UpcomingEvents;