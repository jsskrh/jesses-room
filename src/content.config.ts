import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Copy for the fixed home page sections, one Markdown file per section.
const home = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/home" }),
});

// One file per project. Drives the home page project list, the book that
// pops out of the shelf (bookNode is the node name in the room model), and
// the case study page at /projects/<file name>, whose body is the Markdown.
const projects = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    order: z.number().int(),
    bookNode: z.string(),
    url: z.url(),
    summary: z.array(z.string()).min(1),
    // Shown at the top of the case study when given.
    role: z.string().optional(),
    period: z.string().optional(),
    stack: z.array(z.string()).optional(),
  }),
});

// One file per role on the /experience timeline, newest first by `order`.
// The body lists the role's highlights.
const experience = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/experience" }),
  schema: z.object({
    company: z.string(),
    role: z.string(),
    // As it should read, e.g. "Mar 2021 – Present".
    period: z.string(),
    location: z.string().optional(),
    url: z.url().optional(),
    order: z.number().int(),
  }),
});

export const collections = { home, projects, experience };
