import Imap from "imap";
import { simpleParser } from "mailparser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { EmailReply } from "../model/EmailReply.model.js";

dotenv.config();

const imap = new Imap({
  user: process.env.GMAIL_USER,
  password: process.env.GMAIL_APP_PASS,
  host: "imap.gmail.com",
  port: 993,
  tls: true,
});

const openInbox = (cb) => imap.openBox("INBOX", false, cb);

imap.once("ready", () => {
  openInbox((err, box) => {
    if (err) throw err;

    imap.search(["UNSEEN", ["SINCE", new Date()]], (err, results) => {
      if (!results || !results.length) {
        console.log("No new replies");
        return imap.end();
      }

      const f = imap.fetch(results, { bodies: "" });
      f.on("message", (msg) => {
        msg.on("body", (stream) => {
          simpleParser(stream, async (err, parsed) => {
            const { from, subject, text } = parsed;
            console.log("Reply received:", from.text, subject, text);

            await EmailReply.create({ from: from.text, subject, message: text });
          });
        });
      });

      f.once("end", () => imap.end());
    });
  });
});

imap.once("error", (err) => console.error("IMAP Error:", err));
imap.once("end", () => console.log("IMAP connection closed"));

mongoose.connect(process.env.MONGO_URI).then(() => {
  imap.connect();
});
