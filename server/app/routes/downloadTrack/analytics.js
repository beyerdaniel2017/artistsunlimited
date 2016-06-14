var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var router = require('express').Router();
var request = require('request');
var mongoose = require('mongoose');
var graph = require('fbgraph');
module.exports = router;
var Analytics = mongoose.model('Analytics');
var Twitter = require('twitter');
var twitter_database = mongoose.model("Twitter");
var youtube_database = mongoose.model("Youtube");
var path = require('path');
var config = require(path.join(__dirname, '../../../env'));
/*Facebook analytics
req.body->{
token : access token of facebook (optional, if not send, only data from database served)
pageid : page to add to watch list (optional, required first time when user adds a page)
userid : artistUnlimited userid
uid : facebook userid
}
*/
router.post("/facebook", function(req, response_rest, done) {
    Analytics.findOne({
        user: req.body.userid
    }, function(err, res) {
        graph.setAccessToken(req.body.token);
        if (!err && res !== null) {
            //user found, insert new records into database and return old ones
            var current_offset = res.value[0] ? res.value[0].end_time.getTime() / 1000 : Math.floor(((new Date()).getTime() + (new Date()).getTimezoneOffset() * 60 * 1000) / 1000 - (7 * 24 * 60 * 60));
            graph.get(res.pageid + "/insights?since=" + current_offset, function(err, result_fb) {
                if (err) {
                    console.log("error from facebook api :" + JSON.stringify(err));
                    return;
                }
                if (result_fb.data.length !== 0) {
                    for (var i = 0; i < result_fb.data[0].values.length; i++) {
                        result_fb.data[0].values[i].end_time = new Date(result_fb.data[0].values[i].end_time);
                        res.value.unshift(result_fb.data[0].values[i]);
                    }
                    res.save(function(err) {
                        if (err) console.log("Error while pushing new analytics into database :" + err);
                        else {
                            response_rest.send(formatResponse(res)); //send top n values
                        }
                    });
                } else {
                    response_rest.send(formatResponse(res));
                }
            });
        } else {
            //user not found, register him
            if (req.body.pid && req.body.userid && req.body.pageid) {
                var saveobject = {
                    pid: req.body.pid,
                    user: req.body.userid,
                    pageid: req.body.pageid,
                    value: []
                };
                var newAnalytics = new Analytics(saveobject);
                newAnalytics.save(function(err) {
                    if (err) console.log("Error while adding new user :" + err);
                    else response_rest.send("Successfull registration");
                });
            } else {
                response_rest.send("wrong request format");
            }
        }
    });

    function formatResponse(input) {
        var output = {};
        for (var i = 0; i < input.value.length; i++) {
            var sum = 0;
            for (var j in input.value[i].value) {
                sum = sum + input.value[i].value[j];
            }
            output[input.value[i].end_time.toString()] = sum;
        }
        return (output);
    }
});

/*Get pages administered by the user
req.body->{
token : access token of facebook
}
*/
router.post("/facebook/owned", function(req, res, done) {
    graph.setAccessToken(req.body.token);
    graph.get("me/accounts", function(err, res_fb) {
        if (err) {
            console.log("Error while executing graph API:" + JSON.stringify(err));
            return;
        } else {
            var response = [];
            for (var i = 0; i < res_fb.data.length; i++) {
                response.push({
                    category: res_fb.data[i].category,
                    name: res_fb.data[i].name,
                    id: res_fb.data[i].id
                });
            }
            graph.get('/me/', function(err, res_me) {
                if (!err) {
                    res.send({
                        pages: response,
                        username: res_me.name,
                        id: res_me.id
                    });
                } else {
                    console.log("Unknown error :" + err);
                }
            });
        }
    });
});

