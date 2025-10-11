import { Schema, model } from 'mongoose';

const WhatWeOfferSchema = new Schema({
  title: { 
    type: String, 
    required: true, 
},
image: {
    type: String,
},
  description: {
    type: String,
    required: true,
  },
 
});

const WhatWeOffer = model('WhatWeOffer', WhatWeOfferSchema);

export default WhatWeOffer;

