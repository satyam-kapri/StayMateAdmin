import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Tag,
  Space,
  Popconfirm,
  message,
  Switch,
  Row,
  Col,
  Tooltip,
  Alert,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { adminAPI } from "../services/admin";

const LocationsManagement = () => {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("create");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Fetch locations
  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllLocations();
      if (response.success) {
        setLocations(response.locations || []);
        setFilteredLocations(response.locations || []);
      } else {
        message.error(response.message || "Failed to fetch locations");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      message.error("Failed to fetch locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Search locations
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredLocations(locations);
    } else {
      const filtered = locations.filter((location) =>
        location.name.toLowerCase().includes(searchText.toLowerCase()),
      );
      setFilteredLocations(filtered);
    }
  }, [searchText, locations]);

  // Open create modal
  const handleCreate = () => {
    setModalType("create");
    setSelectedLocation(null);
    form.resetFields();
    form.setFieldsValue({
      isActive: true,
    });
    setModalVisible(true);
  };

  // Open edit modal
  const handleEdit = (location) => {
    setModalType("edit");
    setSelectedLocation(location);

    form.setFieldsValue({
      name: location.name,
      isActive: location.isActive,
    });

    setModalVisible(true);
  };

  // Handle form submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!values.name.trim()) {
        message.error("Please enter a location name");
        return;
      }

      setIsSubmitting(true);

      let response;
      if (modalType === "create") {
        response = await adminAPI.createLocation(values);
        if (response.success) {
          message.success("Location created successfully");
        }
      } else {
        response = await adminAPI.updateLocation(selectedLocation.id, values);
        if (response.success) {
          message.success("Location updated successfully");
        }
      }

      if (response.success) {
        setModalVisible(false);
        fetchLocations();
      } else {
        message.error(response.message || "Operation failed");
      }
    } catch (error) {
      console.error("Form error:", error);
      if (error.errorFields) {
        message.error("Please fill all required fields");
      } else {
        message.error("Failed to save location");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (locationId) => {
    try {
      // First check if location is being used
      const checkResponse = await adminAPI.checkLocationUsage(locationId);

      if (checkResponse.success && checkResponse.isInUse) {
        Modal.warning({
          title: "Location in Use",
          content: (
            <div>
              <p>
                This location is currently being used by{" "}
                {checkResponse.userCount} profile(s).
              </p>
              <p>
                If you delete it, these profiles will lose this location from
                their preferences.
              </p>
              <p>Are you sure you want to proceed?</p>
            </div>
          ),
          okText: "Yes, Delete Anyway",
          cancelText: "Cancel",
          onOk: async () => {
            await performDelete(locationId);
          },
          okButtonProps: { danger: true },
        });
      } else {
        await performDelete(locationId);
      }
    } catch (error) {
      message.error("Failed to delete location");
    }
  };

  const performDelete = async (locationId) => {
    try {
      const response = await adminAPI.deleteLocation(locationId);
      if (response.success) {
        message.success("Location deleted successfully");
        fetchLocations();
      } else {
        message.error(response.message || "Failed to delete location");
      }
    } catch (error) {
      message.error("Failed to delete location");
    }
  };

  // Toggle location active status
  const toggleActive = async (locationId, currentStatus) => {
    try {
      const response = await adminAPI.updateLocation(locationId, {
        isActive: !currentStatus,
      });

      if (response.success) {
        message.success(
          `Location ${!currentStatus ? "activated" : "deactivated"} successfully`,
        );
        fetchLocations();
      } else {
        message.error(response.message || "Failed to update location");
      }
    } catch (error) {
      message.error("Failed to update location");
    }
  };

  // Columns definition
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (id) => (
        <Tooltip title={id}>
          <span style={{ fontFamily: "monospace", fontSize: "12px" }}>
            {id.substring(0, 8)}...
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 200,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name) => <div style={{ fontWeight: 500 }}>{name}</div>,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      filters: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
      render: (isActive) => (
        <Tag
          color={isActive ? "green" : "red"}
          icon={isActive ? <CheckOutlined /> : <CloseOutlined />}
        >
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (createdAt) => {
        if (!createdAt) return "-";
        const date = new Date(createdAt);
        return date.toLocaleDateString();
      },
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 120,
      render: (updatedAt) => {
        if (!updatedAt) return "-";
        const date = new Date(updatedAt);
        return date.toLocaleDateString();
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Edit"
          />
          <Button
            type="link"
            danger={record.isActive}
            icon={record.isActive ? <CloseOutlined /> : <CheckOutlined />}
            onClick={() => toggleActive(record.id, record.isActive)}
            title={record.isActive ? "Deactivate" : "Activate"}
          />
          <Popconfirm
            title="Are you sure to delete this location?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              title="Delete"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="Locations Management"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Add Location
          </Button>
        }
      >
        {/* Search Bar */}
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search locations by name..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          {searchText && (
            <span style={{ marginLeft: 8, color: "#999", fontSize: 12 }}>
              Found {filteredLocations.length} location(s)
            </span>
          )}
        </div>

        {/* Stats Summary */}
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Card size="small">
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: "bold" }}>
                    {locations.length}
                  </div>
                  <div style={{ fontSize: 12, color: "#999" }}>
                    Total Locations
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#52c41a",
                    }}
                  >
                    {locations.filter((l) => l.isActive).length}
                  </div>
                  <div style={{ fontSize: 12, color: "#999" }}>Active</div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#ff4d4f",
                    }}
                  >
                    {locations.filter((l) => !l.isActive).length}
                  </div>
                  <div style={{ fontSize: 12, color: "#999" }}>Inactive</div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Active/Inactive Note */}
        <Alert
          message="Note"
          description="Inactive locations will not be shown to users when selecting preferred areas, but existing profiles with these locations will keep them."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        {/* Locations Table */}
        {filteredLocations.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredLocations}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Total ${total} locations`,
            }}
            scroll={{ x: 1000 }}
            size="middle"
          />
        ) : (
          <div style={{ textAlign: "center", padding: 40 }}>
            {searchText ? (
              <>
                <p style={{ color: "#999" }}>
                  No locations found matching "{searchText}"
                </p>
                <Button type="link" onClick={() => setSearchText("")}>
                  Clear search
                </Button>
              </>
            ) : (
              <>
                <p style={{ color: "#999" }}>
                  No locations found. Create your first location!
                </p>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                >
                  Add Location
                </Button>
              </>
            )}
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={modalType === "create" ? "Create New Location" : "Edit Location"}
        open={modalVisible}
        onCancel={() => {
          if (!isSubmitting) {
            setModalVisible(false);
          }
        }}
        onOk={handleSubmit}
        width={500}
        okText={modalType === "create" ? "Create" : "Update"}
        cancelText="Cancel"
        confirmLoading={isSubmitting}
        maskClosable={!isSubmitting}
        closable={!isSubmitting}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            isActive: true,
          }}
        >
          <Form.Item
            name="name"
            label="Location Name"
            rules={[
              { required: true, message: "Please enter location name" },
              {
                min: 2,
                message: "Location name must be at least 2 characters",
              },
              {
                max: 100,
                message: "Location name must not exceed 100 characters",
              },
            ]}
          >
            <Input
              placeholder="Enter location name (e.g., Delhi, Gurugram)"
              disabled={isSubmitting}
              autoFocus
            />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Status"
            valuePropName="checked"
            tooltip="Active locations are shown to users, inactive locations are hidden but kept for existing profiles"
          >
            <Switch
              checkedChildren="Active"
              unCheckedChildren="Inactive"
              disabled={isSubmitting}
            />
          </Form.Item>

          {modalType === "edit" && (
            <Alert
              message="Editing Note"
              description="Changing the location name will update it for all existing profiles that have selected this location."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default LocationsManagement;
