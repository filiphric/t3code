const RESERVED_SCHEMES = new Set([
  "http",
  "https",
  "mailto",
  "tel",
  "javascript",
  "data",
  "vbscript",
  "file",
  "blob",
  "about",
  "chrome",
  "chrome-extension",
  "devtools",
  "smb",
  "shell",
  "search-ms",
  "vscode",
  "vscode-insiders",
  "zed",
  "jetbrains",
  "t3code",
  "t3code-dev",
  "t3-citation",
  "t3-context",
]);

export function normalizeAppScheme(value: string): string | null {
  const scheme = value.trim().toLowerCase().replace(/:$/, "");
  return /^[a-z][a-z0-9+.-]*$/.test(scheme) &&
    scheme.length > 1 &&
    !scheme.startsWith("ms-") &&
    !RESERVED_SCHEMES.has(scheme)
    ? scheme
    : null;
}

export function isAllowedAppHref(href: string, allowedSchemes: readonly string[]): boolean {
  if (/[\u0000-\u0020\u007f]/.test(href)) return false;
  try {
    const url = new URL(href);
    const scheme = normalizeAppScheme(url.protocol);
    return (
      scheme !== null &&
      url.username === "" &&
      url.password === "" &&
      allowedSchemes.some((value) => normalizeAppScheme(value) === scheme)
    );
  } catch {
    return false;
  }
}
