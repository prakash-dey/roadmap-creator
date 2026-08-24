import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0d12",
          borderRadius: 7,
        }}
      >
        <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
          <circle cx="18" cy="5.5" r="2" fill="#ffb63f" />
          <path
            d="M1.5 19.5L7.5 9L12.5 17L14 14.5L16 18L17 15.5L22.5 19.5H1.5Z"
            fill="#8a6a2a"
            opacity={0.55}
          />
          <path d="M8.5 19.5L15 6.5L21.5 19.5H8.5Z" fill="#f5a524" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
