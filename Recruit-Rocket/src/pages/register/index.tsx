import { AuthPage } from "@refinedev/antd";
import { useRegister } from "@refinedev/core";
import { Typography } from "antd";

const { Title } = Typography;

export const Register = () => {
  const { mutate: register } = useRegister();

  const handleRegister = async (values: any) => {
    const { email, password } = values;
    register({ email, password });
  };

  return (
    <AuthPage
      type="register"
      formProps={{
        onFinish: handleRegister,
      }}
      renderContent={(content: React.ReactNode) => (
        <div>
          <Title level={3} style={{ color: '#1890ff', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px' }}>
            Recruit Rocket
          </Title>
          {content}
        </div>
      )}
    />
  );
};