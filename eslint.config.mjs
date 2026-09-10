import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // React Three Fiber uses three.js property names on JSX elements (position, intensity, args...).
      "react/no-unknown-property": "off",
    },
  },
  {
    // React Bits components are vendored as-is.
    files: ["src/components/Ballpit.tsx", "src/components/BlurText.tsx", "src/components/CountUp.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