//Twitter Analytics API
router.post("/twitter", function(req, res, done) {
    if (req.body.access_token_key && req.body.access_token_secret && req.body.uid) {
        var client = new Twitter({
            consumer_key: 'HtFNqGObOo2O4IkzL1gasudPJ',
            consumer_secret: 'bjDsl0XUZmcSLIWIl83lhkKRxJ3E99yvmRpYxQvCpbgL0kn4fN',
            access_token_key: req.body.access_token_key,
            access_token_secret: req.body.access_token_secret
        });
        twitter_database.findOne({
            userid: req.body.uid
        }, function(err, res_twitter) {
            if (!err && res_twitter !== null) {
                client.get("users/lookup.json", {
                    screen_name: res_twitter.screen_name
                }, function(error, tweets, response) {
                    if (error) {
                        console.log(JSON.stringify(error) + "\n error from twitterauth");
                        return;
                    } else {
                        res_twitter.follows.unshift({
                            date: new Date(),
                            follows: JSON.parse(response.body)[0].followers_count
                        });
                        res_twitter.save(function(err) {
                            if (err) {
                                console.log("error while saving twitter followers :" + err);
                                return;
                            }
                            res.send(res_twitter.follows);
                        });
                    }
                });
            } else {
                res.send("twitter not registered");
            }
        });
    } else {
        res.send("malformed request");
    }
});

router.post("/twitter/create", function(req, res, done) {
    if (req.body.screen_name && req.body.userid) {
        var twitter_save = new twitter_database({
            screen_name: req.body.screen_name,
            userid: req.body.userid,
            follows: []
        });
        twitter_save.save(function(err) {
            if (err) {
                console.log("error while initializing twitter analytics :" + err);
                res.send("already registered?");
                return;
            } else {
                res.send("success");
            }
        });
    } else {
        res.send("malformed request");
    }
});

//Youtube analytics api
router.post("/youtube/stats", function(req, res, done) {
    if (req.body.userid && req.body.channelId) {
        var url = "https://content.googleapis.com/youtube/v3/channels?part=statistics%2CcontentOwnerDetails&key=AIzaSyAMTf33Kl3OKP1ECNxhGT-qgg8zr_rB3LY&id=" + req.body.channelId;
        //id=UClw5UTugvHO-VL7n-IaxaTA
        request.get({
            url: url
        }, function(error, response, body) {
            if (error) {
                console.log("error on google subscribe count api :" + error);
                return;
            }
            var youtube = new youtube_database({
                uid: req.body.userid,
                data: (JSON.parse(body)).items[0],
                date: new Date()
            });
            youtube.save(function(err) {
                if (err) {
                    console.log("cant save youtube stats :" + err);
                } else {
                    youtube_database.find({
                        uid: req.body.userid
                    }, function(err, res_youtubedb) {
                        if (!err && res !== null) {
                            res.send(res_youtubedb);
                        } else console.log("error while searching or unregistered user");
                    }).limit(10).lean().sort({
                        _id: -1
                    });
                }
            });
        });
    } else {
        res.send("malformed request");
    }
});

router.post("/instagram", function(req, res, done) {
    //Dynamic Variables Start
    req.body.userid = req.body.userid ? req.body.userid : 'dhavalp';
    req.body.access_token = req.body.access_token ? req.body.access_token : '3201298647.1677ed0.7963843bb7ae48928ed36f6615844731';
    //Dynamic Variables End
    if (!req.body.access_token || !req.body.userid) {
        res.statusCode = 401;
        res.send("Authorization failed");
    }
    var ig = require('instagram-node').instagram();
    ig.use({
        client_id: 'ae84968993fc4adf9b2cd246b763bf6b',
        client_secret: '2fb6196d81064e94a8877285779274d6',
        access_token: req.body.access_token
    });
    ig.user('self', function(err, result, remaining, limit) {
        if (err) {
            console.log("Error from instagram analytics api" + err);
            return;
        }
        var Instagram = mongoose.model('Instagram');
        //search if userid(artistUnlimited) is in database, otherwise create entry
        Instagram.find({
            userid: req.body.userid
        }, function(err, response_database) {
            if (err) {
                console.log("Error from database, instagram_schema :" + err);
                return;
            }
            var save_database;
            if (response_database.length !== 0) {
                //entry in database
                result.userid = req.body.userid;
                response_database.unshift(result);
                save_database = new Instagram(result);
                save_database.save(function(err) {
                    if (err) {
                        console.log("fatal error while saving :" + err);
                        return;
                    } else {
                        res.send(formatResponse(response_database));
                    }
                });
            } else {
                //entry not in database
                result.userid = req.body.userid;
                save_database = new Instagram(result);
                save_database.save(function(err) {
                    if (err) {
                        console.log("fatal error while saving :" + err);
                        return;
                    } else {
                        res.send(formatResponse(result));
                    }
                });
            }
        }).sort({
            _id: -1
        });
    });

    function formatResponse(input) {
        var output = input;
        return output;
    }
});
