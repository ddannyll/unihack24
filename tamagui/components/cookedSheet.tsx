import { ChevronDown, ChevronUp } from "@tamagui/lucide-icons";
import type { SheetProps } from "@tamagui/sheet";
import { Sheet, useSheet } from "@tamagui/sheet";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Button,
  H1,
  H2,
  Input,
  Paragraph,
  Text,
  XStack,
  YStack,
} from "tamagui";

import AsyncStorage from "@react-native-async-storage/async-storage";

const spModes = ["percent", "constant", "fit", "mixed"] as const;

export const SheetDemo = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const [position, setPosition] = useState(0);
  const [modal, setModal] = useState(true);
  const [innerOpen, setInnerOpen] = useState(false);
  const [snapPointsMode, setSnapPointsMode] =
    useState<(typeof spModes)[number]>("percent");
  const [mixedFitDemo, setMixedFitDemo] = useState(false);

  const isPercent = snapPointsMode === "percent";
  const isConstant = snapPointsMode === "constant";
  const isFit = snapPointsMode === "fit";
  const isMixed = snapPointsMode === "mixed";
  const snapPoints = isPercent
    ? [85, 50, 25]
    : isConstant
    ? [256, 190]
    : isFit
    ? undefined
    : mixedFitDemo
    ? ["fit", 110]
    : ["80%", 256, 190];

  const router = useRouter();

  const queryClient = useQueryClient();

  return (
    <>
      <Sheet
        forceRemoveScrollEnabled={open}
        modal={modal}
        open={open}
        onOpenChange={setOpen}
        snapPoints={snapPoints}
        snapPointsMode={snapPointsMode}
        dismissOnSnapToBottom
        position={position}
        onPositionChange={setPosition}
        zIndex={100_000}
        animation="medium"
      >
        <Sheet.Overlay
          animation="lazy"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Sheet.Handle />
        <Sheet.Frame
          padding="$4"
          justifyContent="center"
          alignItems="center"
          space="$5"
        >
          <Button
            size="$6"
            onPress={() => {
              setOpen(false);

              //   clear everything from react query
              queryClient.clear();
              AsyncStorage.clear();
              router.push("/register");
              console.log("hello");
            }}
          >
            <Text>Logout</Text>
          </Button>
        </Sheet.Frame>
      </Sheet>
    </>
  );
};
