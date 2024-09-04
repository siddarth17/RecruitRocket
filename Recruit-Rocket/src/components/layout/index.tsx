import React from 'react'
import { ThemedLayoutV2 } from "@refinedev/antd";
import Header from "./header"
import { TitleProps } from "@refinedev/core";
import { Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Title } = Typography;

const CustomTitle: React.FC<TitleProps> = ({ collapsed }) => {
  return (
    <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
      <Title
        level={3}
        style={{
          margin: 0,
          padding: collapsed ? "0 16px" : "0 24px",
          fontSize: collapsed ? "8px" : "16px",
          textAlign: "left",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        Recruit Rocket
      </Title>
    </Link>
  );
};

const Layout = ({ children }: React.PropsWithChildren) => {
  return (
    <ThemedLayoutV2
      Header={Header}
      Title={CustomTitle}
    >
      {children}
    </ThemedLayoutV2>
  )
}

export default Layout