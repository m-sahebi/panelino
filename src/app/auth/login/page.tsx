"use client";

import { GithubOutlined } from "@ant-design/icons";
import { Button, Divider, Form, Input } from "antd";
import { message } from "antd/lib";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect } from "react";
import { IS_DEV } from "@/data/configs";

export default function LoginPage() {
  const query = useSearchParams();

  useEffect(() => {
    const error = query?.get("error");
    if (error)
      message.error({
        content: "Invalid Credentials!",
        key: "serverSigninCredentialsError",
      });
    return () => message.destroy("serverSigninCredentialsError");
  }, [query]);

  const onFinish = (values: any): void => {
    signIn("credentials", { callbackUrl: "/dash", ...values });
  };

  const onFinishFailed = (errorInfo: any): void => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="mx-auto mt-10 mt-[15vh] flex max-w-lg flex-col items-stretch gap-4">
      <Button onClick={() => signIn("github")} icon={<GithubOutlined />}>
        Sign in with GitHub
      </Button>
      <Divider className={"my-0"}>or</Divider>
      <Form
        name="basic"
        initialValues={{}}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        requiredMark={false}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            {
              required: true,
              message: "Please input your Email!",
            },
            {
              type: "email",
              message: "Enter a valid Email!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            {
              required: !IS_DEV,
              message: "Please input your password!",
            },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item wrapperCol={{ span: 18, offset: 6 }}>
          <Button type="primary" htmlType="submit">
            Sign in
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
