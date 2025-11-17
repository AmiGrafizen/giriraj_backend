import { mtModels } from '../db/index.js';


const getUserByEmail = async (email) => {
    return mtModels?.MTUser?.findOne({ email });
  };

const getUserByName = async (name) => {
    return mtModels?.MTUser?.findOne({ name });
  };

  const getUserById = async (id) => {
      return mtModels?.MTUser?.findById(id);
    };


export default {getUserByName,getUserByEmail,getUserById};
