import { Text, View, Avatar, Sheet } from "tamagui";
import { userApiMe } from "../../api/api";
import { useQuery } from "@tanstack/react-query";
import { SheetDemo } from "../../components/cookedSheet";
import { useState } from "react";

export default function Profile() {
  // react query fetch shit

  const {
    isPending,
    error,
    data: userData,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => userApiMe(),
  });

  if (!userData || isPending) {
    return <Text>Loading</Text>;
  }

  if (error) {
    return <Text>Error</Text>;
  }

  console.log(userData);

  return (
    <>
      <View display="flex" alignItems="center" width="100vw">
        {/* <Text fontSize="$10" marginBottom="$5">Profile</Text> */}
        {/* Top Profile Pic Section */}
        {/* If this looks funky on other devices, edit the padding and try to use centering instead */}
        <View
          backgroundColor="red"
          width="100%"
          height="$20"
          display="flex"
          alignItems="center"
          paddingTop="$7"
        >
          <Avatar circular size="$12" backgroundColor={"wheat"}>
            <Avatar.Image
              src={
                userData.profilePicture ||
                "https://pbs.twimg.com/profile_images/1559210586373857280/CTjWPZ4c_400x400.jpg"
              }
            />
            <Avatar.Fallback bc="red" />
          </Avatar>
          <View>
            <Text color="white" fontSize="$7" fontWeight="bold" marginTop="$2">
              {userData.bio}
            </Text>
          </View>
        </View>

        {/* Main section */}
        <View
          marginTop="$-5"
          backgroundColor="white"
          borderRadius="$8"
          paddingTop="$5"
          paddingLeft="$2"
          width="100%"
          alignItems="center"
          height="100%"
        >
          {/* Details */}
          <View flexDirection="column" space="$4" width="$20">
            <DetailRow label="Gender" value="Male" />
          </View>
        </View>
      </View>
    </>
  );
}

// Component to render each detail row
type DetailRowProps = {
  label: string;
  value: string;
};
function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      borderBottomColor="black"
    >
      <Text color="$gray" fontWeight="bold">
        {label}
      </Text>
      <Text>{value}</Text>
    </View>
  );
}
