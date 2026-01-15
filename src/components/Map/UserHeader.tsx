import { useAuthStore } from "../../lib/authStore";

interface UserHeaderProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const UserHeader = ({
  onOpenLogin,
  onOpenRegister,
}: UserHeaderProps) => {
  const { user, clearAuth } = useAuthStore();

  return (
    <div className="flex items-center justify-between mb-3">
      {user ? (
        <>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold">{user.username || "User"}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={clearAuth}
            className="border-none bg-transparent text-red-500 cursor-pointer text-xs flex items-center gap-1"
          >
            <span>Logout</span>
            <span>⎋</span>
          </button>
        </>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onOpenLogin}
            className="px-2 py-1 text-xs rounded border border-blue-600 bg-white text-blue-600 cursor-pointer"
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={onOpenRegister}
            className="px-2 py-1 text-xs rounded border-none bg-blue-600 text-white cursor-pointer"
          >
            Đăng ký
          </button>
        </div>
      )}
    </div>
  );
};
