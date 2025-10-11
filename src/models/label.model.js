import { Schema, model } from 'mongoose';

const WhyChooseUsSchema = new Schema({
  title: { type: String, required: true, unique: true },
  text: String,
  headText: String
});

const WhyChooseUs = model('WhyChooseUs', WhyChooseUsSchema);

export default WhyChooseUs;
