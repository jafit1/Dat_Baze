import fs from "node:fs";

const path = "/home/ubuntu/personal-account-vault/client/src/pages/Home.tsx";
const source = fs.readFileSync(path, "utf8");
const target = 'onClick={exportVault}';
if (!source.includes(target)) throw new Error("Export header handler not found");
const next = source.replace(target, 'onClick={() => exportVault("json")}');
fs.writeFileSync(path, next);
console.log("Export header handler fixed.");
