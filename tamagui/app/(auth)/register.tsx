import { Link, useRouter } from "expo-router"
import { useState } from "react"
import { Button, Form, Input, Label, RadioGroup, Text, View, styled, Spinner } from "tamagui"
import { useMutation, useQueryClient } from '@tanstack/react-query';
import DateTimePicker from 'react-native-ui-datepicker';
import dayjs from 'dayjs';
import { KeyboardAvoidingView } from "react-native";
import { authApiRegister } from "../../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Register() {    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [gender, setGender] = useState<"male" | "female" | "">('')
    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter();

    const [buttonEnabled, setButtonEnabled] = useState(true);
    const queryClient = useQueryClient();

    const registerMutation = useMutation({
        mutationFn: ({ email, password }: { email: string; password: string }) => {
            return authApiRegister({
                email,
                password,
                gender
            });
        },
            onMutate: (variables) => {
            setButtonEnabled(false);
        },

        onError: (error, variables, context) => {
            //   Do some random shit here
            // console.log(error)
            return;
        },
        onSuccess: async (data, variables, context) => {
            // Boom baby!
            await AsyncStorage.setItem("token", data.token);

            console.log("todo-delete-user-data");
            console.log(data);

            //   moreover store the user in tanstack query
            queryClient.setQueryData(["user"], data);

            router.push("/(tabs)");
        },
            onSettled: (data, error, variables, context) => {
            setButtonEnabled(true);
        },
    });

    const handleSubmit = async () => {
        await registerMutation.mutate({
            email: email,
            password: password,
        });
    };

    return (
        <>
            <View display="flex" justifyContent="center" alignItems="center" flex={1}>
                <View>

                </View>

                <Form onSubmit={handleSubmit} alignItems="center" gap="$2">
                    <Text fontSize="$9">REGISTER</Text>

                    <Input 
                        id="register-email-input" 
                        keyboardType="email-address" 
                        placeholder="Email address" 
                        width="$20"
                        value={email}
                        onChangeText={setEmail}
                    />
                    <Input 
                        id="register-password-input" 
                        placeholder="Password" 
                        width="$20"
                        value={password}
                        onChangeText={setPassword}
                    />

                    {/* No clue if this onselectiochagnehsoudlsetreponder thing works or not */}
                    <RadioGroup onSelectionChangeShouldSetResponder={setGender}>
                        <View display="flex" flexDirection="row" gap="$5" justifyContent="space-between" width="$20" padding="$2">
                            <GenderRadioBtn gender="Male"/>
                            <GenderRadioBtn gender="Female"/>
                        </View>
                    </RadioGroup>

                    <Button 
                        backgroundColor="#0070f0" 
                        color="white" 
                        size="$3" 
                        width="$20" 
                        onPress={handleSubmit}
                    >
                        {isLoading ? <Spinner size="small"></Spinner> : "Continue"}
                    </Button>

                    <Link href="/(auth)/login">
                        <Text>Sign in Instead</Text>
                    </Link>
                </Form>
            </View>
        </>
    )
}

type GenderRadioBtnProps = {
    gender: "Male" | "Female" | ""
}
function GenderRadioBtn({ gender }: GenderRadioBtnProps) {
    return (
        <View display="flex" flexDirection="row" justifyContent="space-between" width="$10">
            <Text>{gender}</Text>
            <RadioGroup.Item value={gender} id={'gender-' + gender}>
                <RadioGroup.Indicator />
            </RadioGroup.Item>
        </View>
    )
}


