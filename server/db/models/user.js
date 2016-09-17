'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    role: {
        type: String
    },
    name: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    salt: {
        type: String
    },
    permanentLinks: {
        type: [mongoose.Schema.Types.Mixed]
    },
    twitter: {
        id: String,
        username: String,
        token: String,
        tokenSecret: String
    },
    facebook: {
        id: String,
        name: String,
        token: String,
        refreshToken: String
    },
    google: {
        id: String,
        name: String,
        token: String,
        refreshToken: String
    },
    soundcloud: {
        id: Number,
        username: String,
        permalinkURL: String,
        avatarURL: String,
        token: String,
        followers: Number
    },
    queue: {
        type: [Number],
        default: []
    },
    description: {
        type: String
    },
    thirdPartyInfo: {
        username: String,
        password: String,
        passwordPlain: String,
        salt: String
    },
    linkedAccounts: [],
    paidRepost: [{
        userID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        price: String,
        description: String,
        groups: [],
        submissionUrl: String,
        premierUrl: String,
        createdOn: Date
    }],
    submissionsCustomEmailButtons: [],
    premierCustomEmailButtons: [],
    profilePicture: {
        type: String
    },
    blockRelease: {
        type: Date,
        default: new Date(0)
    },
    repostCustomizeEmails: [],
    premierCustomizeEmails: [],
    paypal_email: String,
    availableSlots: {
        type: Object,
        default: {
            'sunday': [2, 4, 6, 8, 10, 12, 14, 16, 18, 22],
            'monday': [2, 4, 6, 8, 10, 12, 14, 16, 18, 22],
            'tuesday': [2, 4, 6, 8, 10, 12, 14, 16, 18, 22],
            'wednesday': [2, 4, 6, 8, 10, 12, 14, 16, 18, 22],
            'thursday': [2, 4, 6, 8, 10, 12, 14, 16, 18, 22],
            'friday': [2, 4, 6, 8, 10, 12, 14, 16, 18, 22],
            'saturday': [2, 4, 6, 8, 10, 12, 14, 16, 18, 22]
        }
    },
    repostSettings: {
        type: Object,
        default: {}
    },
    notificationSettings: {
        facebookMessenger: {
            messengerID: Number,
            tradeRequest: {
                type: Boolean,
                default: true
            },
            tradeAcceptance: {
                type: Boolean,
                default: true
            },
            trackRepost: {
                type: Boolean,
                default: false
            },
            trackUnrepost: {
                type: Boolean,
                default: false
            },
            failedRepost: {
                type: Boolean,
                default: true
            }
        },
        email: {
            tradeRequest: {
                type: Boolean,
                default: true
            },
            tradeAcceptance: {
                type: Boolean,
                default: true
            },
            trackRepost: {
                type: Boolean,
                default: false
            },
            trackUnrepost: {
                type: Boolean,
                default: false
            },
            failedRepost: {
                type: Boolean,
                default: true
            }
        }
    },
    admin:Boolean
});

// method to remove sensitive information from user objects before sending them out
schema.methods.sanitize = function() {
    return _.omit(this.toJSON(), ['password', 'salt']);
};

// generateSalt, encryptPassword and the pre 'save' and 'correctPassword' operations
// are all used for local authentication security.
var generateSalt = function() {
    return crypto.randomBytes(16).toString('base64');
};

var encryptPassword = function(plainText, salt) {
    var hash = crypto.createHash('sha1');
    hash.update(plainText);
    hash.update(salt);
    return hash.digest('hex');
};


schema.pre('save', function(next) {
    if (this.isModified('password')) {
        this.salt = this.constructor.generateSalt();
        this.password = this.constructor.encryptPassword(this.password, this.salt);
    }
    next();
});
schema.statics.generateSalt = generateSalt;
schema.statics.encryptPassword = encryptPassword;

schema.method('correctPassword', function(candidatePassword) {
    return encryptPassword(candidatePassword, this.salt) === this.password;
});

mongoose.model('User', schema);