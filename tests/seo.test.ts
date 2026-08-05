import { afterEach, describe, expect, it } from "vitest";
import { localizedAlternates, pageMetadata } from "@/lib/seo";

const previousSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
afterEach(() => { if (previousSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL; else process.env.NEXT_PUBLIC_SITE_URL = previousSiteUrl; });

describe("localized SEO metadata", () => {
  it("builds canonical and complete language alternates", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com/";
    const metadata = pageMetadata("ru", "about", "О нас", "Описание");
    expect(metadata.alternates?.canonical).toBe("https://example.com/ru/about");
    expect(metadata.alternates?.languages).toEqual({ en: "https://example.com/en/about", ru: "https://example.com/ru/about", es: "https://example.com/es/about", ar: "https://example.com/ar/about", "x-default": "https://example.com/en/about" });
  });

  it("uses English as the x-default homepage", () => {
    expect(localizedAlternates()["x-default"]).toBe("https://meridianprivate.com/en");
  });
});
