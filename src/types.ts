export type CheckIn = {
  id: string;
  caption?: string | null;
  imageUrls: string[];
  lat: number;
  lng: number;
  createdAt: Date;
  likeCount: number;
  type?: "VUI_CHOI" | "AN_UONG" | null;
  status?: "DANG_HOAT_DONG" | "TAM_NGUNG_HOAT_DONG" | "DUNG_HOAT_DONG" | null;
};
