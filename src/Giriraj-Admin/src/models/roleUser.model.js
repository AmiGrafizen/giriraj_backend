import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'GIRIRAJRole', required: true },
  loginEnabled: { type: Boolean, default: true },
  avatar: { type: String },
}, { timestamps: true });


export default userSchema;
