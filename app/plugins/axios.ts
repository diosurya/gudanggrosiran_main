// plugins/axios.ts
import axios from "axios";

export default defineNuxtPlugin(() => {
  // Base URL tanpa /api
  const baseUrlBE = axios.create({
    // baseURL: "http://127.0.0.1:8000",
    baseURL: "https://be.gudanggrosiran.com",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Base URL dengan /api
  const baseAPi = axios.create({
    // baseURL: "http://127.0.0.1:8000/api",
    baseURL: "https://be.gudanggrosiran.com/api",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return {
    provide: {
      baseUrlBE,
      baseAPi, 
    },
  };
});
