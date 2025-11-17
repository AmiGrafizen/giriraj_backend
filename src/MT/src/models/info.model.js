  import { Schema, model } from 'mongoose';

  const infoSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "MTUser", required: true},
    firmName: { type: String },
    firmType: { type: String },
    address: { type: String },
    state: { type: String },
    city: { type: String },
    pinCode: { type: String },
    gstNumber: { type: String },
    panNumber: { type: String },
    holderName: { type: String, required: true },
    accountNo: { type: String, required: true },
    accountType: { type: String, enum: ['saving', 'current', 'od', 'cc', 'others'], default: 'saving' },
    bankName: { type: String },
    IFSCCode: { type: String },
    bankAddress: { type: String },
    beginingFrom: { type: String},
    terms: { type: String},
    invoicePrefix: { type: String},
    invoiceNumber: { type: String},
    TCSApply: { type: Boolean, default: false},
    dealerType: { type: String, enum: ['regular', 'composition'], default: 'regular'},
    type: { type: String, enum: ['jewellery', 'other jewellery'], default: 'jewellery'},
    billType: { type: String, enum: ['only', 'inventory'], default: 'only'},
    image: { type: String }
  });

export default infoSchema;
