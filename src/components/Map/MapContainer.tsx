"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import { graphqlClient } from "../../lib/graphqlClient";
import { CheckIn } from "../../types";
import { AuthModals } from "../Auth/AuthModals";
import { UserHeader } from "./UserHeader";
import { CheckInForm } from "./CheckInForm";
import { MapView } from "./MapView";
import { useAuthStore } from "../../lib/authStore";

const DEFAULT_CENTER: [number, number] = [21.0285, 105.8542];

const fetchAllCheckIns = async () => {
  const query = `
    query AllCheckIns {
      allCheckIns {
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

  const data = (await graphqlClient.request(query)) as {
    allCheckIns: CheckIn[];
  };
  return data.allCheckIns ?? [];
};

const MapContainer = () => {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [center, setCenter] = useState<[number, number] | null>(null);
  const [authType, setAuthType] = useState<"login" | "register" | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<
    [number, number] | null
  >(null);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    const defaultProto = L.Icon.Default.prototype as unknown as {
      _getIconUrl?: () => string;
    };
    delete defaultProto._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const nextCenter: [number, number] = [
            pos.coords.latitude,
            pos.coords.longitude,
          ];
          setCenter(nextCenter);
          fetchAllCheckIns()
            .then(setCheckIns)
            .catch(() => {
              setCheckIns([]);
            });
        },
        () => {
          setCenter(DEFAULT_CENTER);
          fetchAllCheckIns()
            .then(setCheckIns)
            .catch(() => {
              setCheckIns([]);
            });
        }
      );
    } else {
      const timer = setTimeout(() => {
        setCenter(DEFAULT_CENTER);
        fetchAllCheckIns()
          .then(setCheckIns)
          .catch(() => {
            setCheckIns([]);
          });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCheckInSuccess = (newCheckIn: CheckIn) => {
    setCheckIns((prev) => [newCheckIn, ...prev]);
  };

  if (!center) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Đang lấy vị trí của bạn...</div>
      </div>
    );
  }

  const currentPosition = selectedPosition ?? center;

  return (
    <div className="h-screen w-full relative">
      <div className="absolute z-[1000] top-4 right-4 p-3 bg-white rounded-lg shadow-md max-w-xs w-full">
        <UserHeader
          onOpenLogin={() => setAuthType("login")}
          onOpenRegister={() => setAuthType("register")}
        />
      </div>

      {accessToken && (
        <div className="absolute z-[1000] top-4 left-12 p-3 bg-white rounded-lg shadow-md max-w-xs w-full max-h-[90vh] overflow-y-auto space-y-3">
          <CheckInForm
            center={currentPosition}
            onSuccess={handleCheckInSuccess}
          />
          <div className="border-t border-gray-100 pt-2">
            <div className="text-xs font-semibold mb-2">
              Bản tin check-in gần đây
            </div>
            {checkIns.length === 0 && (
              <div className="text-[11px] text-gray-400">
                Chưa có check-in nào gần đây.
              </div>
            )}
            {checkIns.map((c) => (
              <div
                key={c.id}
                className="flex gap-2 py-2 border-b border-gray-50"
              >
                {c.imageUrls[0] && (
                  <img
                    src={c.imageUrls[0]}
                    alt={c.caption ?? "Check-in"}
                    className="w-12 h-12 rounded object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">
                    {c.caption || "Không có tiêu đề"}
                  </div>
                  {c.createdAt && (
                    <div className="text-[11px] text-gray-400">
                      {new Date(c.createdAt).toLocaleString("vi-VN")}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <MapView
        center={center}
        checkIns={checkIns}
        selectedPosition={selectedPosition}
        onSelectPosition={setSelectedPosition}
      />

      <AuthModals
        key={authType}
        authType={authType}
        onClose={() => setAuthType(null)}
        onSwitch={(type) => setAuthType(type)}
      />
    </div>
  );
};

export default MapContainer;
