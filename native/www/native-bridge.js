/* Capacitor native shell bridge — loaded from local www and injected flows via remote site. */
(function () {
  var SITE = "https://crustory.vercel.app";

  function whenCapReady(cb) {
    if (window.Capacitor && window.Capacitor.isNativePlatform()) {
      cb();
      return;
    }
    document.addEventListener("deviceready", cb, { once: true });
    // Capacitor 5+ does not fire cordova-style events; poll briefly.
    var n = 0;
    var t = setInterval(function () {
      n += 1;
      if (window.Capacitor && window.Capacitor.isNativePlatform()) {
        clearInterval(t);
        cb();
      } else if (n > 40) {
        clearInterval(t);
      }
    }, 50);
  }

  async function getPlugin(name) {
    if (!window.Capacitor || !window.Capacitor.Plugins) return null;
    return window.Capacitor.Plugins[name] || null;
  }

  async function handleDeepLink(url) {
    if (!url || url.indexOf("crustory://") !== 0) return;
    try {
      var parsed = new URL(url.replace("crustory://", "https://crustory.local/"));
      if (parsed.pathname.replace(/^\//, "") !== "auth/callback" &&
          parsed.host !== "auth" &&
          !url.includes("auth/callback")) {
        // crustory://auth/callback?... → host=auth path=/callback
      }
      var session = parsed.searchParams.get("session");
      var next = parsed.searchParams.get("next") || "/order/lookup";
      if (!session) return;
      var Browser = await getPlugin("Browser");
      if (Browser && Browser.close) {
        try {
          await Browser.close();
        } catch (_) {}
      }
      var target =
        SITE +
        "/api/auth/app-session?token=" +
        encodeURIComponent(session) +
        "&next=" +
        encodeURIComponent(next);
      window.location.href = target;
    } catch (e) {
      console.error("deeplink parse failed", e);
    }
  }

  async function setupNetwork() {
    var Network = await getPlugin("Network");
    if (!Network) return;
    try {
      var status = await Network.getStatus();
      if (!status.connected) {
        window.location.href = "offline.html";
        return;
      }
      Network.addListener("networkStatusChange", function (s) {
        if (!s.connected) {
          window.location.href = "offline.html";
        }
      });
    } catch (e) {
      console.error(e);
    }
  }

  async function setupAppUrlOpen() {
    var App = await getPlugin("App");
    if (!App) return;
    App.addListener("appUrlOpen", function (event) {
      handleDeepLink(event.url);
    });
    try {
      var launch = await App.getLaunchUrl();
      if (launch && launch.url) handleDeepLink(launch.url);
    } catch (_) {}
  }

  async function registerPush() {
    var Push = await getPlugin("PushNotifications");
    if (!Push) return;
    try {
      var perm = await Push.requestPermissions();
      if (perm.receive !== "granted") return;
      await Push.register();
      Push.addListener("registration", async function (token) {
        try {
          await fetch(SITE + "/api/devices/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ token: token.value, platform: "android" }),
          });
        } catch (e) {
          console.error("device register failed", e);
        }
      });
      Push.addListener("registrationError", function (err) {
        console.error("push registration error", err);
      });
      Push.addListener("pushNotificationActionPerformed", function (notification) {
        var data = (notification.notification && notification.notification.data) || {};
        if (data.url) {
          window.location.href = SITE + data.url;
        } else if (data.orderId) {
          window.location.href =
            SITE + "/order/lookup?orderId=" + encodeURIComponent(data.orderId);
        }
      });
    } catch (e) {
      console.error(e);
    }
  }

  whenCapReady(async function () {
    await setupNetwork();
    await setupAppUrlOpen();
    // If we are still on local index (no server.url load yet), go to site with app flag.
    if (location.protocol === "file:" || location.pathname.indexOf("offline") === -1) {
      if (!location.href.startsWith(SITE)) {
        // With server.url configured, Capacitor loads remote; local index is fallback.
      }
    }
    await registerPush();
  });
})();
