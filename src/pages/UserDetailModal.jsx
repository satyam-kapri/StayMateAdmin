import React from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Image,
  Tabs,
  Typography,
  Divider,
  Space,
  Empty,
  Badge,
} from "antd";
import {
  UserOutlined,
  IdcardOutlined,
  PictureOutlined,
  PhoneOutlined,
  ManOutlined,
  WomanOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;
const { TabPane } = Tabs;

const UserDetailModal = ({ visible, onClose, user }) => {
  // Helper to safely access KYC data (handling if it's an array or object based on Prisma relation)
  const kycData = Array.isArray(user?.kyc) ? user.kyc[0] : user?.kyc;
  const profile = user?.profile;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumSignificantDigits: 3,
    }).format(amount);
  };

  // Helper for Status Tags
  const renderStatusTag = (status) => {
    let color = "default";
    if (status === "VERIFIED") color = "success";
    if (status === "PENDING") color = "warning";
    if (status === "REJECTED" || status === "FLAGGED") color = "error";
    return <Tag color={color}>{status || "N/A"}</Tag>;
  };

  if (!user) return null;

  return (
    <Modal
      title={
        <Space>
          <Text strong style={{ fontSize: 18 }}>
            {profile?.name || "User Details"}
          </Text>
          {renderStatusTag(user.status)}
          {user.premiumStatus === "PREMIUM" && <Tag color="gold">PREMIUM</Tag>}
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
    >
      <Tabs defaultActiveKey="1">
        {/* TAB 1: OVERVIEW & PREFERENCES */}
        <TabPane
          tab={
            <span>
              <UserOutlined /> Profile & Preferences
            </span>
          }
          key="1"
        >
          {/* Basic Info */}
          <Descriptions
            title="Basic Information"
            bordered
            column={2}
            size="small"
          >
            <Descriptions.Item label="User ID">
              <Text copyable>{user.id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              <Space>
                <PhoneOutlined /> {user.phone}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Age/Gender">
              {profile?.age || "N/A"} /{" "}
              {profile?.gender === "MALE" ? (
                <ManOutlined style={{ color: "blue" }} />
              ) : (
                <WomanOutlined style={{ color: "pink" }} />
              )}{" "}
              {profile?.gender}
            </Descriptions.Item>
            <Descriptions.Item label="Occupation">
              {profile?.occupation || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Registered">
              {new Date(user.createdAt).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Last Seen">
              {profile?.lastSeen
                ? new Date(profile.lastSeen).toLocaleString()
                : "N/A"}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          {/* Living Preferences */}
          <Descriptions
            title="Housing Preferences"
            bordered
            column={2}
            size="small"
          >
            <Descriptions.Item label="Budget">
              {profile?.budgetMin && profile?.budgetMax
                ? `${formatCurrency(profile.budgetMin)} - ${formatCurrency(
                    profile.budgetMax,
                  )}`
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Move-in Date">
              {profile?.moveInDate
                ? new Date(profile.moveInDate).toLocaleDateString()
                : "Flexible"}
            </Descriptions.Item>
            <Descriptions.Item label="Preferred Locations" span={2}>
              {profile?.preferredLocations?.length > 0 ? (
                profile.preferredLocations.map((area, idx) => (
                  <Tag key={idx}>
                    {typeof area === "object" ? area.name : area}
                  </Tag>
                ))
              ) : (
                <Text type="secondary">No specific locations listed</Text>
              )}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          {/* Questionnaire Responses */}
          {profile?.questionResponses?.length > 0 && (
            <>
              <Title level={5}>Questionnaire Responses</Title>
              <Descriptions
                bordered
                column={1}
                size="small"
                layout="horizontal"
              >
                {profile.questionResponses.map((response, idx) => (
                  <Descriptions.Item
                    key={idx}
                    label={response.question?.text || "Question"}
                  >
                    {response.response ||
                      response.textResponse ||
                      (response.optionId
                        ? response.question.options.find(
                            (o) => o.id === response.optionId,
                          )?.text
                        : "N/A")}
                  </Descriptions.Item>
                ))}
              </Descriptions>
              <Divider />
            </>
          )}

          {profile?.bio && (
            <div style={{ marginTop: 16 }}>
              <Text strong>Bio:</Text>
              <p
                style={{
                  background: "#f5f5f5",
                  padding: 10,
                  borderRadius: 6,
                  marginTop: 5,
                }}
              >
                {profile.bio}
              </p>
            </div>
          )}
        </TabPane>

        {/* TAB 2: PHOTOS */}
        <TabPane
          tab={
            <span>
              <PictureOutlined /> Photos ({profile?.photos?.length || 0})
            </span>
          }
          key="2"
        >
          {profile?.photos?.length > 0 ? (
            <Image.PreviewGroup>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: 16,
                }}
              >
                {profile.photos.map((photo) => (
                  <div
                    key={photo.id}
                    style={{
                      borderRadius: 8,
                      overflow: "hidden",
                      border: "1px solid #eee",
                    }}
                  >
                    <Image
                      width="100%"
                      height={200}
                      src={photo.url}
                      style={{ objectFit: "cover" }}
                      alt="User Profile"
                    />
                  </div>
                ))}
              </div>
            </Image.PreviewGroup>
          ) : (
            <Empty description="No photos uploaded" />
          )}
        </TabPane>

        {/* TAB 3: KYC DETAILS */}
        <TabPane
          tab={
            <span>
              <IdcardOutlined /> KYC Verification
            </span>
          }
          key="3"
        >
          {kycData ? (
            <Space direction="vertical" style={{ width: "100%" }} size="large">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="KYC Status">
                  {renderStatusTag(kycData.status)}
                </Descriptions.Item>
                <Descriptions.Item label="ID Type">
                  <Tag color="blue">{kycData.idType || "N/A"}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Submitted At">
                  {kycData.submittedAt
                    ? new Date(kycData.submittedAt).toLocaleString()
                    : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Reviewed By">
                  {kycData.reviewedBy || "Pending Review"}
                </Descriptions.Item>
                {kycData.rejectionReason && (
                  <Descriptions.Item
                    label="Rejection Reason"
                    span={2}
                    labelStyle={{ color: "red" }}
                  >
                    <Text type="danger">{kycData.rejectionReason}</Text>
                  </Descriptions.Item>
                )}
              </Descriptions>

              <Title level={5}>Submitted Documents</Title>
              <Image.PreviewGroup>
                <Space size="large" wrap>
                  {kycData.idFrontUrl && (
                    <div style={{ textAlign: "center" }}>
                      <Image
                        width={200}
                        height={150}
                        src={kycData.idFrontUrl}
                        style={{
                          objectFit: "contain",
                          border: "1px solid #ddd",
                        }}
                      />
                      <div style={{ marginTop: 8 }}>
                        <Text type="secondary">ID Front</Text>
                      </div>
                    </div>
                  )}
                  {kycData.idBackUrl && (
                    <div style={{ textAlign: "center" }}>
                      <Image
                        width={200}
                        height={150}
                        src={kycData.idBackUrl}
                        style={{
                          objectFit: "contain",
                          border: "1px solid #ddd",
                        }}
                      />
                      <div style={{ marginTop: 8 }}>
                        <Text type="secondary">ID Back</Text>
                      </div>
                    </div>
                  )}
                  {kycData.policeVerificationUrl && (
                    <div style={{ textAlign: "center" }}>
                      <Image
                        width={200}
                        height={150}
                        src={kycData.policeVerificationUrl}
                        style={{
                          objectFit: "contain",
                          border: "1px solid #ddd",
                        }}
                      />
                      <div style={{ marginTop: 8 }}>
                        <Text type="secondary">Police Verification</Text>
                      </div>
                    </div>
                  )}
                  {kycData.selfieUrl && (
                    <div style={{ textAlign: "center" }}>
                      <Image
                        width={150}
                        height={150}
                        src={kycData.selfieUrl}
                        style={{
                          objectFit: "cover",
                          borderRadius: "50%",
                          border: "1px solid #ddd",
                        }}
                      />
                      <div style={{ marginTop: 8 }}>
                        <Text type="secondary">Selfie</Text>
                      </div>
                    </div>
                  )}
                </Space>
              </Image.PreviewGroup>
            </Space>
          ) : (
            <Empty description="No KYC information found for this user" />
          )}
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default UserDetailModal;
