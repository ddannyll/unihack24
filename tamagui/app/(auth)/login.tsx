import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Button, Form, Input, Label, Text, View, styled } from "tamagui";
import { useMutation, useQuery } from "@tanstack/react-query";
import { signUpUserFn } from "../../api/authApi";

type LoginCredentials = {
  email: string;
  password: string;
};

const loginUser = async ({ email, password }: LoginCredentials) => {
  try {
    // 'https://yourapi.com/user/login' if you're in production, or
    // 'http://localhost:3000/user/login' if you're in development.
    // can do this using env file
    // return { userId: "3"}

    // const {
    //   mutate: loginUser,
    //   isLoading,
    //   isError,
    //   error,
    //   isSuccess,
    // } = useMutation({}
    //   (userData: { email: string; password: string }) => signUpUserFn(userData),
    //   {
    //     onSuccess: () => {
    //       query.refetch();
    //     },
    //   }
    // );

    // const response = await fetch('http://localhost:3000/user/login', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ email, password }),
    // });

    // console.log(response);

    // if (!response.ok) {
    //   // If the server response is not ok, throw an error with the response status
    //   const errorData = await response.json();
    //   throw new Error(errorData.error || "Login failed");
    // }

    // const data = await response.json();
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const [buttonEnabled, setButtonEnabled] = useState(true);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => {
      return signUpUserFn({
        email,
        password,
      });
    },
    onMutate: (variables) => {
      setButtonEnabled(false);
    },

    onError: (error, variables, context) => {
      //   Do some random shit here
      return;
    },
    onSuccess: (data, variables, context) => {
      // Boom baby!
      router.push("/(tabs)");
    },
    onSettled: (data, error, variables, context) => {
      setButtonEnabled(true);
    },
  });

  const handleSubmit = async () => {
    const res = await loginMutation.mutate({
      email: email,
      password: password,
    });
  };

  return (
    <>
      <View display="flex" justifyContent="center" alignItems="center" flex={1}>
        <View></View>

        <Form onSubmit={handleSubmit} alignItems="center" gap="$2">
          <Text fontSize="$9">SIGN IN</Text>

          <Input
            id="email-input"
            keyboardType="email-address"
            placeholder="Email address"
            width="$20"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            id="password-input"
            placeholder="Password"
            width="$20"
            value={password}
            onChangeText={setPassword}
          />

          <Button
            disabled={!buttonEnabled}
            backgroundColor="#0070f0"
            color="white"
            size="$3"
            width="$20"
            onPress={handleSubmit}
          >
            Continue
          </Button>

          <View display="flex" justifyContent="center">
            <Link href="/(auth)/forgotPassword">
              <Text>Forgot Password?</Text>
            </Link>
          </View>

          {/* <View display="flex" justifyContent="center" alignItems="center" position="absolute">
                        <Text>Don't have an account?</Text>
                        <Link href="/forgotPassword">
                            <Text>Register Here</Text>
                        </Link>
                    </View> */}
        </Form>
      </View>
    </>
  );
}
