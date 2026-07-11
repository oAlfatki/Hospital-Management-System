import fs from "node:fs";
import path from "node:path";

function addGitKeep(folder) {
  const files = fs.readdirSync(folder);

  if (files.length === 0) {
    fs.writeFileSync(path.join(folder, ".gitkeep"), "");
    console.log(`Created: ${path.join(folder, ".gitkeep")}`);
    return;
  }

  for (const file of files) {
    const fullPath = path.join(folder, file);

    if (fs.statSync(fullPath).isDirectory()) {
      addGitKeep(fullPath);
    }
  }
}

addGitKeep("./src");
