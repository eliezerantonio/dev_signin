import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

export const UserSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
});
// Takes 2 parameters: this is an asynchronous post hook
UserSchema.post('save', async function (doc, next) {
  try {
    if (this.isModified('password')) {
      return next();
    }

    this['password'] = await bcrypt.hash(this['password'], 10);
  } catch (error) {
    return next(error);
  }
});
