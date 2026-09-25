/**
 * Turns admin-authored CMS content (blog post HTML, page blocks) into HTML that is safe to render.
 * Server-only: uses sanitize-html. Everything an admin types goes through `cleanHtml`, so a
 * compromised or careless editor account cannot inject script into the shop.
 */
import sanitizeHtml from "sanitize-html";
import { API_ORIGIN } from "./api";
import { resolveMediaUrl } from "./adapters";

const YOUTUBE = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/;
const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const options: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "hr", "h2", "h3", "h4", "ul", "ol", "li", "strong", "b", "em", "i", "u", "s", "blockquote", "code", "pre", "a", "img", "figure", "figcaption", "iframe", "table", "thead", "tbody", "tr", "th", "td"],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    iframe: ["src", "title", "allow", "allowfullscreen", "loading"],
    figure: ["class"],
  },
  allowedClasses: { figure: ["video"] },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https"] },
  allowProtocolRelative: false,
  allowedIframeHostnames: ["www.youtube-nocookie.com"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    // Uploads are served by the API, not this app.
    img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, src: resolveMediaUrl(API_ORIGIN, attribs.src) ?? "", loading: "lazy" } }),
  },
};

export const cleanHtml = (html: string) => sanitizeHtml(html, options);

// Older content stored plain text (paragraphs separated by blank lines) instead of HTML.
const asHtml = (text: string) => (/<[a-z][\s\S]*>/i.test(text) ? text : text.split(/\n{2,}/).filter((p) => p.trim()).map((p) => `<p>${escapeHtml(p.trim())}</p>`).join(""));

/** Page.contentBlocks: a plain string (legacy), or an array of text `{heading?, body}`, `image` and `video` blocks. */
export function pageContentToHtml(raw: unknown): string {
  if (typeof raw === "string") return cleanHtml(asHtml(raw));
  if (!Array.isArray(raw)) return "";
  const html = raw.map((entry) => {
    const item = (entry && typeof entry === "object" ? entry : {}) as Record<string, unknown>;
    const text = (key: string) => (typeof item[key] === "string" ? (item[key] as string).trim() : "");
    const caption = text("caption") ? `<figcaption>${escapeHtml(text("caption"))}</figcaption>` : "";
    if (item.type === "image") return text("url") ? `<figure><img src="${escapeHtml(text("url"))}" alt="${escapeHtml(text("alt"))}" />${caption}</figure>` : "";
    if (item.type === "video") {
      const id = YOUTUBE.exec(text("url"))?.[1];
      return id ? `<figure class="video"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="${escapeHtml(text("caption") || "YouTube video")}" allow="encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>${caption}</figure>` : "";
    }
    return `${text("heading") ? `<h2>${escapeHtml(text("heading"))}</h2>` : ""}${asHtml(text("body") || text("html"))}`;
  }).join("");
  return cleanHtml(html);
}
