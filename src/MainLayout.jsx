import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Button,
  theme,
  Avatar,
  Dropdown,
  Space,
  Typography,
} from "antd";
import {
  UserOutlined,
  SafetyCertificateOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DownOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    // Get user info from local storage to display in Navbar
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Dropdown menu for the user profile
  const userMenu = {
    items: [
      {
        key: "1",
        label: (
          <div style={{ padding: "4px 0" }}>
            <Text strong>{user?.name || "Admin User"}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {user?.phone || "Admin"}
            </Text>
          </div>
        ),
      },
      { type: "divider" },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Logout",
        danger: true,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <Layout style={{ minHeight: "100vh", minWidth: "100vw" }}>
      {/* SIDEBAR */}
      <Sider trigger={null} collapsible collapsed={collapsed} width={220}>
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 18,
            fontWeight: "bold",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {collapsed ? "SM" : "StayMate Admin"}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ marginTop: 16 }}
          onClick={({ key }) => {
            if (key !== "logout") navigate(key);
          }}
          items={[
            {
              key: "/users",
              icon: <UserOutlined />,
              label: "Users Management",
            },
            {
              key: "/kyc",
              icon: <SafetyCertificateOutlined />,
              label: "KYC Requests",
            },
            {
              key: "/questions",
              icon: <SafetyCertificateOutlined />,
              label: "Questions Management",
            },
          ]}
        />
      </Sider>

      {/* MAIN CONTENT AREA */}
      <Layout>
        {/* NAVBAR (HEADER) */}
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between", // Pushes items to edges
            boxShadow: "0 2px 8px #f0f1f2",
            zIndex: 1,
          }}
        >
          {/* Left: Collapse Button */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: "16px", width: 46, height: 46 }}
          />

          {/* Right: Actions & Profile */}
          <Space size={24}>
            {/* Notification Bell (Visual only for now) */}
            {/* <Button type="text" shape="circle" icon={<BellOutlined />} /> */}

            {/* User Dropdown */}
            <Dropdown menu={userMenu} placement="bottomRight" arrow>
              <Space
                style={{
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: 6,
                  transition: "0.3s",
                }}
                className="user-dropdown-trigger"
              >
                <Avatar
                  style={{ backgroundColor: "#1890ff" }}
                  icon={<UserOutlined />}
                  src={user?.avatar}
                />
                <span style={{ fontWeight: 500 }}>
                  {user?.profile?.name || "Admin"}
                </span>
                <DownOutlined style={{ fontSize: 12, color: "#999" }} />
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* PAGE CONTENT */}
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            width: "80vw",
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflowY: "auto",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
