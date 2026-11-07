import { MAC_PERMISSION_SETTINGS_URLS } from "../permissions/MacPermission.ts";
import {
  REMOTE_CAPABLE_EDITOR_IDS,
  remoteSchemeForEditor,
  type SystemSettingsPane,
} from "@t3tools/contracts";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";

import * as Electron from "electron";
import { isAllowedAppHref } from "@t3tools/shared/externalAppLinks";
import { DesktopClientSettings } from "../settings/DesktopClientSettings.ts";

// Remote editor deep links must reach the OS handler.
const SAFE_WEB_PROTOCOLS = new Set(["http:", "https:"]);
const REMOTE_EDITOR_PROTOCOLS = new Set(
  REMOTE_CAPABLE_EDITOR_IDS.flatMap((id) => {
    const scheme = remoteSchemeForEditor(id);
    return scheme === undefined ? [] : [`${scheme}:`];
  }),
);

// Zed embeds [user@]host in the path; reject passwords and ports there.
const ZED_SSH_PATHNAME = /^\/(?:[^/@:]+@)?[^/@:]+\/.*$/;

const isRemoteEditorUrl = (url: URL) =>
  REMOTE_EDITOR_PROTOCOLS.has(url.protocol) &&
  url.username.length === 0 &&
  url.password.length === 0 &&
  (url.protocol === "zed:"
    ? url.host === "ssh" && ZED_SSH_PATHNAME.test(url.pathname)
    : url.protocol === "jetbrains:"
      ? url.host === "gateway" &&
        url.pathname === "/ssh/environment" &&
        (url.searchParams.get("h") ?? "").length > 0
      : url.host === "vscode-remote" &&
        url.pathname.startsWith("/ssh-remote+") &&
        url.pathname.length > "/ssh-remote+".length);

export function parseSafeExternalUrl(
  rawUrl: unknown,
  schemes: readonly string[] = [],
): Option.Option<string> {
  if (typeof rawUrl !== "string") {
    return Option.none();
  }

  try {
    const url = new URL(rawUrl);
    return SAFE_WEB_PROTOCOLS.has(url.protocol) ||
      isRemoteEditorUrl(url) ||
      isAllowedAppHref(rawUrl, schemes)
      ? Option.some(url.href)
      : Option.none();
  } catch {
    return Option.none();
  }
}

export class ElectronShell extends Context.Service<
  ElectronShell,
  {
    readonly openExternal: (rawUrl: unknown) => Effect.Effect<boolean>;
    readonly openSystemSettings: (pane: SystemSettingsPane) => Effect.Effect<boolean>;
    readonly copyText: (text: string) => Effect.Effect<void>;
  }
>()("@t3tools/desktop/electron/ElectronShell") {}

/** @public */
export const make = ElectronShell.of({
  openExternal: Effect.fn("ElectronShell.openExternal")(function* (rawUrl) {
    const service = yield* Effect.serviceOption(DesktopClientSettings);
    const settings = Option.isSome(service)
      ? yield* service.value.get.pipe(Effect.orElseSucceed(() => Option.none()))
      : Option.none();
    const schemes = Option.isSome(settings) ? settings.value.allowedAppSchemes : [];
    return yield* Option.match(parseSafeExternalUrl(rawUrl, schemes), {
      onNone: () => Effect.succeed(false),
      onSome: (externalUrl) =>
        Effect.promise(() =>
          Electron.shell.openExternal(externalUrl).then(
            () => true,
            () => false,
          ),
        ),
    });
  }),
  openSystemSettings: Effect.fn("ElectronShell.openSystemSettings")(function (pane) {
    return Effect.promise(() =>
      Electron.shell.openExternal(MAC_PERMISSION_SETTINGS_URLS[pane]).then(
        () => true,
        () => false,
      ),
    );
  }),
  copyText: Effect.fn("ElectronShell.copyText")(function (text) {
    return Effect.promise(() => Electron.clipboard.writeText(text).catch(() => undefined));
  }),
});

export const layer = Layer.succeed(ElectronShell, make);
