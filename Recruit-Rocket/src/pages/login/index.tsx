import { useLogin, useNavigation } from "@refinedev/core";
import { AuthPage } from "@refinedev/antd";
import { useState } from "react";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutate: login } = useLogin();
  const { push } = useNavigation();

  const handleLogin = (values: any) => {
    login(values, {
      onSuccess: () => {
        push("/");
      },
      onError: (error) => {
        console.error("Login failed:", error);
      },
    });
  };

  return (
    <AuthPage
      type="login"
      formProps={{
        onFinish: handleLogin,
      }}
    />
  );
};