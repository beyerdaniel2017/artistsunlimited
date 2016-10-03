'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    role: {
        type: String,
        default: 'user'
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
        createdOn: Date,
        repostSettings: {
            type: Object,
            default: {}
        }
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
            'sunday': [1, 4, 8, 11, 14, 17, 20],
            'monday': [1, 4, 8, 11, 14, 17, 20],
            'tuesday': [1, 4, 8, 11, 14, 17, 20],
            'wednesday': [1, 4, 8, 11, 14, 17, 20],
            'thursday': [1, 4, 8, 11, 14, 17, 20],
            'friday': [1, 4, 8, 11, 14, 17, 20],
            'saturday': [1, 4, 8, 11, 14, 17, 20]
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
    admin: Boolean,
    cut: {
        type: Number,
        default: 0.7
    }
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