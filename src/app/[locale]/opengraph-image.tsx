import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg,#1a1712 0%,#3a3226 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 96,
            letterSpacing: 12,
            color: "#f5e5a0",
            fontWeight: 700,
          }}
        >
          EPILISSE
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 32,
            letterSpacing: 4,
            color: "#ffffffcc",
          }}
        >
          LUXURY BEAUTY CARE MUNICH
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 24,
            color: "#f5e5a0aa",
            letterSpacing: 2,
          }}
        >
          Laser-Haarentfernung · Gesichtsästhetik · Body Contouring
        </div>
      </div>
    ),
    { ...size }
  );
}
