import { Link, Tabs } from 'expo-router'
import { Pressable } from 'react-native'
import { Text, Button, View } from 'tamagui'
import Ionicons from '@expo/vector-icons/Ionicons'
import { AntDesign } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'red',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) =>  <AntDesign name="home" size={20} color="black" />,
          headerRight: () => (
            <Link href="/profile" asChild>
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
          title: 'Profile',
          tabBarIcon: ({ color }) =>  <AntDesign name="user" size={20} color="black" />,
          headerLeft: () => (
            <View paddingLeft="$3">
              <Link href="/(tabs)">
                <AntDesign name="left" size={24} color="black"/>
              </Link>
            </View>
          )
        }}
      />
    </Tabs>
  )
}
