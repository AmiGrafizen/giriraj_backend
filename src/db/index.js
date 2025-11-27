import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ Load env file from project root
const envPath = path.resolve(__dirname, "../../config.env");
dotenv.config({ path: envPath });

const PRIMARY_URI = process.env.DBEV1_DB_URI;
const BACKUP_URI = process.env.MONGODB_URI;

if (!PRIMARY_URI || !BACKUP_URI) {
  console.error("❌ Missing MongoDB URIs in config.env");
  console.error("Tried to load from:", envPath);
  process.exit(1);
}

// ------------------ DB Connections ------------------
const primaryConnection = mongoose.createConnection(PRIMARY_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const backupConnection = mongoose.createConnection(BACKUP_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

primaryConnection.on("connected", () =>
  console.log("🟢 Connected to PRIMARY MongoDB")
);
backupConnection.on("connected", () =>
  console.log("🟢 Connected to BACKUP MongoDB")
);
primaryConnection.on("error", (err) =>
  console.error("🔴 PRIMARY DB Error:", err)
);
backupConnection.on("error", (err) =>
  console.error("🔴 BACKUP DB Error:", err)
);

// ------------------ Auto-load all models ------------------
const models = {};
const modelsPath = path.join(__dirname, "..", "models");

if (fs.existsSync(modelsPath)) {
  const files = fs.readdirSync(modelsPath);
  for (const file of files) {
    if (file.endsWith(".model.js")) {
      const fullPath = path.join(modelsPath, file);
      const moduleURL = pathToFileURL(fullPath).href;
      const schemaModule = await import(moduleURL);
      const schema = schemaModule?.default;

      if (!schema || !(schema instanceof mongoose.Schema)) {
        console.warn(`[⚠️] Skipped invalid schema in ${file}`);
        continue;
      }

      const base = file.replace(".model.js", "");
      const name = base.charAt(0).toUpperCase() + base.slice(1);
      const modelName = `GIRIRAJ${name}`;

      models[modelName] = {
        primary: primaryConnection.model(modelName, schema),
        backup: backupConnection.model(modelName, schema),
      };

      console.log(`✅ Loaded model in both DBs: ${modelName}`);
    }
  }
} else {
  console.warn("⚠️ Models folder not found:", modelsPath);
}

// ------------------ Runtime DB Switch ------------------
let activeDB = process.env.DEFAULT_DB || "primary"; // "primary" | "backup"

function usePrimaryDB() {
  activeDB = "primary";
  console.log("🔄 Switched to PRIMARY database");
}

function useBackupDB() {
  activeDB = "backup";
  console.log("🔄 Switched to BACKUP database");
}

function getActiveModel(modelName) {
  const entry = models[modelName];
  if (!entry) throw new Error(`Model ${modelName} not found`);
  return activeDB === "backup" ? entry.backup : entry.primary;
}

// ------------------ Helper: Save to both DBs ------------------
async function saveToBoth(modelName, data) {
  const entry = models[modelName];
  if (!entry) throw new Error(`Model ${modelName} not found`);

  try {
    const [main, backup] = await Promise.all([
      entry.primary.create(data),
      entry.backup.create(data),
    ]);
    console.log(`📦 Saved ${modelName} in both DBs`);
    return main;
  } catch (err) {
    console.error(`⚠️ Failed to save ${modelName} in both DBs:`, err.message);
    throw err;
  }
}

export {
  primaryConnection,
  backupConnection,
  models as girirajModels,
  saveToBoth,
  getActiveModel,
  usePrimaryDB,
  useBackupDB,
};
