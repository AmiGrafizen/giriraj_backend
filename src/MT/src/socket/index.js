  export const initSocket = (io) => {
    io.on("connection", (socket) => {
      console.log("✅ New client connected:", socket.id);

      // optional: listen for client pings
      socket.on("ping", (msg) => {
        console.log("📩 Client pinged:", msg);
        socket.emit("pong", "Hello from server 👋");
      });

      socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
      }); 
    });
  };
