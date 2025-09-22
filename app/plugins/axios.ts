// plugins/axios.ts
import axios from "axios";

export default defineNuxtPlugin(() => {
  // const BASE_URL_BE = "http://127.0.0.1:8000";
  const BASE_URL_BE = "https://admin.gudanggrosiran.com";
  const baseUrlBE = axios.create({
    baseURL: BASE_URL_BE,
    headers: { "Content-Type": "application/json" },
  });

  const baseAPi = axios.create({
    baseURL: BASE_URL_BE + "/api",
    headers: { "Content-Type": "application/json" },
  });

  return {
    provide: {
      BASE_URL_BE,
      baseUrlBE,
      baseAPi
    },
  };
});