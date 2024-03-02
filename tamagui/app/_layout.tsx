import { Platform } from "react-native";

import * as Device from "expo-device";

if (Platform.OS === "web") {
  // https://github.com/tamagui/tamagui/issues/2279
  import("../tamagui-web.css");
}

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { SplashScreen, Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { TamaguiProvider, Text, View } from "tamagui";

import { tamaguiConfig } from "../tamagui.config";
import { useFonts } from "expo-font";
import { useEffect, useRef, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

import Location from "expo-location";
import {
  BACKGROUND_LOCATION_TRACKER,
  LOCATION_UPDATE,
  locationEmitter,
} from "../tasks";

import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>("");
  const [notification, setNotification] = useState<any>();

  const [notificationPermission, setNotificationPermission] = useState<any>();

  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    registerForPushNotificationsAsync(setNotificationPermission).then((token) =>
      setExpoPushToken(token)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const [interLoaded, interError] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  useEffect(() => {
    if (interLoaded || interError) {
      // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
      SplashScreen.hideAsync();
    }
  }, [interLoaded, interError]);

  if (!interLoaded && !interError) {
    return null;
  }

  if (notificationPermission && notificationPermission !== "granted") {
    // Force the user to enable notifications
    return (
      <View>
        <Text>Please enable notifications</Text>
      </View>
    );
  }

  return <RootLayoutNav />;
}

const queryClient = new QueryClient();

TaskManager.defineTask(
  BACKGROUND_LOCATION_TRACKER,
  async ({
    data,
    error,
  }: {
    data: {
      locations: Location.LocationObject[];
    };
    error: any;
  }) => {
    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      const { locations } = data;
      console.log(
        "backgroundLocationTracker received new locations: ",
        locations
      );

      // const [location] = locations;
      const locationsLength = locations.length;

      const newRouteCoordinates = [];
      // const totalNewDistance = 0.0;

      for (let i = 0; i < locationsLength; i++) {
        const { latitude, longitude } = locations[i].coords;
        const tempCoords = {
          latitude,
          longitude,
        };
        newRouteCoordinates.push(tempCoords);
        // totalNewDistance += GLOBAL.screen1.calcDistance(newRouteCoordinates[i], newRouteCoordinates[i - 1])
      }

      console.log(
        "backgroundLocationTracker: latitude ",
        locations[locationsLength - 1].coords.latitude,
        ", longitude: ",
        locations[locationsLength - 1].coords.longitude,
        ", routeCoordinates: ",
        newRouteCoordinates,
        ", prevLatLng: ",
        newRouteCoordinates[locationsLength - 1]
      );
      let locationData = { newRouteCoordinates };
      locationEmitter.emit(LOCATION_UPDATE, locationData);
    }
  }
);

// TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
//   try {
//     const location = await Location.getCurrentPositionAsync();
//     // send the location
//     await userApiLocation({
//       latitude: location.coords.latitude,
//       longitude: location.coords.longitude,
//     });
//     console.log("get location");
//   } catch (e) {
//     console.log("get location failed");
//     console.log(e);
//   }
//   // Be sure to return the successful result type!
//   return BackgroundFetch.BackgroundFetchResult.NewData;
// });

async function registerBackgroundFetchAsync() {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_LOCATION_TRACKER, {
    minimumInterval: 15, // 2 minutes
    stopOnTerminate: false, // android only,
    startOnBoot: true, // android only
  });
}

function RootLayoutNav() {
  // const colorScheme = useColorScheme();
  const colorScheme = "light";

  const [isRegistered, setIsRegistered] = useState(false);
  useEffect(() => {
    registerBackgroundFetchAsync();
    checkStatusAsync();
  }, []);
  const checkStatusAsync = async () => {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_LOCATION_TRACKER
    );
    console.log("nooooo", isRegistered);
    setIsRegistered(isRegistered);
  };

  console.log(isRegistered, "status");

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme as any}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen
              name="(auth)/register"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          </Stack>
        </ThemeProvider>
      </TamaguiProvider>
    </QueryClientProvider>
  );
}

// Notifications
async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "You've got mail! 📬",
      body: "Here is the notification body",
      data: { data: "goes here" },
    },
    trigger: { seconds: 2 },
  });
}

async function registerForPushNotificationsAsync(
  setNotificationPermission: any
) {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }

    setNotificationPermission(finalStatus);
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: "08078ce8-1040-41d0-8f40-4b58a5f14a8f",
      })
    ).data;
    console.log(token);
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return token;
}
