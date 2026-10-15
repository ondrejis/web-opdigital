import { execSync } from "node:child_process";

export default function (eleventyConfig) {
  // Static assets (fonts, images) are copied 1:1
  eleventyConfig.addPassthroughCopy({ "src/assets/fonts": "assets/fonts" });
  eleventyConfig.addPassthroughCopy({ "src/assets/img": "assets/img" });
  eleventyConfig.addPassthroughCopy({ "src/assets/root": "/" });

  // Bundle JS (Alpine + Motion + site scripts) with esbuild on every build
  eleventyConfig.on("eleventy.before", () => {
    execSync(
      "npx esbuild src/scripts/main.js --bundle --minify --format=iife --target=es2020 --outfile=dist/assets/js/main.js",
      { stdio: "inherit" }
    );
  });

  eleventyConfig.addWatchTarget("src/scripts/");
  eleventyConfig.addWatchTarget("src/styles/");
  eleventyConfig.setServerOptions({ watch: ["dist/assets/css/main.css"] });

  eleventyConfig.addFilter("year", () => new Date().getFullYear());
  eleventyConfig.addFilter("pad", (n) => String(n).padStart(2, "0"));
  eleventyConfig.addFilter("find", (arr, key, val) => arr.find((i) => i[key] === val));
  eleventyConfig.addFilter("where", (arr, key, val) => arr.filter((i) => i[key] === val));
  eleventyConfig.addFilter("exclude", (arr, key, val) => arr.filter((i) => i[key] !== val));

  return {
    dir: { input: "src", output: "dist", includes: "_includes", data: "_data" },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
}
