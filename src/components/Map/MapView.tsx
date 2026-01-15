"use client";

import {
  MapContainer as LeafletMap,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { CheckIn } from "../../types";

interface MapViewProps {
  center: [number, number];
  checkIns: CheckIn[];
  selectedPosition?: [number, number] | null;
  onSelectPosition?: (position: [number, number]) => void;
}

type SelectLocationProps = {
  onSelectPosition?: (position: [number, number]) => void;
};

const SelectLocation = ({ onSelectPosition }: SelectLocationProps) => {
  useMapEvents({
    click(e) {
      if (onSelectPosition) {
        onSelectPosition([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
};

export const MapView = ({
  center,
  checkIns,
  selectedPosition,
  onSelectPosition,
}: MapViewProps) => {
  return (
    <LeafletMap center={center} zoom={13} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <SelectLocation onSelectPosition={onSelectPosition} />
      {selectedPosition && (
        <Marker position={selectedPosition}>
          <Popup>
            <div>Vị trí bạn chọn để check-in</div>
          </Popup>
        </Marker>
      )}
      {checkIns.map((c) => (
        <Marker
          key={c.id}
          position={[c.lat, c.lng]}
          eventHandlers={{
            click: () => {
              if (onSelectPosition) {
                onSelectPosition([c.lat, c.lng]);
              }
            },
          }}
        >
          <Popup>
            <div>
              <div>{c.caption ?? "Check-in"}</div>
              {c.imageUrls[0] && (
                <img
                  src={c.imageUrls[0]}
                  alt={c.caption ?? "Check-in image"}
                  className="w-[120px] h-[80px] object-cover mt-1"
                />
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </LeafletMap>
  );
};
