import { useRef, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Platform,
  BackHandler,
  ActivityIndicator,
  Text,
  Linking,
} from "react-native";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { useEffect } from "react";

const WEB_APP_URL =
  Constants.expoConfig?.extra?.webAppUrl ||
  "https://v0-authentic-hadith.vercel.app";

export default function AppScreen() {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const insets = useSafeAreaInsets();

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

  const handleNavigationStateChange = useCallback(
    (navState: { canGoBack: boolean; url: string }) => {
      setCanGoBack(navState.canGoBack);
    },
    []
  );

  // Inject JS to handle viewport and theme color for native feel
  const injectedJS = `
    (function() {
      // Set viewport meta for proper scaling
      let meta = document.querySelector('meta[name="viewport"]');
      if (meta) {
        meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
      }
      
      // Add CSS to handle safe area insets
      const style = document.createElement('style');
      style.textContent = \`
        body {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          overscroll-behavior-y: none;
        }
      \`;
      document.head.appendChild(style);
      
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
      <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
        <Text style={styles.errorTitle}>Unable to Connect</Text>
        <Text style={styles.errorMessage}>
          Please check your internet connection and try again.
        </Text>
        <Text
          style={styles.retryButton}
          onPress={() => {
            setHasError(false);
            setIsLoading(true);
          }}
        >
          Retry
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Platform.OS === "ios" ? insets.top : 0,
        },
      ]}
    >
      <WebView
        ref={webViewRef}
        source={{ uri: WEB_APP_URL }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
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
        backgroundColor="#F8F6F2"
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#C5A059" />
          <Text style={styles.loadingText}>Loading Authentic Hadith...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F6F2",
  },
  webview: {
    flex: 1,
    backgroundColor: "#F8F6F2",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#F8F6F2",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    color: "#C5A059",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#F8F6F2",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorTitle: {
    color: "#2C2416",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  errorMessage: {
    color: "#6B5D4D",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    color: "#1B5E43",
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#1B5E43",
    borderRadius: 8,
    overflow: "hidden",
  },
});
