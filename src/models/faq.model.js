import { Schema, model } from 'mongoose';

const faqSchema = new Schema({
  question: { 
    type: String, 
    required: true, 
    unique: true 
},
  answer: {
    type: String,
    required: true,
  }
});

const faq = model('faq', faqSchema);

export default faq;
