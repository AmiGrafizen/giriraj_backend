import { Schema, model } from 'mongoose';

const MissionSchema = new Schema({
  title: { 
    type: String, 
    required: true, 
    unique: true 
},
  description: {
    type: String,
  }
});

const Mission = model('Mission', MissionSchema);

export default Mission;
