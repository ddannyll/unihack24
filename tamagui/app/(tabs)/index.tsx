import { useCallback, useEffect, useState } from "react";
import { H1, H3, Spinner, Switch, Text, View, YStack } from "tamagui";
import { SwitchWithLabel } from "../../components/switchWithLabel";

import * as Location from "expo-location";
import { useMutation } from "@tanstack/react-query";
import { userApiLocation } from "../../api/api";
import {
  BACKGROUND_LOCATION_TRACKER,
  LOCATION_UPDATE,
  locationEmitter,
} from "../../tasks";

export default function MainSearchToggleScreen() {
  const locationMutation = useMutation({
    mutationFn: ({
      latitude,
      longitude,
    }: {
      latitude: number;
      longitude: number;
    }) => {
      return userApiLocation({
        latitude,
        longitude,
      });
    },
    onMutate: (variables) => {
      // do something here?
    },

    onError: (error, variables, context) => {
      //   Do some random shit here
      return;
    },
    onSuccess: async (data, variables, context) => {
      // do something here?
      console.log("hahaha", data);
    },
    onSettled: (data, error, variables, context) => {},
  });

  // check if user has location on
  const [location, setLocation] = useState<{
    location: Location.LocationObject;
    updatedAt: Date;
  } | null>(null);

  const [permission, setPermission] =
    useState<Location.PermissionStatus | null>(null);

  const locationFetcher = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    setPermission(status);
    if (status !== "granted") {
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation({ location: location, updatedAt: new Date() });

    // start background location tracking

    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKER, {
      accuracy: Location.LocationAccuracy.BestForNavigation,
      timeInterval: 2000,
      distanceInterval: 0,
      deferredUpdatesInterval: 0,
      deferredUpdatesDistance: 0,
      // showsBackgroundLocationIndicator: true,
    });

    locationEmitter.on(LOCATION_UPDATE, (locationData) => {
      console.log(
        "locationEmitter locationUpdate fired! locationData: ",
        locationData
      );
      if (locationData.newRouteCoordinates[0]) {
        setLocation({
          location: {
            timestamp: new Date().getTime(),
            mocked: false,
            coords: {
              latitude: locationData.newRouteCoordinates[0].latitude,
              longitude: locationData.newRouteCoordinates[0].longitude,
              accuracy: 0,
              altitude: 0,
              altitudeAccuracy: 0,
              heading: 0,
              speed: 0,
            },
          },
          updatedAt: new Date(),
        });
      }
    });
  };

  // useCallback location
  const locationFetcherCallback = useCallback(locationFetcher, [
    setLocation,
    setPermission,
  ]);

  // everytime the location changes, we want to update the backend
  useEffect(() => {
    if (location && permission === Location.PermissionStatus.GRANTED) {
      locationMutation.mutate({
        latitude: location.location.coords.latitude,
        longitude: location.location.coords.longitude,
      });
    }
  }, [location, permission]);

  // on render check if location is on
  // if not, show a prompt to turn on location
  const [isSearching, setSearching] = useState(false);

  useEffect(() => {
    if (isSearching) {
      // check if location is on
      locationFetcherCallback();
    } else {
      // unregister background location tracking
      Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKER);
    }
  }, [isSearching]);

  return (
    <View flex={1} alignItems="center" p="$4">
      <View backgroundColor={"$backgroundStrong"} height={100}>
        <Text>locationpermission: {permission}</Text>
      </View>

      <SearchingPrompt
        isSearching={isSearching}
        onSearchToggle={() => {
          setSearching(!isSearching);
        }}
      ></SearchingPrompt>
    </View>
  );
}

interface SearchingProps {
  isSearching: boolean;
  onSearchToggle: (on: boolean) => void;
}
function SearchingPrompt({ isSearching, onSearchToggle }: SearchingProps) {
  return (
    <YStack paddingTop="$8" gap="$2" alignItems="center">
      {isSearching ? (
        <>
          <H3>Searching for a meet!</H3>
          <Text opacity={0.5} fontSize={14} textAlign="center">
            This may take some time. Feel free to turn off your phone, we will
            send a notification when someone is near!
          </Text>
          <Spinner size="large" mt="$3"></Spinner>
        </>
      ) : (
        <Text>Turn on your search status to start finding meets!</Text>
      )}
      <SwitchWithLabel
        size="$4"
        label={isSearching ? "Stop Searching" : "Start Searching"}
        onSwitch={onSearchToggle}
        switched={isSearching}
      ></SwitchWithLabel>
    </YStack>
  );
}
