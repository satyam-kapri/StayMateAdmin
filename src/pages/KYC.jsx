import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Image,
  Modal,
  message,
  Input,
  Select,
  Descriptions,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { adminAPI } from "../services/admin";

const { Option } = Select;
const { TextArea } = Input;

const KYC = () => {
  const [kycs, setKycs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    status: "",
  });
  const [selectedKYC, setSelectedKYC] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const columns = [
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      render: (user) => (
        <div>
          <div>{user?.phone}</div>
          <div style={{ fontSize: 12, color: "#666" }}>
            {user?.profile?.name}
          </div>
        </div>
      ),
    },
    {
      title: "ID Type",
      dataIndex: "idType",
      key: "idType",
      render: (type) => <Tag>{type?.toUpperCase()}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        if (status === "VERIFIED") color = "success";
        if (status === "PENDING") color = "processing";
        if (status === "REJECTED") color = "error";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Submitted",
      dataIndex: "submittedAt",
      key: "submittedAt",
      render: (date) =>
        date ? new Date(date).toLocaleString() : "Not submitted",
    },
    {
      title: "Reviewed",
      dataIndex: "reviewedAt",
      key: "reviewedAt",
      render: (date) =>
        date ? new Date(date).toLocaleString() : "Not reviewed",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showKYCDetail(record)}
          />

          <>
            <Button
              type="link"
              icon={<CheckOutlined />}
              style={{ color: "#52c41a" }}
              onClick={() => handleApprove(record.id)}
            />
            <Button
              type="link"
              danger
              icon={<CloseOutlined />}
              onClick={() => showRejectModal(record)}
            />
          </>
        </Space>
      ),
    },
  ];

  const fetchKYCs = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getKYCs({
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
      });

      setKycs(response.data.data);
      setPagination({
        ...pagination,
        total: response.data.pagination.total,
      });
    } catch (error) {
      message.error("Failed to fetch KYC submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKYCs();
  }, [pagination.current, filters]);

  const showKYCDetail = (kyc) => {
    setSelectedKYC(kyc);
    setDetailVisible(true);
  };

  const showRejectModal = (kyc) => {
    setSelectedKYC(kyc);
    setRejectModalVisible(true);
  };

  const handleApprove = async (kycId) => {
    try {
      await adminAPI.approveKYC(kycId);
      message.success("KYC approved successfully");
      fetchKYCs();
    } catch (error) {
      message.error("Failed to approve KYC");
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      message.error("Please provide a rejection reason");
      return;
    }

    try {
      await adminAPI.rejectKYC(selectedKYC.id, rejectReason);
      message.success("KYC rejected successfully");
      setRejectModalVisible(false);
      setRejectReason("");
      fetchKYCs();
    } catch (error) {
      message.error("Failed to reject KYC");
    }
  };

  return (
    <div>
      <Card
        title="KYC Management"
        extra={
          <Select
            placeholder="Filter by status"
            style={{ width: 200 }}
            allowClear
            onChange={(value) => setFilters({ status: value })}
          >
            <Option value="PENDING">PENDING</Option>
            <Option value="VERIFIED">VERIFIED</Option>
            <Option value="REJECTED">REJECTED</Option>
          </Select>
        }
      >
        <Table
          columns={columns}
          dataSource={kycs}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={(newPagination) => setPagination(newPagination)}
        />
      </Card>

      {/* KYC Detail Modal */}
      <Modal
        title="KYC Details"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
      >
        {selectedKYC && (
          <div>
            <Descriptions column={2}>
              <Descriptions.Item label="User">
                {selectedKYC.user?.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Name">
                {selectedKYC.user?.profile?.name}
              </Descriptions.Item>
              <Descriptions.Item label="ID Type">
                {selectedKYC.idType}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag
                  color={
                    selectedKYC.status === "VERIFIED"
                      ? "success"
                      : selectedKYC.status === "PENDING"
                        ? "processing"
                        : "error"
                  }
                >
                  {selectedKYC.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Submitted At">
                {selectedKYC.submittedAt
                  ? new Date(selectedKYC.submittedAt).toLocaleString()
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Reviewed At">
                {selectedKYC.reviewedAt
                  ? new Date(selectedKYC.reviewedAt).toLocaleString()
                  : "N/A"}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 20 }}>
              <h4>Documents</h4>
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <strong>ID Front:</strong>
                  {selectedKYC.idFrontUrl && (
                    <Image
                      width={200}
                      src={selectedKYC.idFrontUrl}
                      style={{ marginLeft: 10 }}
                    />
                  )}
                </div>
                <div>
                  <strong>ID Back:</strong>
                  {selectedKYC.idBackUrl ? (
                    <Image
                      width={200}
                      src={selectedKYC.idBackUrl}
                      style={{ marginLeft: 10 }}
                    />
                  ) : (
                    <span style={{ marginLeft: 10, color: "#999" }}>
                      Not provided
                    </span>
                  )}
                </div>
                <div>
                  <strong>Police Verification:</strong>
                  {selectedKYC.policeVerificationUrl ? (
                    <Image
                      width={200}
                      src={selectedKYC.policeVerificationUrl}
                      style={{ marginLeft: 10 }}
                    />
                  ) : (
                    <span style={{ marginLeft: 10, color: "#999" }}>
                      Not provided
                    </span>
                  )}
                </div>
                <div>
                  <strong>Selfie:</strong>
                  {selectedKYC.selfieUrl && (
                    <Image
                      width={200}
                      src={selectedKYC.selfieUrl}
                      style={{ marginLeft: 10 }}
                    />
                  )}
                </div>
              </Space>
            </div>

            {selectedKYC.rejectionReason && (
              <div style={{ marginTop: 20 }}>
                <h4>Rejection Reason</h4>
                <p>{selectedKYC.rejectionReason}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Reject KYC"
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectReason("");
        }}
      >
        <TextArea
          rows={4}
          placeholder="Enter rejection reason..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default KYC;
