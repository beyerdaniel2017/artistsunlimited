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
        user: req.user._id
    }, function(err, res) {
        graph.setAccessToken(req.body.token);
        if (!err && res !== null &&res.value.length!==0) {
            //user found, insert new records into database and return old ones
            var current_offset = (res.value[0] ? res.value[0].end_time.getTime() / 1000 : Math.floor(((new Date()).getTime() + (new Date()).getTimezoneOffset() * 60 * 1000) / 1000 - (7 * 24 * 60 * 60))) + 1000;
            graph.get(res.pageid + "/insights?since=" + current_offset, function(err, result_fb) {
                if (err) {
                    console.log("error from facebook api :" + JSON.stringify(err));
                    return;
                }
                console.log(JSON.stringify(result_fb.data));
                if (result_fb.data[0].values.length > 1) {
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
            if (req.body.pid && req.user._id && req.body.pageid && !res) {
                var saveobject = {
                    pid: req.body.pid,
                    user: req.user._id,
                    pageid: req.body.pageid,
                    value: []
                };
                var newAnalytics = new Analytics(saveobject);
                newAnalytics.save(function(err) {
                    if (err) console.log("Error while adding new user :" + err);
                    else response_rest.send(formatResponse([newAnalytics]));
                });
            } else {
                response_rest.statusCode = 404;
                response_rest.send("wrong request format/No data");
            }
        }
    }).sort({
        _id: -1
    });

    function formatResponse(input) {
        var output = {};
        if (input.value) {
            input.value.reverse();
            input.value.slice(0, 6);
            for (var i = 0; i < input.value.length; i++) {
                var sum = 0;
                for (var j in input.value[i].value) {
                    sum = sum + input.value[i].value[j];
                }
                var date_formatted = input.value[i].end_time.toISOString();
                date_formatted = date_formatted.substring(0, date_formatted.indexOf('T'));
                output[date_formatted] = sum;
            }
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
    if (req.body.access_token_key && req.body.access_token_secret && req.user._id) {
        var client = new Twitter({
            consumer_key: 'HtFNqGObOo2O4IkzL1gasudPJ',
            consumer_secret: 'bjDsl0XUZmcSLIWIl83lhkKRxJ3E99yvmRpYxQvCpbgL0kn4fN',
            access_token_key: req.body.access_token_key,
            access_token_secret: req.body.access_token_secret
        });
        twitter_database.findOne({
            userid: req.user._id
        }, function(err, res_twitter) {
            if (!err && res_twitter !== null) {
                client.get("users/lookup.json", {
                    screen_name: res_twitter.screen_name
                }, function(error, tweets, response) {
                    if (error) {
                        console.log(JSON.stringify(error) + "\n error from twitterauth");
                        return;
                    } else {
                        if ((res_twitter.follows.length === 0) || (res_twitter.follows[0].follows !== JSON.parse(response.body)[0].followers_count)) {
                            res_twitter.follows.unshift({
                                date: new Date(),
                                follows: JSON.parse(response.body)[0].followers_count
                            });
                            res_twitter.save(function(err) {
                                if (err) {
                                    console.log("error while saving twitter followers :" + err);
                                    return;
                                }
                                res.send(res_twitter.follows.slice(0, 5).reverse());
                            });
                        } else {
                            res.send(res_twitter.follows.slice(0, 5).reverse());
                        }
                    }
                });
            } else {
                res.statusCode = 404;
                res.send("twitter not registered");
            }
        });
    } else {
        res.statusCode = 404;
        res.send("malformed request");
    }
});

router.post("/twitter/create", function(req, res, done) {
    if (req.body.screen_name && req.user._id) {
        var twitter_save = new twitter_database({
            screen_name: req.body.screen_name,
            userid: req.user._id,
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
        res.statusCode = 401;
        res.send("malformed request");
    }
});

//Youtube analytics api
router.post("/youtube/stats", function(req, res, done) {
    console.log("user ->" + req.user);
    if (req.user._id) {
        youtube_database.find({
            uid: req.user._id
        }, function(err, res_youtube_db) {
            if (err) {
                console.log("Error from youtube database");
                return;
            }
            var url;
            if (res_youtube_db.length !== 0) {
                url = "https://content.googleapis.com/youtube/v3/channels?part=statistics%2CcontentOwnerDetails&key=AIzaSyAMTf33Kl3OKP1ECNxhGT-qgg8zr_rB3LY&id=" + res_youtube_db[0].data.id;
            } else if (req.body.channelId) {
                url = "https://content.googleapis.com/youtube/v3/channels?part=statistics%2CcontentOwnerDetails&key=AIzaSyAMTf33Kl3OKP1ECNxhGT-qgg8zr_rB3LY&id=" + req.body.channelId;
            } else {
              res.statusCode = '401';
              res.send("wrong request format");
              return;
            }
            request.get({
                url: url
            }, function(error, response, body) {
                var body_json = JSON.parse(body);
                if (res_youtube_db.length !== 0) //user entry exists
                {
                    if (res_youtube_db[0].data.statistics.subscriberCount !== body_json.items[0].statistics.subscriberCount) { //stats changed
                        var youtube = new youtube_database({
                            uid: req.user._id,
                            data: body_json.items[0],
                            date: new Date()
                        });
                        youtube.save(function(err) {
                            if (err) {
                                console.log("error while saving :" + err);
                                return;
                            }
                            res_youtube_db.unshift(youtube);
                            res.send(formatResponse(res_youtube_db));
                        });
                    } else {
                        res.send(formatResponse(res_youtube_db));
                    }
                } else if (req.body.channelId) { //user not found, correct request

                    var youtube = new youtube_database({
                        uid: req.user._id,
                        data: body_json.items[0],
                        date: new Date()
                    });
                    youtube.save(function(err) {
                        if (err) {
                            console.log("error while saving :" + err);
                            return;
                        }
                        res.send(formatResponse([youtube]));
                    });
                } else {
                    res.statusCode = '401';
                    res.send("wrong request format");
                }

                function formatResponse(input) {
                    input.reverse();
                    var output = {};
                    for (var i = 0; i < input.length; i++) {
                        var date_string = input[i].date.toISOString();
                        output[date_string] = input[i].data.statistics.subscriberCount;
                    }
                    return (output);
                }
            });
        }).sort({
            _id: -1
        }).limit(6).lean();
    } else {
        res.statusCode = '401';
        res.send("malformed request");
    }
});

router.post("/instagram", function(req, res, done) {
    //Dynamic Variables Start
    req.body.userid = req.user._id;
    //  req.body.access_token = req.body.access_token ? req.body.access_token : '3201298647.1677ed0.7963843bb7ae48928ed36f6615844731';
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
                if (result.counts.followed_by !== response_database[0].counts.followed_by) {
                    save_database = new Instagram(result);
                    save_database.save(function(err) {
                        if (err) {
                            console.log("fatal error while saving :" + err);
                            return;
                        } else {
                            response_database.unshift(save_database);
                            res.send(formatResponse(response_database));
                        }
                    });
                } else {
                    res.send(formatResponse(response_database));
                }
            } else {
                //entry not in database
                result.userid = req.body.userid;
                save_database = new Instagram(result);
                save_database.save(function(err) {
                    if (err) {
                        console.log("fatal error while saving :" + err);
                        return;
                    } else {
                        res.send(formatResponse([save_database]));
                    }
                });
            }
        }).sort({
            _id: -1
        }).limit(6).lean();
    });

    function formatResponse(input) {
        console.log(JSON.stringify(input));
        var output = {};
        for (var i = 0; i < input.length; i++) {
            output[input[i]._id.getTimestamp().toISOString()] = input[i].counts.followed_by;
        }
        return output;
    }
});
