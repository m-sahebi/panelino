"use client";

import { GithubOutlined } from "@ant-design/icons";
import { Button, Divider, Form, Input } from "antd";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { globalMessage } from "~/components/Providers/AntdProvider";
import { IS_DEV } from "~/data/configs";

const errors = {
  Signin: "Try signing with a different account.",
  OAuthSignin: "Try signing with a different account.",
  OAuthCallback: "Try signing with a different account.",
  OAuthCreateAccount: "Try signing with a different account.",
  EmailCreateAccount: "Try signing with a different account.",
  Callback: "Try signing with a different account.",
  OAuthAccountNotLinked:
    "To confirm your identity, sign in with the same account you used originally.",
  EmailSignin: "Check your email address.",
  CredentialsSignin: "Sign in failed. Check the details you provided are correct.",
  default: "Unable to sign in",
};

export default function LoginPage() {
  const query = useSearchParams();

  useEffect(() => {
    const error = query?.get("error");
    if (error)
      void globalMessage.error({
        content: (errors as any)[error] ?? errors.default,
        key: "serverSigninError",
      });
    return () => globalMessage.destroy("serverSigninError");
  }, [query]);

  const onFinish = (values: any) => {
    void signIn("credentials", { callbackUrl: "/", ...values });
  };

  return (
    <div className="mx-auto mt-10 mt-[15vh] flex max-w-lg flex-col items-stretch gap-4">
      <Button onClick={() => void signIn("github")} icon={<GithubOutlined />}>
        Sign in with GitHub
      </Button>
      <Divider className="my-0">or</Divider>
      <Form
        name="basic"
        layout="vertical"
        initialValues={{}}
        onFinish={onFinish}
        requiredMark={false}
      >
        <Form.Item
          label="Email"
          name="email"
          className="mb-3"
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

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Sign in
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
