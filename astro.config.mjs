// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
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
  integrations: [react()],
  markdown: {
    // Smart punctuation off: keep the copy's straight quotes as written.
    processor: satteri({
      hastPlugins: [externalLinks],
      features: { smartPunctuation: false },
    }),
  },
});
