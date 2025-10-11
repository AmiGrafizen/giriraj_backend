import userModel from '../models/user.model.js'


const getUserByEmail = async (email) => {
    return userModel.findOne({ email });
  };

const getUserByName = async (name) => {
    return userModel.findOne({ name });
  };

  const getUserById = async (id) => {
      return userModel.findById(id);
    };


export default {getUserByName,getUserByEmail,getUserById};
