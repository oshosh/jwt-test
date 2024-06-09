import axios from "axios";
import { getRecoil } from "./RecoilNexus";
import { accessTokenState, setAccessToken } from "./authState";

const api = axios.create({
  baseURL: "http://localhost:3105", // 백엔드 서버 주소
  withCredentials: true, // 쿠키를 자동으로 포함하도록 설정
});

api.interceptors.request.use(
  async (config) => {
    if (config.url?.includes("/user")) return config;
    if (config.url?.includes("/refreshToken")) return config;

    const accessToken = getRecoil(accessTokenState);

    if (accessToken) {
      const { data } = await api.post("/refreshToken");
      setAccessToken(data.data.accessToken);
      localStorage.setItem("accessToken", data.data.accessToken);

      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // AccessToken이 없는 경우에만 들어와야함 (회원 가입 혹은 로그인은 이 로직을 피해야함)
      if (error.response.data.message === "토큰이 없습니다.") {
        try {
          const { data } = await api.post("/refreshToken");
          setAccessToken(data.data.accessToken);
          localStorage.setItem("accessToken", data.data.accessToken);
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${data.data.accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error("Refresh token failed", refreshError);
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
