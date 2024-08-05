import React, { useState, useCallback } from 'react'
import CustomAvatar from '../custom-avatar'
import { useGetIdentity, useLogout } from '@refinedev/core'
import { Popover, Button } from 'antd'
import { Text } from '../text'
import { SettingOutlined, LogoutOutlined } from '@ant-design/icons'
import { AccountSettings } from "./account-settings";

const CurrentUser = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: user } = useGetIdentity<{id: string, name: string, email: string, avatarUrl?: string}>();
  const { mutate: logout } = useLogout();

  const handleSettingsClick = useCallback(() => {
    setIsOpen(true);
  }, []);

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
          icon={<SettingOutlined />}
          type="text"
          block
          onClick={handleSettingsClick}
        >
          Account Settings
        </Button>
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
    <>
      <Popover
        placement="bottomRight"
        trigger="click"
        overlayInnerStyle={{ padding: 0 }}
        overlayStyle={{ zIndex: 999 }}
        content={content}
      >
        <CustomAvatar
          name={user?.name}
          src={user?.avatarUrl}
          size="default"
          style={{ cursor: 'pointer'}}
        />
      </Popover>
      {user && (
        <AccountSettings
          opened={isOpen}
          setOpened={setIsOpen}
          user={user}
        />
      )}
    </>
  );
};

export default CurrentUser;