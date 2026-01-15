import { useState, useEffect } from "react";
import { graphqlClient } from "../../lib/graphqlClient";
import { useAuthStore } from "../../lib/authStore";

type AuthType = "login" | "register" | null;

interface AuthModalsProps {
  authType: AuthType;
  onClose: () => void;
  onSwitch: (type: "login" | "register") => void;
}

export const AuthModals = ({
  authType,
  onClose,
  onSwitch,
}: AuthModalsProps) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { setAuth } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) return;

    setError("");
    setSubmitting(true);
    try {
      const mutation = `
        mutation Login($usernameOrEmail: String!, $password: String!) {
          login(usernameOrEmail: $usernameOrEmail, password: $password) {
            accessToken
            refreshToken
            user {
              id
              username
              email
            }
          }
        }
      `;
      const data = (await graphqlClient.request(mutation, {
        usernameOrEmail,
        password,
      })) as {
        login: {
          accessToken: string;
          refreshToken: string;
          user: { id: string; username: string; email: string };
        };
      };

      setAuth({
        user: data.login.user,
        accessToken: data.login.accessToken,
        refreshToken: data.login.refreshToken,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerUsername || !registerEmail || !password) return;

    setError("");
    setSubmitting(true);
    try {
      const mutation = `
        mutation Register($username: String!, $email: String!, $password: String!) {
          register(username: $username, email: $email, password: $password) {
            accessToken
            refreshToken
            user {
              id
              username
              email
            }
          }
        }
      `;
      const data = (await graphqlClient.request(mutation, {
        username: registerUsername,
        email: registerEmail,
        password,
      })) as {
        register: {
          accessToken: string;
          refreshToken: string;
          user: { id: string; username: string; email: string };
        };
      };

      setAuth({
        user: data.register.user,
        accessToken: data.register.accessToken,
        refreshToken: data.register.refreshToken,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (!authType) return null;

  return (
    <div className="absolute inset-0 bg-black/40 z-[1200] flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg w-80 shadow-lg">
        <div className="flex justify-between mb-4">
          <h3 className="m-0 text-lg font-semibold">
            {authType === "login" ? "Đăng nhập" : "Đăng ký"}
          </h3>
          <button
            onClick={onClose}
            className="bg-none border-none text-xl cursor-pointer leading-none"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="text-red-500 text-[13px] mb-3 bg-red-100 p-2 rounded">
            {error}
          </div>
        )}

        {authType === "login" ? (
          <form onSubmit={handleLogin}>
            <div className="mb-2">
              <input
                type="text"
                placeholder="Username hoặc Email"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                className="w-full p-2 text-[13px] border border-gray-200 rounded"
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 text-[13px] border border-gray-200 rounded"
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !usernameOrEmail || !password}
              className="w-full p-2 bg-blue-600 text-white rounded border-none cursor-pointer font-medium disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? "Đang xử lý..." : "Đăng nhập"}
            </button>
            <div className="mt-3 text-[13px] text-center">
              Chưa có tài khoản?{" "}
              <span
                onClick={() => onSwitch("register")}
                className="text-blue-600 cursor-pointer font-medium hover:underline"
              >
                Đăng ký ngay
              </span>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="mb-2">
              <input
                type="text"
                placeholder="Username"
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
                className="w-full p-2 text-[13px] border border-gray-200 rounded"
              />
            </div>
            <div className="mb-2">
              <input
                type="email"
                placeholder="Email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                className="w-full p-2 text-[13px] border border-gray-200 rounded"
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 text-[13px] border border-gray-200 rounded"
              />
            </div>
            <button
              type="submit"
              disabled={
                submitting || !registerUsername || !registerEmail || !password
              }
              className="w-full p-2 bg-blue-600 text-white rounded border-none cursor-pointer font-medium disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? "Đang xử lý..." : "Đăng ký"}
            </button>
            <div className="mt-3 text-[13px] text-center">
              Đã có tài khoản?{" "}
              <span
                onClick={() => onSwitch("login")}
                className="text-blue-600 cursor-pointer font-medium hover:underline"
              >
                Đăng nhập
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
