import { Schema, model } from 'mongoose';

const VisionSchema = new Schema({
  title: { 
    type: String, 
    required: true, 
    unique: true 
},
  description: {
    type: String,
  }
});

const Vision = model('Vision', VisionSchema);

export default Vision;
