const mongoose = require('mongoose');
const { User } = require('./userModel');
mongoose.Promise = global.Promise;
const faker = require('faker');

//***** remove created, mongoose auto creates */ timestamp: true
//https://mongoosejs.com/docs/guide.html#timestamps
//https://github.com/CodeDemos/demo-mongoose-relationships/blob/master/subdocument.js

// change name to wishSchema
//change dates to timestamps
const wishSchema = mongoose.Schema(
  {
    wishItem: String
  },
  {
    timestamps: true
  }
);

//virtual for full name - remove fullname, two properties for first /last (last name required)
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

//on front end, add conditional if there is a last name firstname+lastName
//don't serve crap data via api

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

// function generateRelationship() {
//   const relationship = [
//     'Mom',
//     'Dad',
//     'Friend',
//     'Brother',
//     'Sister',
//     'Boyfriend',
//     'Girlfriend',
//     'Aunt',
//     'Uncle'
//   ];
//   return relationship[Math.floor(Math.random() * relationship.length)];
// }

// let jerry = new User({
//         _id: new mongoose.Types.ObjectId(),
//         userName: faker.internet.userName(),
//         password: faker.internet.password(),
//         firstName: faker.name.firstName(),
//         lastName: faker.name.lastName(),
//         email: faker.internet.email()
// });

// let jerrysDad = new Profile({
  // owner: "5bf091289a5cad30c391ebdd",
  // firstName: faker.name.firstName(),
  // lastName: faker.name.lastName(),
  // relationship: generateRelationship(),
  // birthday: faker.date.past(),
  // address: {
  //   streetName: faker.address.streetName(),
  //   city: faker.address.city(),
  //   state: faker.address.state(),
  //   zipCode: faker.address.zipCode()
  // },
  // wishList: [
  //   { wishItem: faker.random.words() },
  //   { wishItem: faker.random.words() },
  //   { wishItem: faker.random.words() }
  // ]
// });

// jerrysDad.save(err => {
//   if (err) console.log(err);
// });

module.exports = { Profile };
