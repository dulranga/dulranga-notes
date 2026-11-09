import type { Image, Nodes, Root } from "mdast";
import type { Plugin } from "unified";

type Size = { width: number; height: number };

const DataUri = /^data:image\/[\w.+-]+;base64,/i;
const FallbackSize: Size = { width: 800, height: 600 };

function pngSize(buf: Buffer): Size | undefined {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function gifSize(buf: Buffer): Size | undefined {
  if (buf.length < 10 || buf.toString("ascii", 0, 3) !== "GIF") return;
  return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
}

function jpegSize(buf: Buffer): Size | undefined {
  if (buf.length < 4 || buf.readUInt16BE(0) !== 0xffd8) return;
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = buf[i + 1];
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) {
      i += 2;
      continue;
    }
    const isFrame =
      marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
    if (isFrame) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
}

function webpSize(buf: Buffer): Size | undefined {
  if (
    buf.length < 30 ||
    buf.toString("ascii", 0, 4) !== "RIFF" ||
    buf.toString("ascii", 8, 12) !== "WEBP"
  )
    return;
  switch (buf.toString("ascii", 12, 16)) {
    case "VP8 ":
      return {
        width: buf.readUInt16LE(26) & 0x3fff,
        height: buf.readUInt16LE(28) & 0x3fff,
      };
    case "VP8L": {
      const bits = buf.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    case "VP8X":
      return {
        width: buf.readUIntLE(24, 3) + 1,
        height: buf.readUIntLE(27, 3) + 1,
      };
  }
}

function readSize(url: string): Size {
  const data = Buffer.from(url.slice(url.indexOf(",") + 1), "base64");
  return (
    pngSize(data) ??
    gifSize(data) ??
    jpegSize(data) ??
    webpSize(data) ??
    FallbackSize
  );
}

function isImage(node: Nodes): node is Image {
  return node.type === "image";
}

function apply(node: Nodes) {
  if (isImage(node) && DataUri.test(node.url)) {
    const { width, height } = readSize(node.url);
    const data = (node.data ??= {}) as { hProperties?: Record<string, unknown> };
    data.hProperties = {
      ...data.hProperties,
      width: String(width),
      height: String(height),
    };
  }
  if ("children" in node) (node.children as Nodes[]).forEach(apply);
}

/**
 * `remarkImage` reads image dimensions from disk or over HTTP, which cannot
 * work for inline `data:` URIs (Obsidian pastes these for some images). It must
 * be told to ignore them (see `isDataImageError`); this plugin then reads the
 * dimensions from the embedded bytes so `next/image` gets the width and height
 * it requires.
 */
export const remarkDataImage: Plugin<[], Root> = function () {
  return (tree) => apply(tree);
};

export function isDataImageError(error: Error) {
  return error.message.startsWith("[Remark Image] Failed obtain image size for data:");
}
