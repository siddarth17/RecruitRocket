import { useLogin, useNavigation } from "@refinedev/core";
import { AuthPage } from "@refinedev/antd";
import { useState } from "react";
import { Alert, Typography } from "antd";
const { Title } = Typography;

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutateAsync: login } = useLogin();
  const { push } = useNavigation();
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (values: any) => {
    setErrorMessage("");
    try {
      const response = await login(values);
      if (response.success) {
        push("/");
      } else {
        setErrorMessage("Invalid email or password");
      }
    } catch (error: any) {
      console.error("Login error caught:", error);
      setErrorMessage(error?.message || "An error occurred during login");
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <AuthPage
        type="login"
        formProps={{
          onFinish: handleLogin,
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
      {errorMessage && (
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#ff4d4f',
            marginTop: '16px',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
};