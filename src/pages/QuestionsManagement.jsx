import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  Popconfirm,
  message,
  Switch,
  InputNumber,
  Collapse,
  Tooltip,
  Row,
  Col,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CopyOutlined,
  UpOutlined,
  DownOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { adminAPI } from "../services/admin";

const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;

const QuestionTypeOptions = [
  { value: "RADIO", label: "Radio Buttons", color: "blue" },
  { value: "MULTI_SELECT", label: "Multi-Select", color: "green" },
  { value: "TEXT", label: "Text Input", color: "orange" },
  { value: "NUMBER", label: "Number Input", color: "purple" },
  { value: "DATE", label: "Date Picker", color: "cyan" },
];

const QuestionsManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("create");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [form] = Form.useForm();
  const [options, setOptions] = useState([{ text: "", value: "", order: 0 }]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch questions and categories
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllQuestions();
      if (response.success) {
        setCategories(response.categories || []);

        const allQuestions = response.categories.flatMap((category) =>
          category.questions.map((q) => ({
            ...q,
            categoryName: category.name,
          })),
        );
        setQuestions(allQuestions);
      } else {
        message.error(response.message || "Failed to fetch questions");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      message.error("Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Open create modal
  const handleCreate = () => {
    setModalType("create");
    setSelectedQuestion(null);
    setOptions([{ text: "", value: "", order: 0 }]);
    form.resetFields();
    form.setFieldsValue({
      required: false,
      weight: 1.0,
      order: 0,
    });
    setModalVisible(true);
  };

  // Open edit modal
  const handleEdit = (question) => {
    setModalType("edit");
    setSelectedQuestion(question);

    // Set form values
    form.setFieldsValue({
      text: question.text,
      type: question.type,
      categoryName: question.categoryName,
      order: question.order,
      required: question.required,
      weight: question.weight,
      placeholder: question.placeholder,
    });

    // Set options if they exist
    if (question.options && question.options.length > 0) {
      setOptions(
        question.options.map((opt, index) => ({
          text: opt.text,
          value: opt.value,
          order: index,
        })),
      );
    } else {
      setOptions([{ text: "", value: "", order: 0 }]);
    }

    setModalVisible(true);
  };

  // Handle option changes
  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    newOptions[index].order = index;
    setOptions(newOptions);
  };

  // Add new option
  const addOption = () => {
    setOptions([...options, { text: "", value: "", order: options.length }]);
  };

  // Remove option
  const removeOption = (index) => {
    if (options.length > 1) {
      const newOptions = options.filter((_, i) => i !== index);
      const reorderedOptions = newOptions.map((opt, idx) => ({
        ...opt,
        order: idx,
      }));
      setOptions(reorderedOptions);
    }
  };

  // Handle form submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Validate options for RADIO and MULTI_SELECT types
      if (
        (values.type === "RADIO" || values.type === "MULTI_SELECT") &&
        (!options ||
          options.length === 0 ||
          options.some((opt) => !opt.text.trim() || !opt.value.trim()))
      ) {
        message.error("Please fill all option fields for this question type");
        return;
      }

      setIsSubmitting(true);

      // Prepare data
      const questionData = {
        ...values,
        options:
          values.type === "RADIO" || values.type === "MULTI_SELECT"
            ? options.filter((opt) => opt.text.trim() && opt.value.trim())
            : [],
        order: values.order || 0,
        required: values.required || false,
        weight: values.weight || 1.0,
      };

      let response;
      if (modalType === "create") {
        response = await adminAPI.createQuestion(questionData);
        message.success("Question created successfully");
      } else {
        response = await adminAPI.updateQuestion(
          selectedQuestion.id,
          questionData,
        );
        message.success("Question updated successfully");
      }

      if (response.success) {
        setModalVisible(false);
        fetchQuestions();
      } else {
        message.error(response.message || "Operation failed");
      }
    } catch (error) {
      console.error("Form error:", error);
      if (error.errorFields) {
        message.error("Please fill all required fields");
      } else {
        message.error("Failed to save question");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (questionId) => {
    try {
      const response = await adminAPI.deleteQuestion(questionId);
      if (response.success) {
        message.success("Question deleted successfully");
        fetchQuestions();
      } else {
        message.error(response.message || "Failed to delete question");
      }
    } catch (error) {
      message.error("Failed to delete question");
    }
  };

  // Handle copy question
  const handleCopy = async (question) => {
    try {
      const copyData = {
        text: question.text + " (Copy)",
        type: question.type,
        categoryName: question.categoryName,
        order: question.order + 1,
        required: question.required,
        weight: question.weight,
        placeholder: question.placeholder,
        options:
          question.options?.map((opt) => ({
            text: opt.text,
            value: opt.value,
          })) || [],
      };

      const response = await adminAPI.createQuestion(copyData);
      if (response.success) {
        message.success("Question copied successfully");
        fetchQuestions();
      } else {
        message.error(response.message || "Failed to copy question");
      }
    } catch (error) {
      message.error("Failed to copy question");
    }
  };

  // Toggle category expansion
  const toggleCategory = (categoryName) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  // Reorder question
  const handleReorder = async (questionId, direction) => {
    try {
      const response = await adminAPI.reorderQuestion(questionId, direction);
      if (response.success) {
        message.success("Question order updated");
        fetchQuestions();
      } else {
        message.error(response.message || "Failed to reorder question");
      }
    } catch (error) {
      message.error("Failed to reorder question");
    }
  };

  // Group questions by category
  const groupedQuestions = questions.reduce((acc, question) => {
    if (!acc[question.categoryName]) {
      acc[question.categoryName] = [];
    }
    acc[question.categoryName].push(question);
    return acc;
  }, {});

  // Reset options when question type changes
  const handleTypeChange = (value) => {
    if (value === "TEXT" || value === "NUMBER" || value === "DATE") {
      setOptions([{ text: "", value: "", order: 0 }]);
    }
  };

  // Question type columns
  const columns = [
    {
      title: "Order",
      dataIndex: "order",
      key: "order",
      width: 80,
      sorter: (a, b) => a.order - b.order,
      render: (order) => <Tag color="blue">{order}</Tag>,
    },
    {
      title: "Question",
      dataIndex: "text",
      key: "text",
      width: 300,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{text}</div>
          {record.placeholder && (
            <div style={{ fontSize: 12, color: "#999" }}>
              Placeholder: {record.placeholder}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type) => {
        const typeOption = QuestionTypeOptions.find((t) => t.value === type);
        return (
          <Tag color={typeOption?.color || "default"}>
            {typeOption?.label || type}
          </Tag>
        );
      },
    },
    {
      title: "Required",
      dataIndex: "required",
      key: "required",
      width: 100,
      render: (required) => (
        <Tag color={required ? "red" : "default"}>
          {required ? "Required" : "Optional"}
        </Tag>
      ),
    },
    {
      title: "Weight",
      dataIndex: "weight",
      key: "weight",
      width: 100,
      render: (weight) => (
        <Tag color={weight > 1 ? "gold" : "default"}>{weight || 1.0}</Tag>
      ),
    },
    {
      title: "Options",
      dataIndex: "options",
      key: "options",
      width: 100,
      render: (options, record) => {
        if (record.type === "RADIO" || record.type === "MULTI_SELECT") {
          return (
            <Tooltip
              title={
                <div>
                  {options?.map((opt) => (
                    <div key={opt.id}>
                      {opt.text} ({opt.value})
                    </div>
                  ))}
                </div>
              }
            >
              <span>{options?.length || 0} options</span>
            </Tooltip>
          );
        }
        return "-";
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
          {/* <Button
            type="link"
            icon={<CopyOutlined />}
            onClick={() => handleCopy(record)}
            title="Copy"
          /> */}
          {/* <Button
            type="link"
            icon={<UpOutlined />}
            onClick={() => handleReorder(record.id, "up")}
            title="Move Up"
            disabled={record.order === 0}
          />
          <Button
            type="link"
            icon={<DownOutlined />}
            onClick={() => handleReorder(record.id, "down")}
            title="Move Down"
          /> */}
          <Popconfirm
            title="Are you sure to delete this question?"
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
        title="Questions Management"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Add Question
          </Button>
        }
      >
        {Object.entries(groupedQuestions).length > 0 ? (
          Object.entries(groupedQuestions).map(
            ([categoryName, categoryQuestions]) => (
              <Card
                key={categoryName}
                title={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                    onClick={() => toggleCategory(categoryName)}
                  >
                    <span style={{ fontSize: 16, fontWeight: 600 }}>
                      {categoryName}
                    </span>
                    <span>
                      {expandedCategories[categoryName] ? (
                        <UpOutlined />
                      ) : (
                        <DownOutlined />
                      )}
                      <span
                        style={{ marginLeft: 8, fontSize: 12, color: "#999" }}
                      >
                        ({categoryQuestions.length} questions)
                      </span>
                    </span>
                  </div>
                }
                style={{ marginBottom: 16 }}
                size="small"
                bordered={false}
              >
                {expandedCategories[categoryName] && (
                  <Table
                    columns={columns}
                    dataSource={categoryQuestions.sort(
                      (a, b) => a.order - b.order,
                    )}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                    size="small"
                    scroll={{ x: 1000 }}
                  />
                )}
              </Card>
            ),
          )
        ) : (
          <div style={{ textAlign: "center", padding: 40 }}>
            <p style={{ color: "#999" }}>
              No questions found. Create your first question!
            </p>
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={modalType === "create" ? "Create New Question" : "Edit Question"}
        open={modalVisible}
        onCancel={() => {
          if (!isSubmitting) {
            setModalVisible(false);
          }
        }}
        onOk={handleSubmit}
        width={600}
        okText={modalType === "create" ? "Create" : "Update"}
        cancelText="Cancel"
        confirmLoading={isSubmitting}
        maskClosable={!isSubmitting}
        closable={!isSubmitting}
        footer={[
          <Button
            key="cancel"
            onClick={() => setModalVisible(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
          >
            {modalType === "create" ? "Create" : "Update"}
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            required: false,
            weight: 1.0,
            order: 0,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="categoryName"
                label="Category"
                rules={[
                  { required: true, message: "Please select a category" },
                ]}
              >
                <Select placeholder="Select category" disabled={isSubmitting}>
                  {categories.map((category) => (
                    <Option key={category.id} value={category.name}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="order"
                label="Display Order"
                rules={[
                  { required: true, message: "Please enter order number" },
                ]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="0"
                  disabled={isSubmitting}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="text"
            label="Question Text"
            rules={[{ required: true, message: "Please enter question text" }]}
          >
            <TextArea
              placeholder="Enter the question text"
              rows={3}
              showCount
              maxLength={500}
              disabled={isSubmitting}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Question Type"
                rules={[
                  { required: true, message: "Please select question type" },
                ]}
              >
                <Select
                  placeholder="Select question type"
                  onChange={handleTypeChange}
                  disabled={isSubmitting}
                >
                  {QuestionTypeOptions.map((type) => (
                    <Option key={type.value} value={type.value}>
                      <Tag color={type.color}>{type.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="weight"
                label="Matching Weight"
                rules={[{ required: true, message: "Please enter weight" }]}
                tooltip="Higher weight means more important for match compatibility"
              >
                <InputNumber
                  min={0.1}
                  max={5}
                  step={0.1}
                  style={{ width: "100%" }}
                  placeholder="1.0"
                  disabled={isSubmitting}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="placeholder" label="Placeholder Text (Optional)">
            <Input
              placeholder="Enter placeholder text for input fields"
              disabled={isSubmitting}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="required"
                label="Required"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Required"
                  unCheckedChildren="Optional"
                  disabled={isSubmitting}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Options Section */}
          <Form.Item
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.type !== currentValues.type
            }
          >
            {({ getFieldValue }) => {
              const type = getFieldValue("type");
              if (type === "RADIO" || type === "MULTI_SELECT") {
                return (
                  <Card
                    title="Options"
                    size="small"
                    extra={
                      <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={addOption}
                        size="small"
                        disabled={isSubmitting}
                      >
                        Add Option
                      </Button>
                    }
                  >
                    {options.map((option, index) => (
                      <Row
                        gutter={8}
                        key={index}
                        align="middle"
                        style={{ marginBottom: 8 }}
                      >
                        <Col span={10}>
                          <Input
                            placeholder="Display Text"
                            value={option.text}
                            onChange={(e) =>
                              handleOptionChange(index, "text", e.target.value)
                            }
                            disabled={isSubmitting}
                          />
                        </Col>
                        <Col span={10}>
                          <Input
                            placeholder="Stored Value"
                            value={option.value}
                            onChange={(e) =>
                              handleOptionChange(index, "value", e.target.value)
                            }
                            disabled={isSubmitting}
                          />
                        </Col>
                        <Col span={4}>
                          <Button
                            danger
                            icon={<CloseOutlined />}
                            onClick={() => removeOption(index)}
                            disabled={options.length === 1 || isSubmitting}
                            size="small"
                          />
                        </Col>
                      </Row>
                    ))}
                    <div style={{ color: "#999", fontSize: 12, marginTop: 8 }}>
                      Tip: "Display Text" is shown to users, "Stored Value" is
                      saved in database
                    </div>
                  </Card>
                );
              }
              return null;
            }}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QuestionsManagement;
