import { Link, Tabs } from "expo-router";
import { Pressable } from "react-native";
import { Text, Button, View } from "tamagui";
import { AntDesign } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { userApiMe } from "../../api/api";
import { SheetDemo } from "../../components/cookedSheet";
import { useState } from "react";

export default function TabLayout() {
  // fetch the user

  const [openSettings, setOpenSettings] = useState(false);
  const { isPending, error, data } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => userApiMe(),
  });

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "red",
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <AntDesign name="home" size={20} color="black" />
            ),
            headerRight: () => (
              <Link href="/register" asChild>
                <Pressable>
                  <Text>Hello!</Text>
                </Pressable>
              </Link>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => (
              <AntDesign name="user" size={20} color="black" />
            ),
            headerLeft: () => (
              <View paddingLeft="$3">
                <Link href="/(tabs)">
                  <AntDesign name="left" size={24} color="black" />
                </Link>
              </View>
            ),
            headerRight: () => (
              <Button
                onPress={() => {
                  setOpenSettings(true);
                }}
              >
                <Text>Settings</Text>
              </Button>
            ),
          }}
        />
      </Tabs>

      <SheetDemo open={openSettings} setOpen={setOpenSettings} />
    </>
  );
}
