// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { satteri } from "@astrojs/markdown-satteri";
import { defineHastPlugin } from "satteri";

// Open off-site links in a new tab without giving that page a window.opener.
const externalLinks = defineHastPlugin({
  name: "external-links",
  element: {
    filter: ["a"],
    visit(node, ctx) {
      const href = node.properties?.href;
      if (typeof href === "string" && /^https?:\/\//.test(href)) {
        ctx.setProperty(node, "target", "_blank");
        ctx.setProperty(node, "rel", ["noopener", "noreferrer"]);
      }
    },
  },
});

// https://astro.build/config
export default defineConfig({
  site: "https://jesses-room.vercel.app",
  integrations: [react(), sitemap()],
  // Content-Security-Policy, written into each page with hashes for its
  // inline scripts and styles. frame-ancestors can't go in a page's own
  // policy, so it is sent as a header from vercel.json instead.
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        // The model's textures are decoded from blob: URLs.
        "img-src 'self' data: blob:",
        "font-src 'self'",
        "connect-src 'self' blob:",
        // The Draco decoder runs in a worker made from a blob: URL.
        "worker-src 'self' blob:",
        // The YouTube player on the room's monitor.
        "frame-src https://www.youtube-nocookie.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
      scriptDirective: {
        // The Draco decoder compiles WebAssembly.
        resources: ["'self'", "'wasm-unsafe-eval'"],
      },
    },
  },
  markdown: {
    // Smart punctuation off: keep the copy's straight quotes as written.
    processor: satteri({
      hastPlugins: [externalLinks],
      features: { smartPunctuation: false },
    }),
  },
});
