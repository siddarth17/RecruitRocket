import { AuthBindings } from "@refinedev/core";
import axios from "axios";

export const authProvider: AuthBindings = {
  login: async ({ email, password }) => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/auth/login", 
        { username: email, password }, 
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      
      if (response.status === 200) {
        localStorage.setItem("token", response.data.access_token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
        return {
          success: true,
          redirectTo: "/",
        };
      } else {
        throw new Error("Login failed");
      }
    } catch (error: any) {
      return {
        success: false,
        error: new Error(error.response?.data?.detail || "Invalid email or password"),
      };
    }
  },
  register: async ({ email, password }) => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/auth/signup", { email, password });
      
      if (response.status === 200) {
        return {
          success: true,
          redirectTo: "/login",
        };
      } else {
        return {
          success: false,
          error: {
            name: "RegisterError",
            message: "Registration failed",
          },
        };
      }
    } catch (error) {
      return {
        success: false,
        error: {
          name: "RegisterError",
          message: "An error occurred during registration",
        },
      };
    }
  },
  logout: async () => {
    localStorage.removeItem("token");
    axios.defaults.headers.common['Authorization'] = "";
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  check: async () => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return {
        authenticated: true,
      };
    }
    return {
      authenticated: false,
      error: {
        message: "Check failed",
        name: "Token not found",
      },
      logout: true,
      redirectTo: "/login",
    };
  },
  getIdentity: async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await axios.get("http://127.0.0.1:8000/auth/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          return response.data;
        }
      } catch (error) {
        console.error("Failed to get user identity", error);
      }
    }
    return null;
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
};