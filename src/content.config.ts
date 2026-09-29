import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Copy for the fixed home page sections, one Markdown file per section.
const home = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/home" }),
});

// One file per project. Drives the home page project list, the book that
// pops out of the shelf (bookNode is the node name in the room model), and
// later the case study page (the Markdown body).
const projects = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    order: z.number().int(),
    bookNode: z.string(),
    url: z.url(),
    summary: z.array(z.string()).min(1),
  }),
});

export const collections = { home, projects };
