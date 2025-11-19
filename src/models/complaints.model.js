// models/Complaint.model.js
import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  patientName: String,
  bedNumber: String,
  contact: String,
  department: String,
  doctor: String,
  dateTime: Date,
  category: String,
  description: String,
  assignedTo: String,
  escalationRemarks: String,
  expectedResolution: Date,
  status: { type: String, enum: ['Pending', 'Resolved'], default: 'Pending' },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  attachments: [String],
  activities: [
    {
      action: String,
      by: String,
      time: Date,
    }
  ],
}, {
  timestamps: true
});

export default complaintSchema;
