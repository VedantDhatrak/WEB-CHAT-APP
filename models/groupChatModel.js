// const mongoose = require('mongoose');

// const groupChatSchema = new  mongoose.Schema({
//    sender_id:{
//     type: mongoose.Schema.Types.ObjectId,
//     ref:'User'
//    },
//    group_id:{
//     type: mongoose.Schema.Types.ObjectId,
//     ref:'Group'
//    },
//    message:{
//     type: String,
//     required: true
//    }
// },
// { timestamps: true }
// );

// module.exports = mongoose.model('groupChat', groupChatSchema);

//debugging 
const mongoose = require('mongoose');

const groupChatSchema = new mongoose.Schema(
  {
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    group_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

// Ensure sender_id and group_id are stored as ObjectId
groupChatSchema.pre('save', function (next) {
  if (!mongoose.Types.ObjectId.isValid(this.sender_id)) {
    return next(new Error('Invalid sender_id'));
  }
  if (!mongoose.Types.ObjectId.isValid(this.group_id)) {
    return next(new Error('Invalid group_id'));
  }
  next();
});

module.exports = mongoose.model('GroupChat', groupChatSchema);
