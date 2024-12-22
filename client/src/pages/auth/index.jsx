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
        const successMessage = data.message || "Registration successful!";
        sessionStorage.setItem(
          "accessToken",
          JSON.stringify(data.data.accessToken)
        );
        setAuth({
          authenticate: true,
          user: data.data.user,
        });
        toast.success(successMessage);
      } else {
        const errorMessage = data.message || "Registration failed.";
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "An error occurred during registration.";
      toast.error(errorMessage);
    }
  }

  async function handleLoginUser(event) {
    event.preventDefault();
    try {
      const data = await loginService(signInFormData);
      console.log(data, "datadatadatadatadata");

      if (data.success) {
        const successMessage = data.message || "Login successful!";
        sessionStorage.setItem(
          "accessToken",
          JSON.stringify(data.data.accessToken)
        );
        setAuth({
          authenticate: true,
          user: data.data.user,
        });
        toast.success(successMessage);
      } else {
        const errorMessage = data.message || "Invalid login credentials.";
        setAuth({
          authenticate: false,
          user: null,
        });
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "An error occurred during login.";
      toast.error(errorMessage);
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
        const successMessage = data.message || "User authenticated!";
        setAuth({
          authenticate: true,
          user: data.data.user,
        });
        setLoading(false);
        toast.success(successMessage);
      } else {
        const errorMessage = data.message || "User is not authenticated.";
        setAuth({
          authenticate: false,
          user: null,
        });
        setLoading(false);
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Failed to verify authentication.";
      toast.error(errorMessage);
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
