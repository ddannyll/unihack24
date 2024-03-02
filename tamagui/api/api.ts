import axios from "axios";

import AsyncStorage from "@react-native-async-storage/async-storage";

const authenticatedRequest = async (config: any) => {
  //   get the token from tanstack/react-query
  //   fetch the token
  const token = await AsyncStorage.getItem("token");

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
};

const BASE_URL = "http://localhost:3000/";

// ********* AUTH API ********* //

// add token
// Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IjdiMWQyNGI3LWE2YjMtNDUxNi1iYTAxLWFlN2JlNjRjNjhjYSIsImlhdCI6MTcwOTM1NTUxOSwiZXhwIjoxNzA5MzU3MzE5fQ.OLPkH18NrzXABV-Qd-mJvQk38pqVjrSKpHlR_ro_AsQ
export const authApi = axios.create({
  baseURL: BASE_URL,
});

// Functions
export const authApiLogin = async (user: {
  email: string;
  password: string;
}) => {
  const response = await authApi.post<{
    userId: string;
    token: string;
  }>("user/login", user);
  return response.data;
};

export const authApiRegister = async (user: {
  email: string;
  password: string;
  gender: string;
}) => {
  const response = await authApi.post<{
    userId: string;
    token: string;
    gender: string;
  }>("user/register", user);
  return response.data;
};

// ********* MESSAGE API ********* //

export const messageApi = axios.create({
  baseURL: BASE_URL,
});

// inject the token into the request
messageApi.interceptors.request.use(authenticatedRequest);

// ********* User API ********* //

// add token
// Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IjdiMWQyNGI3LWE2YjMtNDUxNi1iYTAxLWFlN2JlNjRjNjhjYSIsImlhdCI6MTcwOTM1NTUxOSwiZXhwIjoxNzA5MzU3MzE5fQ.OLPkH18NrzXABV-Qd-mJvQk38pqVjrSKpHlR_ro_AsQ
export const userApi = axios.create({
  baseURL: BASE_URL,
});

userApi.interceptors.request.use(authenticatedRequest);

// Functions
export const userApiMe = async () => {
  const response = await userApi.get<{
    userId: string;
    token: string;
  }>("user/me");
  return response.data;
};

export const userApiLocation = async ({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) => {
  const response = await userApi.put<{
    userId: string;
    token: string;
  }>("user/location", {
    latitude,
    longitude,
  });
  return response.data;
};

export const userApiNotificationToken = async ({
  token,
}: {
  token: string;
}) => {
  const response = await userApi.put<{
    token: string;
  }>("notification/", {
    notificationToken: token,
  });
  return response.data;
};
