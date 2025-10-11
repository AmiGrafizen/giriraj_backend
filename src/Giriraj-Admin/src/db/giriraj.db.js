import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

// Resolve __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load your custom config.env file explicitly
dotenv.config({ path: path.resolve(__dirname, '../../../../config.env') });

// 🧠 Debug check — see if your DB URI loads correctly
console.log('Loaded MONGODB_URI:', process.env.MONGODB_URI);

// Safety check before using it
if (!process.env.MONGODB_URI) {
  throw new Error('❌ MONGODB_URI is not defined. Check your config.env path or variable name.');
}

// ✅ Create Mongoose connection
const girirajConnection = mongoose.createConnection(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Initialize models object
const models = {};

// Path to models directory
const modelsPath = path.join(__dirname, '..', 'models');

// Read all files from models directory
const files = fs.readdirSync(modelsPath);

for (const file of files) {
  if (file.endsWith('.model.js')) {
    const fullPath = path.join(modelsPath, file);
    const moduleURL = pathToFileURL(fullPath).href;

    const schemaModule = await import(moduleURL);
    const schema = schemaModule?.default;

    // Validate that it's a Mongoose schema
    if (!schema || !(schema instanceof mongoose.Schema)) {
      console.warn(`[WARN] Skipped invalid schema in file: ${file}`);
      continue;
    }

    // Convert filename to PascalCase model name
    const baseName = file.replace('.model.js', '');
    const pascalCaseName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
    const modelName = `GIRIRAJ${pascalCaseName}`;

    // Register model
    models[modelName] = girirajConnection.model(modelName, schema);
    console.log(`✅ Loaded model: ${modelName}`);
  }
}

// Export the connection and all models
export { girirajConnection, models as girirajModels };
