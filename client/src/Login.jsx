import React, { useState } from "react";
import { useSetRecoilState } from "recoil";
import { accessTokenState } from "./authState";
import api from "./interceptor";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const setAccessToken = useSetRecoilState(accessTokenState);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.post("/login", { email, password });
      setAccessToken(data.data.accessToken);
      localStorage.setItem("accessToken", data.data.accessToken);
      alert("로그인 성공");
    } catch (error) {
      console.error("Error during login", error);
      alert("로그인 실패");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
