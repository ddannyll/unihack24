import { Platform } from "react-native";

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
import { TamaguiProvider } from "tamagui";

import { tamaguiConfig } from "../tamagui.config";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

import Location from "expo-location";
import {
  BACKGROUND_LOCATION_TRACKER,
  LOCATION_UPDATE,
  locationEmitter,
} from "../tasks";

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
