import type { CertificatePayload } from "@/lib/db/certificates";

export const DEFAULT_WIDTH = 1200;
export const DEFAULT_HEIGHT = 850;

export interface RenderInput {
  payload: CertificatePayload;
  backgroundUrl?: string | null;
  width?: number;
  height?: number;
}

// Pure JSX for next/og ImageResponse. Mirrors the editor canvas:
// absolute-positioned text + image overlays on top of a template background.
// Satori (the engine behind ImageResponse) supports a CSS subset — keep styles
// to flex/position/font/color/text-align. No transforms, no z-index needed.
export function CertificateImage({ payload, backgroundUrl, width, height }: RenderInput) {
  const w = width ?? payload.canvas?.width ?? DEFAULT_WIDTH;
  const h = height ?? payload.canvas?.height ?? DEFAULT_HEIGHT;
  return (
    <div
      style={{
        width: w,
        height: h,
        position: "relative",
        display: "flex",
        backgroundColor: payload.background?.color ?? "#ffffff",
      }}
    >
      {backgroundUrl ? (
        // Background image fills the canvas
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={backgroundUrl}
          alt=""
          width={w}
          height={h}
          style={{ position: "absolute", left: 0, top: 0, width: w, height: h }}
        />
      ) : null}

      {payload.textElements.map((t) => (
        <div
          key={t.id}
          style={{
            position: "absolute",
            left: t.position.x,
            top: t.position.y,
            fontSize: t.fontSize,
            fontFamily: t.fontFamily || "sans-serif",
            color: t.color,
            fontWeight: t.fontWeight === "bold" ? 700 : 400,
            fontStyle: t.fontStyle,
            textAlign: t.textAlign,
            ...(t.maxWidth ? { maxWidth: t.maxWidth } : {}),
            // Satori wants explicit display for divs containing text
            display: "flex",
            whiteSpace: "pre-wrap",
          }}
        >
          {t.text}
        </div>
      ))}

      {payload.imageElements.map((img) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={img.id}
          src={img.src}
          alt=""
          width={img.width}
          height={img.height}
          style={{
            position: "absolute",
            left: img.position.x,
            top: img.position.y,
            width: img.width,
            height: img.height,
          }}
        />
      ))}
    </div>
  );
}
