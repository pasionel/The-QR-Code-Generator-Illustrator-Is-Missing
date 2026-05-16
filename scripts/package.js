const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const stagingRoot = path.join(dist, "staging");
const extensionName = "com.rj.qrcodeillustrator";
const installerName = "QR-Code-Generator-Illustrator-mac";
const stagingExtension = path.join(stagingRoot, extensionName);
const zipPath = path.join(dist, `${extensionName}.zip`);
const installerRoot = path.join(stagingRoot, installerName);
const installerExtension = path.join(installerRoot, extensionName);
const installerZipPath = path.join(dist, `${installerName}.zip`);

const include = [
  "CSXS",
  "css",
  "js",
  "jsx",
  "lib",
  "index.html",
  "install-macos.sh",
  "LICENSE",
  "README.md",
  "THIRD_PARTY_NOTICES.md",
  "package.json"
];

function copyRecursive(source, target) {
  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      copyRecursive(path.join(source, entry), path.join(target, entry));
    }
    return;
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  fs.chmodSync(target, stat.mode);
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(stagingExtension, { recursive: true });
fs.mkdirSync(installerExtension, { recursive: true });

for (const item of include) {
  copyRecursive(path.join(root, item), path.join(stagingExtension, item));
  copyRecursive(path.join(root, item), path.join(installerExtension, item));
}

copyRecursive(path.join(root, "install.command"), path.join(installerRoot, "install.command"));

execFileSync("zip", ["-qr", zipPath, extensionName], {
  cwd: stagingRoot,
  stdio: "inherit"
});

execFileSync("zip", ["-qr", installerZipPath, installerName], {
  cwd: stagingRoot,
  stdio: "inherit"
});

fs.rmSync(stagingRoot, { recursive: true, force: true });
console.log(`Created ${zipPath}`);
console.log(`Created ${installerZipPath}`);
