import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { CertificateImage } from "@/lib/render/certificate";
import type { CertificatePayload } from "@/lib/db/certificates";

const payload: CertificatePayload = {
  textElements: [
    {
      id: "t1",
      text: "Awarded to Ken Garcia",
      position: { x: 100, y: 200 },
      fontSize: 48,
      fontFamily: "Merriweather",
      color: "#222222",
      fontWeight: "bold",
      fontStyle: "normal",
      textAlign: "center",
    },
  ],
  imageElements: [
    {
      id: "i1",
      src: "/signature.png",
      position: { x: 300, y: 600 },
      width: 180,
      height: 60,
      type: "signature",
    },
  ],
};

describe("CertificateImage JSX", () => {
  it("renders text at the configured position with the right styles", () => {
    const html = renderToString(<CertificateImage payload={payload} />);
    expect(html).toContain("Awarded to Ken Garcia");
    expect(html).toContain("left:100px");
    expect(html).toContain("top:200px");
    expect(html).toContain("font-family:Merriweather");
    expect(html).toContain("font-weight:700");
    expect(html).toContain("text-align:center");
  });

  it("renders the background image when provided", () => {
    const html = renderToString(
      <CertificateImage payload={payload} backgroundUrl="https://cdn/bg.png" width={1200} height={850} />,
    );
    expect(html).toContain("https://cdn/bg.png");
  });

  it("renders image elements at the configured position", () => {
    const html = renderToString(<CertificateImage payload={payload} />);
    expect(html).toContain("/signature.png");
    expect(html).toContain("left:300px");
    expect(html).toContain("top:600px");
  });

  it("falls back to default canvas size", () => {
    const html = renderToString(<CertificateImage payload={payload} />);
    expect(html).toContain("width:1200px");
    expect(html).toContain("height:850px");
  });
});
