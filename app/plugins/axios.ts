import axios from "axios";

export default defineNuxtPlugin(() => {
  const api = axios.create({
    // baseURL: "http://localhost:8000/api",
    baseURL: "https://be.gudanggrosiran.com/api",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return {
    provide: {
      axios: api,
    },
  };
});
