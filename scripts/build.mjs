import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import coffee from "coffeescript";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const publicDir = path.join(rootDir, "public");
const srcEntry = path.join(rootDir, "src", "main.ts");

function rm(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

const coffeePlugin = {
  name: "coffee",
  setup(buildApi) {
    buildApi.onLoad({ filter: /\.coffee$/ }, async (args) => {
      const source = await fs.promises.readFile(args.path, "utf8");
      const compiled = coffee.compile(source, { bare: true, filename: args.path });
      return { contents: compiled, loader: "js" };
    });
  },
};

rm(distDir);
fs.mkdirSync(path.join(distDir, "assets"), { recursive: true });

// Copy static assets
copyDir(publicDir, distDir);

// Copy index.html
const deployedIndexPath = path.join(distDir, "index.html");
fs.copyFileSync(path.join(rootDir, "index.html"), deployedIndexPath);

// Ensure Netlify can detect both forms from the final static HTML that will
// actually be deployed (not from source files or client-side JavaScript).
const deployedHtml = fs.readFileSync(deployedIndexPath, "utf8");
const requiredForms = [
  { id: "newsletterForm", name: "newsletter" },
  { id: "contactForm", name: "contacto" },
];

for (const { id, name } of requiredForms) {
  const openTag = deployedHtml.match(new RegExp(`<form\\b[^>]*\\bid="${id}"[^>]*>`, "i"))?.[0];
  if (!openTag) {
    throw new Error(`Netlify form #${id} is missing from the built index.html`);
  }
  if (!/\bdata-netlify=["']true["']/i.test(openTag) || !/\bmethod=["']POST["']/i.test(openTag)) {
    throw new Error(`Netlify form #${id} must declare data-netlify="true" and method="POST"`);
  }
  if (!new RegExp(`name=["']${name}["']`, "i").test(openTag)) {
    throw new Error(`Netlify form #${id} has an incorrect form name`);
  }

  const formMarkup = deployedHtml.slice(deployedHtml.indexOf(openTag));
  const formBody = formMarkup.slice(0, formMarkup.indexOf("</form>") + "</form>".length);
  if (!new RegExp(`name=["']form-name["']\\s+value=["']${name}["']`, "i").test(formBody)) {
    throw new Error(`Netlify form #${id} is missing its matching hidden form-name field`);
  }
}

// Fail the build instead of silently deploying a site without its form
// confirmation assets. The public directory is the source of static assets.
for (const file of ["newsletter-success.html", "contact-success.html", "form-success.css"]) {
  const outputFile = path.join(distDir, file);
  if (!fs.existsSync(outputFile)) {
    throw new Error(`Missing required form confirmation asset in deploy output: ${file}`);
  }
}


await build({
  entryPoints: [srcEntry],
  bundle: true,
  sourcemap: true,
  format: "esm",
  target: ["es2020"],
  outfile: path.join(distDir, "assets", "app.js"),
  plugins: [coffeePlugin],
  loader: {
    ".png": "file",
    ".jpg": "file",
    ".jpeg": "file",
    ".svg": "file",
    ".webp": "file",
  },
  logLevel: "info",
});
