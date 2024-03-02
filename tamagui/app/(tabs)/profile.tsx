import { Text, View, Avatar } from "tamagui"

export default function Profile() {
    return (
        <>
            <View display="flex" alignItems="center" width="100vw">
                {/* <Text fontSize="$10" marginBottom="$5">Profile</Text> */}
                {/* Top Profile Pic Section */}
                {/* If this looks funky on other devices, edit the padding and try to use centering instead */}
                <View backgroundColor="red" width="100%" height="$20" display="flex" alignItems="center" paddingTop="$7">
                    <Avatar circular size="$12">
                        <Avatar.Image src="http://placekitten.com/200/300" />
                        <Avatar.Fallback bc="red" />
                    </Avatar>
                    <View>
                        <Text color="white" fontSize="$7" fontWeight="bold" marginTop="$2">Gojo & Ahri</Text>
                    </View>
                </View>

                {/* Main section */}
                <View marginTop="$-5" backgroundColor="white" borderRadius="$8" paddingTop="$5" paddingLeft="$2" width="100%" alignItems="center" height="100%">
                    {/* Details */}
                    <View flexDirection="column" space="$4" width="$20">
                        <DetailRow label="Email" value="email@gmail.com" />
                        <DetailRow label="Date of Birth" value="01/01/1999" />
                        <DetailRow label="Gender" value="Male" />
                        <DetailRow label="Phone" value="123-456-7890" />
                    </View>
                </View>
            </View>
        </>
    )
}

// Component to render each detail row
type DetailRowProps = {
    label: string,
    value: string
}
function DetailRow({ label, value }: DetailRowProps) {
    return (
      <View flexDirection="row" justifyContent="space-between" alignItems="center" borderBottomColor="black">
        <Text color="$gray" fontWeight="bold">{label}</Text>
        <Text>{value}</Text>
      </View>
    );
  }