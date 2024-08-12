import { AuthBindings } from "@refinedev/core";
import axios from "axios";

export const authProvider: AuthBindings = {
  login: async ({ email, password }) => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/auth/login", { username: email, password }, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      if (response.status === 200) {
        localStorage.setItem("token", response.data.access_token);
        return {
          success: true,
          redirectTo: "/",
        };
      } else {
        return {
          success: false,
          error: {
            name: "LoginError",
            message: "Invalid email or password",
          },
        };
      }
    } catch (error) {
      return {
        success: false,
        error: {
          name: "LoginError",
          message: "An error occurred during login",
        },
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
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  check: async () => {
    const token = localStorage.getItem("token");
    if (token) {
      return {
        authenticated: true,
      };
    }
    return {
      authenticated: false,
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