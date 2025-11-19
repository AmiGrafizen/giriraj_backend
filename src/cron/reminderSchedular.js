// HYGO/src/cron/reminderSchedular.js

import cron from 'node-cron';
import { hygoModels } from '../db/hygo.db.js';
import { sendNotification } from '../utils/sendNotification.js';

export const startReminderScheduler = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      // Get current UTC time and convert to IST
      const nowUTC = new Date();
      const IST_OFFSET_MINUTES = 330; // IST = UTC+5:30
      const nowIST = new Date(nowUTC.getTime() + IST_OFFSET_MINUTES * 60000);

      const currentTime = nowIST.toISOString().substring(11, 16); // "HH:mm" format
      const today = nowIST.toISOString().substring(0, 10); // "YYYY-MM-DD"

      console.log(`[${nowIST.toISOString()}] 🔍 Checking reminders for time: ${currentTime}`);

      const reminders = await hygoModels.HYGOReminder.find({
        isActive: true,
        startDate: { $lte: new Date(today + 'T23:59:59.999Z') },
        endDate: { $gte: new Date(today + 'T00:00:00.000Z') },
        'medicines.mealTimings.time': currentTime
      }).lean();

      for (const reminder of reminders) {
        const user = await hygoModels.HYGOUser.findById(reminder.userId).lean();
        if (!user?.fcmToken) continue;

        for (const med of reminder.medicines) {
          for (const meal of med.mealTimings) {
            if (meal.time === currentTime) {
              await sendNotification({
                token: user.fcmToken,
                title: `💊 ${med.medicineName}`,
                body: `Take ${med.dose} ${med.unit} at ${meal.time}`,
              });
              console.log(`✅ Sent to ${user._id} for ${med.medicineName} at ${meal.time}`);
            }
          }
        }
      }

      console.log(`[${nowIST.toISOString()}] ✅ Reminder check complete for ${currentTime}`);
    } catch (err) {
      console.error("🔴 Scheduler error:", err.message);
    }
  });

  console.log("⏱️ Reminder Scheduler initialized");
};
