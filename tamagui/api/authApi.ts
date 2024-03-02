import axios from "axios";
import { GenericResponse } from "./types";
const BASE_URL = "http://localhost:3000/";

export const authApi = axios.create({
  baseURL: BASE_URL,
});

// ********* AUTH API ********* //
export const signUpUserFn = async (user: {
  email: string;
  password: string;
}) => {
  const response = await authApi.post<GenericResponse>("user/login", user);
  return response.data;
};
