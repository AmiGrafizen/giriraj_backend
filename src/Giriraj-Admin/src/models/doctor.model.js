import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gujName: { type: String, required: true} ,
  hindiName: { type: String, required: true },
  qualification: { type: String, required: true },            
}, { timestamps: true });


export default doctorSchema;
