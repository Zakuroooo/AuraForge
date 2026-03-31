import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: 9999,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #22d3ee, #7c3aed)",
          boxShadow: "0 0 12px rgba(124,92,255,0.45)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 9999,
            border: "1px solid rgba(165,243,252,0.6)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            width: 14,
            height: 14,
            borderRadius: 9999,
            background: "#05050a",
          }}
        />
      </div>
    </div>,
    { ...size },
  );
}
