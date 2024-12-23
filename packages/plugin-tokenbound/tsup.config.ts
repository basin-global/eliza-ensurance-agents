import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: {
        compilerOptions: {
            moduleResolution: "node",
            skipLibCheck: true
        }
    },
    clean: true,
    sourcemap: true,
    external: [
        "dotenv",
        "fs",
        "path",
        "https",
        "http",
        "@elizaos/core",
        "viem",
        "viem/chains",
        "viem/accounts"
    ]
});