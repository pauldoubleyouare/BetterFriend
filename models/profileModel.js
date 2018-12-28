const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const wishSchema = mongoose.Schema(
  {
    wishItem: String
  },
  {
    timestamps: true
  }
);

const profileSchema = mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: String,
    relationship: String,
    birthday: Date,
    address: {
      streetName: String,
      city: String,
      state: String,
      zipCode: String
    },
    phone: String,
    wishList: [wishSchema]
  },
  {
    timestamps: true
  },
  { collection: 'Profile' }
);

profileSchema.virtual('fullName').get(function() {
  return this.firstName + ' ' + this.lastName;
});

profileSchema.methods.serialize = function() {
  return {
    owner: this.owner,
    _id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    relationship: this.relationship,
    email: this.email,
    birthday: this.birthday,
    address: this.address,
    phone: this.phone,
    wishList: this.wishList,
    timestamps: this.timestamps
  };
};

let Profile = mongoose.model('Profile', profileSchema, 'Profiles');

module.exports = { Profile };
