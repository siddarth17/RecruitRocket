import { AuthPage } from "@refinedev/antd";
import { useRegister } from "@refinedev/core";

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
    />
  );
};