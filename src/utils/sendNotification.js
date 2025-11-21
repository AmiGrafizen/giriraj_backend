  import admin from "../config/firebase.js";

  export const sendNotification = async (payload) => {
    try {
      const message = {
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {}, // Optional custom data
        topic: payload.topic || undefined, // if sending to a topic
        token: payload.token || undefined, // if sending to a single device
      };

      console.log('message', message)

      const response = await admin.messaging().send(message);
      console.log("Notification sent successfully:", response);
    } catch (error) {
      console.error("Error sending notification:", error.message);
    }
  };
