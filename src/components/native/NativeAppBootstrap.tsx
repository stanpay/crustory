"use client";

import { useEffect } from "react";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://crustory.vercel.app";

type CapPlugin = {
  [key: string]: ((...args: unknown[]) => Promise<unknown>) | undefined;
};

function isNativeApp() {
  if (typeof window === "undefined") return false;
  const cap = (
    window as Window & {
      Capacitor?: { isNativePlatform?: () => boolean };
    }
  ).Capacitor;
  if (cap?.isNativePlatform?.()) return true;
  return /CrustoryApp|capacitor/i.test(navigator.userAgent);
}

/**
 * Runs inside the remote WebView: Kakao via external browser + push token sync.
 */
export function NativeAppBootstrap() {
  useEffect(() => {
    if (!isNativeApp()) return;

    document.documentElement.dataset.appShell = "1";

    const Cap = (
      window as Window & {
        Capacitor?: { Plugins?: Record<string, CapPlugin> };
      }
    ).Capacitor;
    const plugins = Cap?.Plugins;
    if (!plugins) return;

    const App = plugins.App;
    const Browser = plugins.Browser;
    const Network = plugins.Network;
    const PushNotifications = plugins.PushNotifications;
    const SplashScreen = plugins.SplashScreen;

    void SplashScreen?.hide?.();

    void Network?.getStatus?.().then((status) => {
      const s = status as { connected?: boolean };
      if (s && s.connected === false) {
        window.location.href = "/offline.html";
      }
    });

    void Network?.addListener?.("networkStatusChange", (s: unknown) => {
      const status = s as { connected: boolean };
      if (!status.connected) {
        console.warn("offline");
      }
    });

    async function openKakaoExternally(href: string) {
      if (!Browser?.open) {
        window.location.href = href;
        return;
      }
      const url = new URL(href, window.location.origin);
      url.searchParams.set("app", "1");
      await Browser.open({ url: url.toString() });
    }

    function onClick(e: MouseEvent) {
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (href.includes("/api/auth/kakao")) {
        e.preventDefault();
        void openKakaoExternally(href);
      }
    }
    document.addEventListener("click", onClick, true);

    void App?.addListener?.("appUrlOpen", (event: unknown) => {
      const url = (event as { url?: string }).url || "";
      if (!url.startsWith("crustory://")) return;
      try {
        const normalized = url.replace("crustory://", "https://crustory.local/");
        const parsed = new URL(normalized);
        const session = parsed.searchParams.get("session");
        const next = parsed.searchParams.get("next") || "/";
        if (!session) return;
        void Browser?.close?.();
        window.location.href =
          `${SITE.replace(/\/$/, "")}/api/auth/app-session?token=${encodeURIComponent(session)}` +
          `&next=${encodeURIComponent(next)}`;
      } catch (err) {
        console.error(err);
      }
    });

    async function registerPush() {
      const push = PushNotifications;
      if (!push?.requestPermissions || !push.register || !push.addListener) return;
      try {
        const perm = (await push.requestPermissions()) as {
          receive?: string;
        };
        if (perm.receive !== "granted") return;
        await push.register();
        await push.addListener("registration", async (token: unknown) => {
          const value = (token as { value: string }).value;
          await fetch("/api/devices/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ token: value, platform: "android" }),
          });
        });
        await push.addListener(
          "pushNotificationActionPerformed",
          (notification: unknown) => {
            const data =
              (
                notification as {
                  notification?: { data?: { url?: string } };
                }
              ).notification?.data || {};
            if (data.url) {
              window.location.href = data.url;
            } else {
              window.location.href = "/";
            }
          },
        );
      } catch (err) {
        console.error(err);
      }
    }
    void registerPush();

    return () => {
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return null;
}
