import { Schema, model } from 'mongoose';

const TeamSchema = new Schema({
  name: { 
    type: String, 
    required: true, 
},
image: {
    type: String,
},
  role: {
    type: String,
    required: true,
  },
 
});

const Team = model('Team', TeamSchema);

export default Team;

