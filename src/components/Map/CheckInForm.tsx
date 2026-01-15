import { useState } from "react";
import { graphqlClient } from "../../lib/graphqlClient";
import { useAuthStore } from "../../lib/authStore";
import { CheckIn } from "../../types";

interface CheckInFormProps {
  center: [number, number];
  onSuccess: (checkIn: CheckIn) => void;
}

export const CheckInForm = ({ center, onSuccess }: CheckInFormProps) => {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { accessToken } = useAuthStore();

  const fileToBase64 = (f: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !accessToken || !center) {
      return;
    }
    setSubmitting(true);
    try {
      const base64 = await fileToBase64(file);
      const uploadRes = await fetch("http://localhost:4000/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      const uploadJson = (await uploadRes.json()) as { url?: string };
      if (!uploadJson.url) {
        setSubmitting(false);
        return;
      }

      const mutation = `
        mutation CreateCheckIn(
          $caption: String
          $imageUrls: [String!]!
          $lat: Float!
          $lng: Float!
        ) {
          createCheckIn(
            caption: $caption
            imageUrls: $imageUrls
            lat: $lat
            lng: $lng
          ) {
            id
            caption
            imageUrls
            lat
            lng
            createdAt
            likeCount
            type
            status
          }
        }
      `;

      const data = (await graphqlClient.request(
        mutation,
        {
          caption: caption || null,
          imageUrls: [uploadJson.url],
          lat: center[0],
          lng: center[1],
        },
        {
          authorization: `Bearer ${accessToken}`,
        }
      )) as { createCheckIn: CheckIn };

      onSuccess(data.createCheckIn);
      setCaption("");
      setFile(null);
    } catch (error) {
      console.error("Check-in failed:", error);
      alert("Check-in thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (!accessToken) {
    return (
      <div className="text-[11px] text-gray-500 mb-2">
        Bạn cần đăng nhập để có thể check-in.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-2">
        <input
          type="text"
          placeholder="Nhập caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className=" w-full p-1.5 border border-gray-300 rounded text-sm"
        />
      </div>
      <div className="mb-2 ">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full rounded border border-gray-300 p-1.5 text-xs
             file:mr-3 file:rounded file:border-0
             file:bg-blue-500 file:px-3 file:py-1 file:text-white
             hover:file:bg-blue-600"
        />
      </div>
      <button
        type="submit"
        disabled={submitting || !file || !accessToken}
        className="w-full p-2 bg-blue-600 text-white rounded border-none cursor-pointer text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {submitting ? "Đang check-in..." : "Check-in tại vị trí này"}
      </button>
    </form>
  );
};
