const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Drizzle migrations are shipped as .sql files bundled into the app.
config.resolver.sourceExts.push('sql');

// expo-sqlite runs on web through a WebAssembly build of SQLite.
// It needs the .wasm asset resolved and the page to be cross-origin isolated.
config.resolver.assetExts.push('wasm');
config.server.enhanceMiddleware = (middleware) => (req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  return middleware(req, res, next);
};

module.exports = withNativeWind(config, { input: './src/global.css' });
