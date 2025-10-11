import { ApiError } from "../utils/ApiError.js";
// import  asyncHandler  from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";


const authenticateAdmin = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
  
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); 
      req.user = decoded;
  
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'You do not have permission to access this resource' });
      }
  
      next();
    } catch (err) {
      // res.status(401).json({ error: 'Invalid or expired token' });
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token has expired' });
      } else {
        return res.status(401).json({ error: 'Invalid token' });
      }
    }
  };

const authenticateUser = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
  
    if (!token) {
      return next(new ApiError(401, 'No token provided.'));
    }
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);  
      req.sub = decoded;  
      const user = await User.findById(decoded.sub); 
  
      if (!user) {
        return next(new ApiError(404, 'User not found.'));
      }

      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new ApiError(401, 'Token has expired.'));
      } else {
        return next(new ApiError(401, 'Invalid token.'));
      }
    }
  };
  
export default {authenticateAdmin,authenticateUser}  