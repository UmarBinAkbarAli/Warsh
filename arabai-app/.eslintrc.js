module.exports = {
  root: true,
  extends: ["universe/native", "universe/shared/typescript-analysis"],
  ignorePatterns: [
    "android/",
    "node_modules/",
    ".expo/",
    "eas-build-*.log",
    "*.decoded.log",
  ],
  overrides: [
    {
      files: ["*.ts", "*.tsx", "*.d.ts"],
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
  ],
};
