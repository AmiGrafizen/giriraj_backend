import { Schema, SchemaTypes, model } from 'mongoose';


const infoSchema = Schema(
  {
    phoneNumber: {
      type: String,
    },
    email: {
      type: String,
    },
    address: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const CompanyInfo = model('CompanyInfo', infoSchema);

export default CompanyInfo;
