import { useRef, useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  Platform,
  BackHandler,
  ActivityIndicator,
  Text,
  Linking,
  useColorScheme,
  TouchableOpacity,
} from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Constants from "expo-constants";
import Purchases from "react-native-purchases";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import { useRevenueCat } from "../providers/RevenueCatProvider";

const WEB_APP_URL =
  Constants.expoConfig?.extra?.webAppUrl ||
  "https://v0-authentic-hadith.vercel.app";

const COLORS = {
  light: {
    background: "#F8F6F2",
    accent: "#C5A059",
    title: "#2C2416",
    subtitle: "#6B5D4D",
    buttonBorder: "#1B5E43",
    buttonText: "#1B5E43",
  },
  dark: {
    background: "#1A1A1A",
    accent: "#C5A059",
    title: "#F8F6F2",
    subtitle: "#A89B8C",
    buttonBorder: "#4a9973",
    buttonText: "#4a9973",
  },
};

export default function AppScreen() {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const insets = useSafeAreaInsets();
  const { isPro, restorePurchases, refreshCustomerInfo } = useRevenueCat();
  const colorScheme = useColorScheme();
  const colors = COLORS[colorScheme === "dark" ? "dark" : "light"];

  // Handle Android back button
  useEffect(() => {
    if (Platform.OS !== "android") return;

    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    });

    return () => handler.remove();
  }, [canGoBack]);

  // Send subscription status to webview whenever it changes
  useEffect(() => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        window.__NATIVE_SUBSCRIPTION_STATUS__ = ${JSON.stringify({ isPro })};
        window.dispatchEvent(new CustomEvent('nativeSubscriptionUpdate', { detail: { isPro: ${isPro} } }));
        true;
      `);
    }
  }, [isPro]);

  // Handle messages from the WebView (purchase requests, restore, etc.)
  const handleWebViewMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        switch (data.type) {
          case "SHOW_PAYWALL": {
            const result = await RevenueCatUI.presentPaywallIfNeeded({
              requiredEntitlementIdentifier: "RedLantern Studios Pro",
            });

            const success =
              result === PAYWALL_RESULT.PURCHASED ||
              result === PAYWALL_RESULT.RESTORED;

            webViewRef.current?.injectJavaScript(`
              window.dispatchEvent(new CustomEvent('nativePaywallResult', { detail: { success: ${success} } }));
              true;
            `);
            break;
          }

          case "RESTORE_PURCHASES": {
            const restored = await restorePurchases();
            webViewRef.current?.injectJavaScript(`
              window.dispatchEvent(new CustomEvent('nativeRestoreResult', { detail: { success: ${restored} } }));
              true;
            `);
            break;
          }

          case "CHECK_SUBSCRIPTION": {
            await refreshCustomerInfo();
            webViewRef.current?.injectJavaScript(`
              window.__NATIVE_SUBSCRIPTION_STATUS__ = ${JSON.stringify({ isPro })};
              window.dispatchEvent(new CustomEvent('nativeSubscriptionUpdate', { detail: { isPro: ${isPro} } }));
              true;
            `);
            break;
          }

          case "USER_LOGIN": {
            if (data.userId) {
              try {
                await Purchases.logIn(data.userId);
                await refreshCustomerInfo();
              } catch (err) {
                console.error("[RevenueCat] Login error:", err);
              }
            }
            break;
          }

          case "USER_LOGOUT": {
            try {
              await Purchases.logOut();
            } catch (err) {
              console.error("[RevenueCat] Logout error:", err);
            }
            break;
          }

          case "PAGE_LOADED": {
            webViewRef.current?.injectJavaScript(`
              window.__NATIVE_SUBSCRIPTION_STATUS__ = ${JSON.stringify({ isPro })};
              window.__IS_NATIVE_APP__ = true;
              true;
            `);
            break;
          }

          default:
            break;
        }
      } catch {
        // Not a JSON message or unhandled type, ignore
      }
    },
    [isPro, restorePurchases, refreshCustomerInfo]
  );

  const handleNavigationStateChange = useCallback(
    (navState: { canGoBack: boolean; url: string }) => {
      setCanGoBack(navState.canGoBack);
    },
    []
  );

  // Inject JS to handle viewport and native app detection
  const injectedJS = `
    (function() {
      // Set viewport meta for proper scaling
      let meta = document.querySelector('meta[name="viewport"]');
      if (meta) {
        meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
      }

      // Add CSS to handle safe area insets and native feel
      const style = document.createElement('style');
      style.textContent = \`
        body {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          overscroll-behavior-y: none;
        }
        /* Hide elements that don't make sense in native app */
        .native-hidden {
          display: none !important;
        }
      \`;
      document.head.appendChild(style);

      // Mark as native app for the web code to detect
      window.__IS_NATIVE_APP__ = true;

      // Notify React Native when page is ready
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PAGE_LOADED' }));

      true;
    })();
  `;

  // Handle external links (open in system browser)
  const handleShouldStartLoadWithRequest = useCallback(
    (request: { url: string }) => {
      const url = request.url;

      // Allow navigation within the app
      if (url.startsWith(WEB_APP_URL)) return true;
      if (url.startsWith("about:")) return true;

      // Open external links in system browser
      Linking.openURL(url).catch(() => {});
      return false;
    },
    []
  );

  if (hasError) {
    return (
      <View
        style={[
          styles.errorContainer,
          { paddingTop: insets.top, backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.errorTitle, { color: colors.title }]}>
          Unable to Connect
        </Text>
        <Text style={[styles.errorMessage, { color: colors.subtitle }]}>
          Please check your internet connection and try again.
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { borderColor: colors.buttonBorder }]}
          onPress={() => {
            setHasError(false);
            setIsLoading(true);
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.retryButtonText, { color: colors.buttonText }]}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Platform.OS === "ios" ? insets.top : 0,
          backgroundColor: colors.background,
        },
      ]}
    >
      <WebView
        ref={webViewRef}
        source={{ uri: WEB_APP_URL }}
        style={[styles.webview, { backgroundColor: colors.background }]}
        onNavigationStateChange={handleNavigationStateChange}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        onMessage={handleWebViewMessage}
        injectedJavaScript={injectedJS}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          if (nativeEvent.statusCode >= 500) {
            setHasError(true);
          }
        }}
        // Performance optimizations
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        allowsBackForwardNavigationGestures={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        // Cache settings
        cacheEnabled={true}
        cacheMode="LOAD_DEFAULT"
        // iOS specific
        allowsLinkPreview={false}
        sharedCookiesEnabled={true}
        // Android specific
        thirdPartyCookiesEnabled={true}
        textZoom={100}
        overScrollMode="never"
        // Match app background on load
        backgroundColor={colors.background}
      />
      {isLoading && (
        <View
          style={[
            styles.loadingOverlay,
            { backgroundColor: colors.background },
          ]}
        >
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.accent }]}>
            Loading Authentic Hadith...
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  retryButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
});
