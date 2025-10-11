import dotenv from "dotenv";
import connectDB from "./db/index.js";
import http from "http";
import { Server } from "socket.io";
import { app } from './app.js';
import { initSocket } from "./socket/index.js";

dotenv.config({ path: "./config.env" });

const PORT = process.env.PORT || 3000;

connectDB()
  .then(async () => {
    // 1. Create HTTP server with Express app
    const server = http.createServer(app);

    // 2. Attach socket.io
    const io = new Server(server, {
      cors: { origin: "*" }, // or restrict to frontend domain
    });

    // 3. Initialize socket events
    initSocket(io);

    // 4. Store io in app (so controllers can use it)
    app.set("io", io);

    // 5. Start server
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`⚙️ Server running on port: ${PORT}`);
    });

    // 6. Start schedulers if needed
    // try {
    //   const { startReminderScheduler } = await import("./HYGO/src/cron/reminderSchedular.js");
    //   startReminderScheduler();
    // } catch (err) {
    //   console.error("🚨 Scheduler failed to start:", err);
    // }
  })
  .catch((err) => {
    console.log("❌ MongoDB connection failed:", err);
  });
