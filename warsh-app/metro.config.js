const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Expo web serves the Metro bundle as a classic script in development.
// Some package-export ESM builds, notably zustand, can leave import.meta in
// that bundle, which prevents the app from mounting in Chrome.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
