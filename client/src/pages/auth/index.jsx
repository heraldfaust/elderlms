import CommonForm from "@/components/common-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signInFormControls, signUpFormControls } from "@/config";
import { AuthContext } from "@/context/auth-context";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";

function AuthPage() {
  const [activeTab, setActiveTab] = useState("signin");
  const {
    signInFormData,
    setSignInFormData,
    signUpFormData,
    setSignUpFormData,
    handleRegisterUser,
    handleLoginUser,
  } = useContext(AuthContext);

  // Function to use SpeechSynthesis API
  function speak(message) {
    console.log("New work")
    if (window.FlutterTTS) {
      // Send message to Flutter
      window.FlutterTTS.postMessage(message);
    } else if (window.speechSynthesis) {
      // Fallback for environments that support SpeechSynthesis
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = "en-US";
      synth.speak(utterance);
    } else {
      console.warn("Text-to-Speech is not supported in this environment.");
    }
  }

  function handleTabChange(value) {
    setActiveTab(value);
    speak(`You are about to ${value === "signin" ? "sign in" : "sign up"}.`);
  }

  function handleInputFocus(inputName) {
    const messages = {
      userEmail: "Enter your email address.",
      password: "Enter your password.",
      userName: "Enter your full name.",
    };
    if (messages[inputName]) {
      speak(messages[inputName]);
    }
  }

  function checkIfSignInFormIsValid() {
    return (
      signInFormData &&
      signInFormData.userEmail !== "" &&
      signInFormData.password !== ""
    );
  }

  function checkIfSignUpFormIsValid() {
    return (
      signUpFormData &&
      signUpFormData.userName !== "" &&
      signUpFormData.userEmail !== "" &&
      signUpFormData.password !== ""
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link
          to={"/"}
          className="flex items-center justify-center"
          onClick={() => speak("Navigating to the home page.")}
        >
          <span className="font-extrabold text-xl">SLM</span>
        </Link>
      </header>
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Tabs
          value={activeTab}
          defaultValue="signin"
          onValueChange={handleTabChange}
          className="w-full max-w-md"
        >
          <TabsList className="grid w-full grid-cols-2 bg-black">
            <TabsTrigger
              value="signin"
              className="text-white"
              onClick={() => speak("You selected the 'Sign In' tab.")}
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="text-white"
              onClick={() => speak("You selected the 'Sign Up' tab.")}
            >
              Sign Up
            </TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <Card className="p-6 space-y-4 bg-black dark">
              <CardHeader>
                <CardTitle onClick={() => speak("Sign in to your account.")}>
                  Sign in to your account
                </CardTitle>
                <CardDescription onClick={() => speak("Enter your email and password to access your account.")}>
                  Enter your email and password to access your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <CommonForm
                  formControls={signInFormControls.map((control) => ({
                    ...control,
                    onFocus: () => handleInputFocus(control.name),
                  }))}
                  buttonText={"Sign In"}
                  formData={signInFormData}
                  setFormData={setSignInFormData}
                  isButtonDisabled={!checkIfSignInFormIsValid()}
                  handleSubmit={handleLoginUser}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card className="p-6 space-y-4 bg-black dark">
              <CardHeader>
                <CardTitle onClick={() => speak("Create a new account.")}>
                  Create a new account
                </CardTitle>
                <CardDescription onClick={() => speak("Enter your details to get started.")}>
                  Enter your details to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <CommonForm
                  formControls={signUpFormControls.map((control) => ({
                    ...control,
                    onFocus: () => handleInputFocus(control.name),
                  }))}
                  buttonText={"Sign Up"}
                  formData={signUpFormData}
                  setFormData={setSignUpFormData}
                  isButtonDisabled={!checkIfSignUpFormIsValid()}
                  handleSubmit={handleRegisterUser}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default AuthPage;
