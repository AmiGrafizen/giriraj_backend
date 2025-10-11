import { Schema, model } from 'mongoose';

const serviceSchema = new Schema({
  text: { 
    type: String, 
    required: true, 
},
});

const OurServices = model('OurServices', serviceSchema);

export default OurServices;
