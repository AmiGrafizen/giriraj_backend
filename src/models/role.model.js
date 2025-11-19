import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
  module: { type: String, required: true },   
  permissions: [{ type: String }],            
}, { _id: false });

const roleSchema = new mongoose.Schema({
  roleName: { type: String, required: true, unique: true },
  permissions: [permissionSchema],            
}, { timestamps: true });


export default roleSchema;
