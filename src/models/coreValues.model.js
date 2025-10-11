import { Schema, model } from 'mongoose';

const CoreValueASchema = new Schema({
  title: { 
    type: String, 
    required: true, 
    unique: true 
},
  description: {
    type: String,
  }
});

const CoreValue = model('CoreValue', CoreValueASchema);

export default CoreValue;
