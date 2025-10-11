import { Schema, model } from 'mongoose';

const VisionAndMissionSchema = new Schema({
  title: { 
    type: String, 
    required: true, 
    unique: true 
},
  description: {
    type: String,
  }
});

const VisionAndMission = model('VisionAndMission', VisionAndMissionSchema);

export default VisionAndMission;
