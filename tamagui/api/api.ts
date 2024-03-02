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
export const userApi = axios.create({
  baseURL: BASE_URL,
});

// Functions
export const userApiLogin = async (user: {
  email: string;
  password: string;
}) => {
  const response = await userApi.post<{
    userId: string;
    token: string;
  }>("user/login", user);
  return response.data;
};

// ********* MESSAGE API ********* //

export const messageApi = axios.create({
  baseURL: BASE_URL,
});

// inject the token into the request
messageApi.interceptors.request.use(authenticatedRequest);