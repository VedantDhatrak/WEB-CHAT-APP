const mongoose = require('mongoose');

const memberSchema = new  mongoose.Schema({
   group_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Group',
    required: true,
   },
   user_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    required: true,
   },
   
},
{ timestamps: true }
);

module.exports = mongoose.model('Member', memberSchema);