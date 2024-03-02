import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Button, Form, Input, Text, View } from "tamagui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApiLogin, userApiNotificationToken } from "../../api/api";

import AsyncStorage from "@react-native-async-storage/async-storage";

import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const [buttonEnabled, setButtonEnabled] = useState(true);

  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => {
      return authApiLogin({
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
    onSuccess: async (data, variables, context) => {
      // Boom baby!
      await AsyncStorage.setItem("token", data.token);

      try {
        const token = (
          await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig?.extra?.eas.projectId,
          })
        ).data;
        await userApiNotificationToken({
          token,
        });
      } catch (e) {
        console.log(e);
      }
      //   moreover store the user in tanstack query
      queryClient.setQueryData(["user"], data);

      router.push("/(tabs)");
    },
    onSettled: (data, error, variables, context) => {
      setButtonEnabled(true);
    },
  });

  const handleSubmit = async () => {
    await loginMutation.mutate({
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

          {/* show error */}
          {loginMutation.error && (
            <>
              <Text color={"red"}>Something is wrong </Text>
            </>
          )}

          <View display="flex" justifyContent="center">
            <Link href="/(auth)/forgotPassword">
              <Text>Forgot Password?</Text>
            </Link>
          </View>
        </Form>
      </View>
    </>
  );
}
