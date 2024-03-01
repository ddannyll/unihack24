import { Label, Separator, SizeTokens, Switch, XStack } from "tamagui";

export function SwitchWithLabel(props: {
  size: SizeTokens;
  label: string;
  switched: boolean;
  onSwitch: (on: boolean) => void;
}) {
  return (
    <XStack alignItems="center" gap="$4">
      <Label
        paddingRight="$0"
        minWidth={90}
        justifyContent="flex-end"
        size={props.size}
      >
        {props.label}
      </Label>
      <Separator minHeight={20} vertical />
      <Switch
        size={props.size}
        checked={props.switched}
        onCheckedChange={(checked) => props.onSwitch(checked)}
      >
        <Switch.Thumb animation="quick" />
      </Switch>
    </XStack>
  );
}
