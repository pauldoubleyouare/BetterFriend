const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userName: {type: String, required: true},
    fullName: {
        firstName: {type: String, required: true},
        lastName: {type: String, required: true},
    },
    email: {type: String, required: true},
    created: {
        type: Date,
        default: Date.now
    }
}, {collection: 'User'});


userSchema.methods.serialize = function() {
    return {
        id: this._id,
        userName: this.userName,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email
    };
};


let User = mongoose.model('User', userSchema);

module.exports = { User };
