import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ConfigProvider } from "antd";
import Users from "./pages/Users";
import KYC from "./pages/KYC";
import Login from "./pages/Login";
import MainLayout from "./MainLayout";
import QuestionsManagement from "./pages/QuestionsManagement";
import LocationsManagement from "./pages/LocationManagement";

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1890ff",
          borderRadius: 6,
        },
      }}
    >
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<MainLayout />}>
            <Route path="/users" element={<Users />} />

            <Route path="/kyc" element={<KYC />} />
            <Route
              path="/questions"
              element={<QuestionsManagement></QuestionsManagement>}
            ></Route>
            <Route
              path="/locations"
              element={<LocationsManagement></LocationsManagement>}
            ></Route>
          </Route>
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
