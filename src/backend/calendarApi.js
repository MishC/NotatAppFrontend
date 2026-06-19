import { refreshAccessToken } from "./authApi";

const isGuest = () => localStorage.getItem("guest") === "true";