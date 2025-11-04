#!/usr/bin/env node

/**
 * Script de test simple pour ESM
 * Alternative à Jest pour éviter les problèmes de modules ESM
 */

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readdir } from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
};

console.log(
  `${COLORS.bright}${COLORS.blue}🧪 Lancement des tests API Porsche${COLORS.reset}\n`
);

// Fonction pour exécuter les tests avec node --test
async function runTests() {
  const testsDir = join(__dirname, "tests", "integration");

  // Trouver tous les fichiers .test.js
  const testFiles = [];

  async function findTestFiles(dir) {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        await findTestFiles(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".test.js")) {
        testFiles.push(fullPath);
      }
    }
  }

  await findTestFiles(testsDir);

  console.log(
    `${COLORS.blue}📋 ${testFiles.length} fichiers de test trouvés${COLORS.reset}\n`
  );

  // Exécuter chaque fichier de test
  let passed = 0;
  let failed = 0;

  for (const testFile of testFiles) {
    const relativePath = testFile.replace(__dirname + "/", "");
    console.log(`${COLORS.yellow}▶ ${relativePath}${COLORS.reset}`);

    const result = await new Promise((resolve) => {
      const child = spawn("node", ["--test", testFile], {
        stdio: "inherit",
        env: { ...process.env, FORCE_COLOR: "1" },
      });

      child.on("close", (code) => {
        resolve(code === 0);
      });
    });

    if (result) {
      passed++;
      console.log(`${COLORS.green}✓ PASSED${COLORS.reset}\n`);
    } else {
      failed++;
      console.log(`${COLORS.red}✗ FAILED${COLORS.reset}\n`);
    }
  }

  // Résumé
  console.log(`\n${COLORS.bright}${"=".repeat(60)}${COLORS.reset}`);
  console.log(`${COLORS.bright}📊 Résumé des tests${COLORS.reset}`);
  console.log(`${COLORS.bright}${"=".repeat(60)}${COLORS.reset}`);
  console.log(`Total: ${testFiles.length}`);
  console.log(`${COLORS.green}✓ Réussis: ${passed}${COLORS.reset}`);
  console.log(`${COLORS.red}✗ Échoués: ${failed}${COLORS.reset}`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((error) => {
  console.error(`${COLORS.red}Erreur fatale:${COLORS.reset}`, error);
  process.exit(1);
});
