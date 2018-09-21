const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const userSchema = mongoose.Schema({
    userName: {type: String, required: true},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, required: true}
}, {collection: "User"});

// const profileSchema = mongoose.Schema({

// });

userSchema.methods.serialize = function() {
    return {
        id: this._id,
        userName: this.userName,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email
    };
};


const User = mongoose.model("User", userSchema, "User");

module.exports = { User };
