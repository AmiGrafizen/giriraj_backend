import { Schema, model } from 'mongoose';

const CoreValueMainSchema = new Schema({
  title: { 
    type: String, 
    required: true, 
    unique: true 
},
  description: {
    type: String,
  }
});

const CoreValueMain = model('CoreValueMain', CoreValueMainSchema);

export default CoreValueMain;
