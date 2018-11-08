const mongoose = require('mongoose');
const { User } = require('./userModel');
mongoose.Promise = global.Promise;
const faker = require('faker');

//***** remove created, mongoose auto creates */ timestamp: true
//https://mongoosejs.com/docs/guide.html#timestamps
//https://github.com/CodeDemos/demo-mongoose-relationships/blob/master/subdocument.js

// change name to wishSchema
//change dates to timestamps
const wishSchema = mongoose.Schema({
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
    fullName: {
      firstName: {
        type: String,
        required: true
      },
      lastName: String
    },
    email: String,
    relationship: String,
    birthday: Date, //make this a date not string
    address: { //make these separate fields
      streetName: String,
      city: String,
      state: String,
      zipcode: Number
    },
    phone: String,
    wishList: [wishSchema]
  },
  {
    timestamps: true
  },
  { collection: 'Profile' }
);

//on front end, add conditional if there is a last name firstname+lastName
//don't serve crap data via api

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
    wishList: this.wishList,
    timestamps: this.timestamps
  };
};

let Profile = mongoose.model('Profile', profileSchema, 'Profiles');

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
