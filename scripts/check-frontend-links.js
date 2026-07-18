import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const frontendRoot = path.join(projectRoot, "frontend");
const failures = [];

checkHtmlFile(path.join(frontendRoot, "index.html"));
for (const fileName of readdirSync(path.join(frontendRoot, "pages"))) {
  if (fileName.endsWith(".html")) {
    checkHtmlFile(path.join(frontendRoot, "pages", fileName));
  }
}

for (const jsFile of walkFiles(path.join(frontendRoot, "js"), ".js")) {
  const source = readFileSync(jsFile, "utf8");
  for (const match of source.matchAll(/from\s+["']([^"']+)["']/g)) {
    const reference = match[1];
    if (reference.startsWith(".")) {
      assertLocalReference(jsFile, reference);
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Frontend static references passed.");

function checkHtmlFile(filePath) {
  const source = readFileSync(filePath, "utf8");
  for (const match of source.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
    const reference = match[1];
    if (!isExternalReference(reference)) {
      assertLocalReference(filePath, reference);
    }
  }
}

function assertLocalReference(sourceFile, reference) {
  const cleanReference = reference.split(/[?#]/, 1)[0];
  const resolvedPath = path.resolve(path.dirname(sourceFile), cleanReference);
  if (!existsSync(resolvedPath)) {
    failures.push(`${path.relative(projectRoot, sourceFile)} -> missing ${reference}`);
  }
}

function isExternalReference(reference) {
  return /^(?:[a-z]+:|#|\/\/)/i.test(reference);
}

function walkFiles(directory, extension) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return walkFiles(entryPath, extension);
    }
    return entry.isFile() && entry.name.endsWith(extension) ? [entryPath] : [];
  });
}

