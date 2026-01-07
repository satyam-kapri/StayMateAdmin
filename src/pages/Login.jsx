import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Layout,
  message,
  Space,
  Alert,
} from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import { adminAPI } from "../services/admin";

const { Title, Text } = Typography;
const { Content } = Layout;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/users");
    }
  }, []);
  const onFinish = async (values) => {
    setLoading(true);
    setError("");

    try {
      const response = await adminAPI.login(values.phone);
      const token = response.data.sessionToken;

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        message.success("Login successful!");
        navigate("/users");
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMsg =
        err.response?.data?.error ||
        "Login failed. Please check your credentials.";
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", minWidth: "100vw" }}>
      <Content
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #1890ff 0%, #7dc0ff 100%)", // Professional Blue/Dark gradient
          padding: "20px",
        }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: 400,
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
          bodyStyle={{ padding: "40px 30px" }}
        >
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            {/* You can replace this icon with your Logo */}
            <div
              style={{
                background: "#e6f7ff",
                width: 60,
                height: 60,
                borderRadius: "50%",
                margin: "0 auto 15px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LockOutlined style={{ fontSize: 28, color: "#1890ff" }} />
            </div>
            <Title level={3} style={{ marginBottom: 5 }}>
              Welcome Back
            </Title>
            <Text type="secondary">
              Enter your phone number to access the dashboard
            </Text>
          </div>

          {error && (
            <Alert
              message="Authentication Error"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError("")}
              style={{ marginBottom: 24 }}
            />
          )}

          <Form
            name="login_form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="phone"
              rules={[
                { required: true, message: "Please input your phone number!" },
                {
                  pattern: /^[0-9]+$/,
                  message: "Please enter a valid phone number",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                placeholder="Phone Number"
              />
            </Form.Item>

            {/* If you add a password field later, uncomment this:
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your Password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Password"
              />
            </Form.Item> 
            */}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                icon={<LoginOutlined />}
                style={{ height: 45, fontWeight: 600 }}
              >
                Log In
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: "center", marginTop: 10 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Protected by StayMate Secure Auth
            </Text>
          </div>
        </Card>
      </Content>
    </Layout>
  );
}
