import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
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
          background: "#E8622C",
          borderRadius: 96,
        }}
      >
        <div
          style={{
            width: 220,
            height: 190,
            background: "#FFFDF9",
            borderRadius: "24px 24px 110px 110px",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
