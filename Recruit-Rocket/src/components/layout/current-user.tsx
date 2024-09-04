import React from 'react'
import { useGetIdentity, useLogout } from '@refinedev/core'
import { Popover, Button } from 'antd'
import { Text } from '../text'
import { LogoutOutlined } from '@ant-design/icons'

const CurrentUser = () => {
  const { data: user } = useGetIdentity<{id: string, name: string, email: string}>();
  const { mutate: logout } = useLogout();

  const content = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Text strong style={{ padding: '12px 20px'}}>
        {user?.name}
      </Text>
      <div style={{
        borderTop: '1px solid #d9d9d9',
        padding: '4px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <Button
          style={{ textAlign: 'left' }}
          icon={<LogoutOutlined />}
          type="text"
          block
          onClick={() => logout()}
        >
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      placement="bottomRight"
      trigger="click"
      overlayInnerStyle={{ padding: 0 }}
      overlayStyle={{ zIndex: 999 }}
      content={content}
    >
      <Button type="link">{user?.name}</Button>
    </Popover>
  );
};

export default CurrentUser;