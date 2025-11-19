import mongoose from "mongoose";

const bedSchema = new mongoose.Schema({
  wardName: { type: String, required: true },
  start: { type: Number, required: true, unique: true} ,
  end: { type: Number, required: true, unique: true },
}, { timestamps: true });


export default bedSchema;
