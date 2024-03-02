import { Link, useRouter } from "expo-router"
import { useState } from "react"
import { Button, Form, Input, Label, RadioGroup, Text, View, styled, Spinner } from "tamagui"
import { useMutation } from '@tanstack/react-query';
import DateTimePicker from 'react-native-ui-datepicker';
import dayjs from 'dayjs';
import { KeyboardAvoidingView } from "react-native";

type RegisterUserType = {
    email: string;
    password: string;
    gender: "male" | "female" | ""
};

const registerUser = async ({ email, password, gender }: RegisterUserType) => {
    try {
        // 'https://yourapi.com/user/login' if you're in production, or
        // 'http://localhost:3000/user/login' if you're in development.
        // can do this using env file
        return { userId: "3"}
        const response = await fetch('http://localhost:3000/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, gender }),
        });

        console.log(response)

        if (!response.ok) {
            // If the server response is not ok, throw an error with the response status
            const errorData = await response.json();
            throw new Error(errorData.error || 'Login failed');
        }

        const data = await response.json();
        return data;
    } catch (err) {
        console.error(err);
    }
}

function formatDate(date: any) {
    return date.format("MM/DD/YYYY")
}

export default function Register() {    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [gender, setGender] = useState<"male" | "female" | "">('')
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [date, setDate] = useState(dayjs())

    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter();


    const handleSubmit = async () => {
        const res = await registerUser({ email, password, gender });

        setIsLoading(true)
        setTimeout(() => {
            console.log('waiting...')
            setIsLoading(false)
            router.push('/(tabs)')
        }, 1000)

        // router.push('/(tabs)')
    }

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

                    {/* <Button onPress={() => setShowDatePicker(!showDatePicker)}>
                        <Text>{!showDatePicker ? formatDate(date) : "Close"}</Text>
                    </Button> */}
                    {/* {showDatePicker &&
                    <KeyboardAvoidingView>
                        <View backgroundColor="white" zIndex={999}>
                            <DateTimePicker
                                mode="single"
                                // date={formatDate(date)}
                                onChange={(params) => {
                                    setDate(params.date)
                                    console.log(date)
                                }}
                                date={formatDate(date)}
                            />
                        </View>
                    </KeyboardAvoidingView>
                    } */}

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

                    {/* <View>
                        <View flex={4}></View>
                        <View flex={1}>
                            <Link href="/(auth)/login">
                                <Text>Already have an account? Sign in instead</Text>
                            </Link>
                        </View>
                    </View> */}

                    {/* <View display="flex" justifyContent="center" alignItems="center" position="absolute">
                        <Text>Don't have an account?</Text>
                        <Link href="/forgotPassword">
                            <Text>Register Here</Text>
                        </Link>
                    </View> */}
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


