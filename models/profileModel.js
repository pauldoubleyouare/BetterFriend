const mongoose = require('mongoose');
const { User } = require('./userModel');
mongoose.Promise = global.Promise;
const faker = require('faker');

//***** remove created, mongoose auto creates */ timestamp: true 
const wishListSchema = mongoose.Schema({
  wishItem: String,
  created: {
    type: Date,
    default: Date.now
  }
});

// let WishList = mongoose.model('WishList', wishListSchema);

const profileSchema = mongoose.Schema(
  {
    // _id: mongoose.Schema.Types.ObjectId,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fullName: {
      firstName: {
        type: String,
        required: true
      },
      lastName: String
    },
    email: String,
    relationship: String,
    birthday: String,
    address: {
      streetName: String,
      city: String,
      state: String,
      zipcode: Number
    },
    phone: String,
    wishList: [wishListSchema],
    created: {
      type: Date,
      default: Date.now
    }
  },
  { collection: 'Profile' }
);

profileSchema.methods.serialize = function() {
  return {
    owner: this.owner,
    id: this._id,
    fullName: this.fullName.firstName + ' ' + this.fullName.lastName,
    relationship: this.relationship,
    email: this.email,
    birthday: this.birthday,
    address: this.address,
    phone: this.phone,
    wishList: this.wishList
  };
};

let Profile = mongoose.model('Profile', profileSchema, 'Profiles');

//Generating random relationship type
function generateRelationship() {
  const relationship = [
    'Mom',
    'Dad',
    'Friend',
    'Brother',
    'Sister',
    'Boyfriend',
    'Girlfriend',
    'Aunt',
    'Uncle'
  ];
  return relationship[Math.floor(Math.random() * relationship.length)];
}

// let jerry = new User({
//         _id: new mongoose.Types.ObjectId(),
//         userName: faker.internet.userName(),
//         fullName: {
//             firstName: faker.name.firstName(),
//             lastName: faker.name.lastName()
//         },
//         email: faker.internet.email()
// });

// jerry.save(err => {
//         if (err) console.log(err);

//         let jerrysDad = new Profile({
//             owner: jerry._id,
//             fullName: {
//                 firstName: faker.name.firstName(),
//                 lastName: faker.name.lastName()
//             },
//             relationship: generateRelationship(),
//             birthday: faker.date.past(),
//             address: faker.address.streetName(),
//             wishList: [
//                 {wishItem: faker.random.words()},
//                 {wishItem: faker.random.words()},
//                 {wishItem: faker.random.words()}
//             ]
//         });

//         jerrysDad.save(err => {
//             if (err) console.log(err);
//         });
//     });

module.exports = { Profile };
