import { Schema, model } from 'mongoose';

const heroSectionSchema = new Schema({
  image: { 
    type: String, 
    required: true, 
},
});

const HeroSection = model('HeroSection', heroSectionSchema);

export default HeroSection;
