import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SchemaCheck — Schema Markup Validation API";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0f",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 16,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <div style={{ color: "white", fontSize: 36, fontWeight: 700 }}>S</div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "white",
            letterSpacing: "-2px",
            marginBottom: 16,
          }}
        >
          SchemaCheck
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            color: "#818cf8",
            marginBottom: 32,
          }}
        >
          Schema Markup Validation API
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: 16 }}>
          {["35+ schema types", "Rich result eligibility", "Fix suggestions"].map((text) => (
            <div
              key={text}
              style={{
                background: "#1e1b4b",
                border: "1px solid #3730a3",
                borderRadius: 8,
                padding: "8px 20px",
                color: "#a5b4fc",
                fontSize: 20,
              }}
            >
              {text}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
