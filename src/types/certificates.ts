// src/types/certificates.ts (Updated)

export interface Position {
  x: number;
  y: number;
}

export interface TextElement {
  id: string;
  text: string;
  position: Position;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  textAlign: "left" | "center" | "right";
  maxWidth?: number; // NEW: Optional bounding box width
  showBoundingBox?: boolean; // NEW: Show visual guide in editor
}

export interface ImageElement {
  id: string;
  src: string;
  position: Position;
  width: number;
  height: number;
  type: "signature" | "logo" | "custom";
}

export interface CertificateTemplate {
  id: string;
  name: string;
  backgroundImage: string;
  width: number;
  height: number;
}

export interface Certificate {
  id: string;
  template: CertificateTemplate;
  textElements: TextElement[];
  imageElements: ImageElement[];
  createdAt: Date;
  updatedAt: Date;
}