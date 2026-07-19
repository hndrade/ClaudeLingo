import type { NextConfig } from "next";

// Nome do repositório no GitHub, usado como basePath quando publicado em
// https://<usuario>.github.io/<repo>/ (GitHub Pages de projeto, não de usuário).
const BASE_PATH = process.env.GITHUB_ACTIONS === "true" ? "/ClaudeLingo" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: BASE_PATH,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: BASE_PATH },
};

export default nextConfig;
