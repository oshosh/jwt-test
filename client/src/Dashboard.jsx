import React, { useEffect, useState } from "react";
import api from "./interceptor";

function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/showmethemoney");
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {data ? (
        <div>
          <p>금액: {data.data}</p>
        </div>
      ) : (
        <p>로딩 중...</p>
      )}
    </div>
  );
}

export default Dashboard;
