import { useState } from "react";
import { H1, H3, Spinner, Switch, Text, View, YStack } from "tamagui";
import { SwitchWithLabel } from "../../components/switchWithLabel";

export default function MainSearchToggleScreen() {
  const [isSearching, setSearching] = useState(false);
  return (
    <View flex={1} alignItems="center" p="$4">
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
