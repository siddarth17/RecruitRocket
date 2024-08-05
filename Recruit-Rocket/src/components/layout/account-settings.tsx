import React from "react";
import { Drawer, Button } from "antd";

type Props = {
  opened: boolean;
  setOpened: (opened: boolean) => void;
  user: { id: string; name: string; email: string; avatarUrl?: string };
};

export const AccountSettings: React.FC<Props> = ({ opened, setOpened, user }) => {
  return (
    <Drawer
      title="Account Settings"
      placement="right"
      onClose={() => setOpened(false)}
      open={opened}
    >
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <Button onClick={() => setOpened(false)}>Close</Button>
    </Drawer>
  );
};