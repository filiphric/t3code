import { describe, expect, it } from "vite-plus/test";
import { isAllowedAppHref, normalizeAppScheme } from "./externalAppLinks.ts";

describe("app link policy", () => {
  it("requires explicit approval and supports normalization and revocation", () => {
    for (const href of [
      "things:///show?id=today",
      "THINGS:///show?id=a%2Fb",
      "obsidian://open?vault=Notes",
    ]) {
      expect(isAllowedAppHref(href, [])).toBe(false);
      expect(isAllowedAppHref(href, ["Things:", "obsidian"])).toBe(true);
      expect(isAllowedAppHref(href, [])).toBe(false);
    }
    expect(normalizeAppScheme(" Things: ")).toBe("things");
    for (const scheme of [
      "javascript",
      "data",
      "file",
      "blob",
      "smb",
      "ms-settings",
      "vscode",
      "zed",
      "bad scheme",
      "x",
    ]) {
      expect(normalizeAppScheme(scheme)).toBeNull();
      expect(isAllowedAppHref(`${scheme}://open`, [scheme])).toBe(false);
    }
    for (const href of [
      "things://user:secret@host/open",
      "things:///show\n?id=today",
      "relative/path",
    ]) {
      expect(isAllowedAppHref(href, ["things"])).toBe(false);
    }
  });
});
