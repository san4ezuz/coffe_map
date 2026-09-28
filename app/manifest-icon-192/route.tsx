import { ImageResponse } from "next/og";

export async function GET() {
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
          borderRadius: 36,
        }}
      >
        <div
          style={{
            width: 82,
            height: 71,
            background: "#FFFDF9",
            borderRadius: "9px 9px 41px 41px",
          }}
        />
      </div>
    ),
    { width: 192, height: 192 }
  );
}
