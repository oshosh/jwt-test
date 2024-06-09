import { atom } from "recoil";
import { setRecoil } from "./RecoilNexus";

export const accessTokenState = atom({
  key: "accessTokenState",
  default: localStorage.getItem("accessToken") || "",
});

export const setAccessToken = (token) => {
  setRecoil(accessTokenState, token);
};
