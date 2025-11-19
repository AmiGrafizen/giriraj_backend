import dotenv from "dotenv";
import { primaryConnection, backupConnection } from "./db/index.js";
import app from "./app.js";

dotenv.config({ path: "./config.env" });

async function connectDatabases() {
  try {
    // ✅ Wait for both connections to be ready
    await Promise.all([
      primaryConnection.asPromise(),
      backupConnection.asPromise(),
    ]);

    console.log("✅ Both MongoDB databases connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

connectDatabases()
  .then(() => {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`⚙️ Server is running at port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect databases:", err);
    process.exit(1);
  });
