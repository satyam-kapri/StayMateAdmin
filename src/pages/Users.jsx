import React, { useState, useEffect } from "react";
import {
  Card,
  Input,
  Select,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  message,
  Popconfirm,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { adminAPI } from "../services/admin";
import UserDetailModal from "./UserDetailModal";

const { Option } = Select;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "",
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const columns = [
    // {
    //   title: "ID",
    //   dataIndex: "id",
    //   key: "id",
    //   width: 200,
    //   ellipsis: true,
    // },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      width: 150, // Added width for better column distribution
    },
    {
      title: "Name",
      dataIndex: ["profile", "name"],
      key: "name",
      width: 150, // Added width
      render: (text) => text || "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120, // Added width
      render: (status) => {
        let color = "default";
        if (status === "VERIFIED") color = "success";
        if (status === "PENDING") color = "warning";
        if (status === "FLAGGED") color = "error";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    // {
    //   title: "Premium",
    //   dataIndex: "premiumStatus",
    //   key: "premiumStatus",
    //   width: 120, // Added width
    //   render: (status) => {
    //     let color = status === "PREMIUM" ? "gold" : "default";
    //     return <Tag color={color}>{status}</Tag>;
    //   },
    // },
    {
      title: "KYC Status",
      dataIndex: ["kyc", "0", "status"],
      key: "kycStatus",
      width: 120, // Added width
      render: (kyc) => {
        if (!kyc?.status) return <Tag>No KYC</Tag>;
        let color = "default";
        if (kyc?.status === "VERIFIED") color = "success";
        if (kyc?.status === "PENDING") color = "processing";
        if (kyc?.status === "REJECTED") color = "error";
        return <Tag color={color}>{kyc?.status}</Tag>;
      },
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150, // Added width
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150, // Added width
      fixed: "right", // Optional: pins actions to the right
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showUserDetail(record)}
          />
          {/* <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          /> */}
          {/* <Popconfirm
            title="Are you sure to delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm> */}
        </Space>
      ),
    },
  ];

  const fetchUsers = async (params = {}) => {
    setLoading(true);
    try {
      const response = await adminAPI.getUsers({
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
        ...params,
      });

      setUsers(response.data.data);
      setPagination({
        ...pagination,
        total: response.data.pagination.total,
      });
    } catch (error) {
      message.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, filters]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const handleSearch = (value) => {
    setFilters({ ...filters, search: value });
    setPagination({ ...pagination, current: 1 });
  };

  const handleStatusFilter = (value) => {
    setFilters({ ...filters, status: value });
    setPagination({ ...pagination, current: 1 });
  };

  const showUserDetail = async (record) => {
    try {
      setLoading(true);
      const res = await adminAPI.getUserById(record.id); // Assuming you have this API method
      setSelectedUser(res.data.data); // Set the FULL data
      setDetailVisible(true);
    } catch (error) {
      message.error("Could not fetch user details");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (user) => {
    Modal.confirm({
      title: "Update User Status",
      content: (
        <Select
          style={{ width: "100%" }}
          defaultValue={user.status}
          onChange={(value) => handleStatusUpdate(user.id, value)}
        >
          <Option value="PENDING">PENDING</Option>
          <Option value="VERIFIED">VERIFIED</Option>
          <Option value="FLAGGED">FLAGGED</Option>
        </Select>
      ),
    });
  };

  const handleStatusUpdate = async (userId, status) => {
    try {
      await adminAPI.updateUserStatus(userId, { status });
      message.success("User status updated");
      fetchUsers();
    } catch (error) {
      message.error("Failed to update user status");
    }
  };

  const handleDelete = async (userId) => {
    try {
      await adminAPI.deleteUser(userId);
      message.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      message.error("Failed to delete user");
    }
  };

  return (
    <div>
      <Card
        title="Users Management"
        extra={
          <Button icon={<ReloadOutlined />} onClick={() => fetchUsers()}>
            Refresh
          </Button>
        }
      >
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search by phone or name"
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            onPressEnter={(e) => handleSearch(e.target.value)}
            allowClear
            onChange={(e) => !e.target.value && handleSearch("")}
          />
          <Select
            placeholder="Filter by status"
            style={{ width: 150 }}
            allowClear
            onChange={handleStatusFilter}
          >
            <Option value="PENDING">PENDING</Option>
            <Option value="VERIFIED">VERIFIED</Option>
            <Option value="FLAGGED">FLAGGED</Option>
          </Select>
          <Select
            placeholder="Filter by premium"
            style={{ width: 150 }}
            allowClear
            onChange={(value) =>
              setFilters({ ...filters, premiumStatus: value })
            }
          >
            <Option value="FREE">FREE</Option>
            <Option value="PREMIUM">PREMIUM</Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          // --- UPDATED SECTION ---
          scroll={{
            x: 1200, // Enables horizontal scroll if content exceeds 1200px
            y: 600, // Fixed Height: Table body will be 600px tall
          }}
          style={{ width: "100%" }} // Explicit width
          // -----------------------
        />
      </Card>

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          visible={detailVisible}
          onClose={() => setDetailVisible(false)}
        />
      )}
    </div>
  );
};

export default Users;
