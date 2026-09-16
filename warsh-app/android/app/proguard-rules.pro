# Warsh release keep rules. R8 runs on release builds only
# (android.enableProguardInReleaseBuilds in gradle.properties). Most libraries
# ship their own consumer rules (React Native, Hermes, Expo modules, expo-image,
# react-native-iap, nitro-google-signin, Sentry, Mixpanel, Play Core); only the
# gaps found by build warnings or runtime breakage are listed here.

# Nitro Modules core: hybrid objects are instantiated from C++ over JNI, which
# R8 cannot trace. nitro-google-signin keeps its own classes but not the core.
-keep class com.margelo.nitro.** { *; }
-dontwarn com.margelo.nitro.**

# Expo's Kotlin runtime converts JS props/args into Kotlin records and enums
# through kotlin-reflect (memberProperties, findAnnotation, primary constructors).
# expo-modules-core's consumer rules keep Record implementations by name, but
# R8's optimizer still merged/inlined the converter internals and every
# expo-image prop failed at runtime with "Cannot create a record of the type:
# 'expo.modules.image.records.ImageTransition?'" (verified on the 2026-09-16
# build, no illustrations rendered). Keep the whole Expo runtime intact.
-keep class expo.modules.** { *; }
-dontwarn expo.modules.**

# Warsh's own native modules are reached through NativeModule (kept by React
# Native's rules); Play Core in-app update callbacks are reflection-free.
-keep class com.warsh.app.** { *; }

# Sentry React Native reads the Android SDK's options and replay classes by name.
-keep class io.sentry.** { *; }
-dontwarn io.sentry.**

# Keep source file names and line numbers so Play and Sentry can deobfuscate
# stack traces through the mapping file shipped in the AAB.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
