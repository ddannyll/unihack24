import { useCallback, useEffect, useState } from "react";
import { H1, H3, Spinner, Switch, Text, View, YStack , Button } from "tamagui";
import { SwitchWithLabel } from "../../components/switchWithLabel";
import {TextInput  , TouchableOpacity, StyleSheet, Dimensions } from 'react-native'; // Add this line if TextInput is not already imported

import * as Location from "expo-location";
import { useMutation , useQueryClient} from "@tanstack/react-query";
import { userApiLocation, selectTagApi } from "../../api/api";
import {
  BACKGROUND_LOCATION_TRACKER,
  LOCATION_UPDATE,
  locationEmitter,
} from "../../tasks";
import React from "react";

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
            latitude: locationData.newRouteCoordinates[0].latitude,
            longitude: locationData.newRouteCoordinates[0].longitude,
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
      
      console.log("turning on")
    } else {
      // unregister background location tracking
      console.log("turning off")
      Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKER);
    }
  }, [isSearching]);


  
  
  const [rectangles, setRectangles] : any= useState([]);

  const startMatchmaking = () =>{
    // let tags = rectangles.map((rectangle:any, index:any) => rectangle.tag);
   }


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
        rectangles={rectangles}
        setRectangles={setRectangles}
      ></SearchingPrompt>
      
    </View>
  );
}

interface SearchingProps {
  isSearching: boolean;
  onSearchToggle: (on: boolean) => void;
  rectangles: any;
  setRectangles:any
} 
function SearchingPrompt({ isSearching, onSearchToggle, rectangles, setRectangles  }: SearchingProps) {
  const [searchTag, setsearchTag] = useState('');
  
  const queryClient = useQueryClient();

  const screenWidth = Dimensions.get('window').width;

  const handleTextChange = (text:any) => {
    setsearchTag(text);
    // Add your custom logic here
  };

  const addRectangle = () => {
    if (searchTag) {
      console.log("HI")
      let userId:any = queryClient.getQueryData(["user"])
      

      console.log(`USER ID = ${userId}`)
      selectTagApi(searchTag,userId );
      setRectangles([...rectangles, searchTag]);
      setsearchTag('');
    }
  };

  

  // const addRectangle = () => {
  //   if (searchTag) {
  //     setRectangles([...rectangles, { color: 'red', size: '50x50' }]); // Add a new rectangle with default properties
  //     setsearchTag(''); // Clear the search bar after adding a rectangle
  //   }
  // };


  const removeRectangle = (index:any) => {
    const updatedRectangles = [...rectangles];
    updatedRectangles.splice(index, 1);
    setRectangles(updatedRectangles);
  };
 
  
  return (
    <YStack paddingTop="$8" gap="$2" alignItems="center">
      <View style={{ flexDirection: 'column', alignItems: 'center', width: screenWidth*0.8 }}>
      <TextInput
        style={{
          height: 40, // Adjust the height as needed
          width: '100%', // Adjust the width as needed
          borderColor: 'gray', // Customize the border color
          borderWidth: 1, // Adjust the border width
          paddingHorizontal: 10, // Adjust padding for text inside the TextInput
          borderRadius: 5, // Adjust for rounded corners
        }}
        onChangeText={(text) => {
          setsearchTag(text); // Update the searchTag state with the new text
          handleTextChange(text); // Call your custom handleTextChange function
        }}
        onSubmitEditing={() => {
          // Call your function here
          // For example:
          addRectangle()
          console.log("ADDING RECT")
        }}
        value={searchTag}
        placeholder="Search for tags"
      /> 
       <View style={{width: '100%'}}>
        {rectangles.map((rectangle:any, index:any) => (
          <View key={index} style={styles.rectangleContainer}>
            <View style={styles.rectangle}>
              <Text>{rectangle}</Text>
              <TouchableOpacity onPress={() => removeRectangle(index)} style={styles.removeButton}>
                <Text style={styles.removeButtonText}>x</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
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
        <Text style={{
          textAlign:"center",
          paddingTop: 100
        }}>
          Turn on your search status to start finding meets!</Text>
      )}
      <SwitchWithLabel
        size="$4"
        label={isSearching ? "Stop Searching" : "Start Searching"}
        onSwitch={ onSearchToggle }
        switched={isSearching}
      ></SwitchWithLabel>
    </YStack>
  );
}


function setsearchTag(text:string){
  console.log(text)
}




const styles = StyleSheet.create({
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  addButton: {
    height: 40,
    width: 40,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
  },
  addButtonText: {
    color: 'white',
    fontSize: 20,
  },
  rectangleContainer: {
    width: '100%',
    alignItems: 'flex-end',
    marginTop: 10,
  },
  rectangle: {
    width: '100%',
    height: 40,
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  removeButton: {
    width: 30,
    height: 30,
    backgroundColor: 'transparent',
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'black',
    fontSize: 20,
    fontWeight: "100"
  },
});
