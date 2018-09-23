const mongoose = require('mongoose');


mongoose.Promise = global.Promise;

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userName: {
        type: String, 
        required: true,
    },
    fullName: {
        firstName: {type: String, required: true},
        lastName: {type: String},
    },
    email: {type: String, required: true},
    created: {
        type: Date,
        default: Date.now
    }
}, {collection: 'User'});


// what this is doing, is creating a method .serialize that allows us 
//to control what data we're going to be responding with (which gets called in server.js)
userSchema.methods.serialize = function() {
    return {
        id: this._id,
        userName: this.userName,
        firstName: this.fullName.firstName,
        lastName: this.fullName.lastName,
        email: this.email
    };
};

const User = mongoose.model('User', userSchema, "Users");

module.exports = { User };
