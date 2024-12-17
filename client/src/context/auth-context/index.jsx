import { Skeleton } from "@/components/ui/skeleton";
import { initialSignInFormData, initialSignUpFormData } from "@/config";
import { checkAuthService, loginService, registerService } from "@/services";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [signInFormData, setSignInFormData] = useState(initialSignInFormData);
  const [signUpFormData, setSignUpFormData] = useState(initialSignUpFormData);
  const [auth, setAuth] = useState({
    authenticate: false,
    user: null,
  });
  const [loading, setLoading] = useState(true);

  async function handleRegisterUser(event) {
    event.preventDefault();
    try {
      const data = await registerService(signUpFormData);
      if (data.success) {
        toast.success(data.message || "Registration successful!");
      } else {
        toast.error(data.message || "Registration failed.");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "An error occurred during registration."
      );
    }
  }

  async function handleLoginUser(event) {
    event.preventDefault();
    try {
      const data = await loginService(signInFormData);
      console.log(data, "datadatadatadatadata");

      if (data.success) {
        sessionStorage.setItem(
          "accessToken",
          JSON.stringify(data.data.accessToken)
        );
        setAuth({
          authenticate: true,
          user: data.data.user,
        });
        toast.success(data.message || "Login successful!");
      } else {
        setAuth({
          authenticate: false,
          user: null,
        });
        toast.error(data.message || "Invalid login credentials.");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "An error occurred during login."
      );
      setAuth({
        authenticate: false,
        user: null,
      });
    }
  }

  async function checkAuthUser() {
    try {
      const data = await checkAuthService();
      if (data.success) {
        setAuth({
          authenticate: true,
          user: data.data.user,
        });
        setLoading(false);
        toast.success(data.message || "User authenticated!");
      } else {
        setAuth({
          authenticate: false,
          user: null,
        });
        setLoading(false);
        toast.error(data.message || "User is not authenticated.");
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Failed to verify authentication."
      );
      setAuth({
        authenticate: false,
        user: null,
      });
      setLoading(false);
    }
  }

  function resetCredentials() {
    setAuth({
      authenticate: false,
      user: null,
    });
    toast.success("User credentials reset.");
  }

  useEffect(() => {
    checkAuthUser();
  }, []);

  console.log(auth, "gf");

  return (
    <AuthContext.Provider
      value={{
        signInFormData,
        setSignInFormData,
        signUpFormData,
        setSignUpFormData,
        handleRegisterUser,
        handleLoginUser,
        auth,
        resetCredentials,
      }}
    >
      {loading ? <Skeleton /> : children}
    </AuthContext.Provider>
  );
}
