const mongoose = require("mongoose");
const collectionName = "users";
const userScehma = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  date_of_reg: {
    type: Date,
    default: Date.now,
  },
  data : {
      codes :[{
        filename: {
          type: String,
          required: true
        },
        name: {
          type: String,
          required: true
        },
        lang: {
            type: String,
            required: true
        },
        code:{
            type: String,
                required: true
        }}] 
  }
});
module.exports = mongoose.model(collectionName, userScehma);
