require("cloud/app.js");
// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:
AV.Cloud.define("hello", function (request, response) {
    response.success("Hello world!");
});


require("cloud/app.js");
var _ = require('underscore');
var request = require('request');
var s = require("underscore.string");
var cheerio = require('cheerio');

function queryData(app, className, fromTime) {
    var now = new Date();
    return AV.Cloud.httpRequest({
        'method': 'GET',
        'url': 'https://leancloud.cn/1.1/cloudQuery',
        'params': 'cql=select * from ' + className
            //+ 'where updatedAt > date("'
            //+ (now.getYear() + 1900) + '-' + (now.getMonth() + 1) + '-' + (now.getDate())
            //+ 'T00:00:00.000Z") '
        + ' limit 100 order by updatedAt desc'
        ,
        'headers': {
            'X-AVOSCloud-Application-Id': app.app_id,
            'X-AVOSCloud-Application-Key': app.app_key
        }
    }).then(function (resp) {
        var toSave = JSON.parse(resp.text).results//.slice(3, 4);
        return AV.Promise.as(toSave);
    });
}

function postHttp(url, headers, body) {
    var promise = new AV.Promise();
    request.post({
            url: url,
            json: true,
            headers: headers,
            body: body
        },
        function (err, httpResponse, body) {
            if (err) {
                promise.reject(err);
            } else {
                promise.resolve(body);
                console.log(body)
            }
        });
    return promise;
}

function saveData(app, className, data) {
    var requests = [];
    data.forEach(function (item) {
        if ('_User' === className) {
            item.password = '123';
        }
        item.oringinalObjectId = item.objectId;
        delete item.objectId;
        delete item.createdAt;
        delete item.updatedAt;
        requests.push({
            "method": "POST",
            "path": "/1.1/classes/" + className,
            "body": item
        })
    });

    console.log('ready to save,%s', requests.length);

    return postHttp(
        'https://api.leancloud.cn/1.1/batch',
        {
            'X-AVOSCloud-Application-Id': app.app_id,
            'X-AVOSCloud-Application-Key': app.app_key,
        },
        {'requests': requests}
    )
}

AV.Cloud.define("copy_database", function (request, response) {
    queryData(
        {
            'app_id': '044zaox4spff0bx3ynmqlh75g8ejxep6k8if56cm0yrvu5eo',
            'app_key': 'du8eu47suzzhvfqub6qr9hm6jqf1f76j5atjaucve67xa0j2'
        }, '_User')
        .then(function (data) {
            return saveData({
                'app_id': 'yilpewv1clvmfqi6n218ph812nopwtbttpjryl4ed1llywj3',
                'app_key': 'z05vdiu4f5gct4rmvx7xj3owgdemkxhjx7n4bvcq5fe6uv3y'
            }, '_User', JSON.parse(data.text).results)
        }).then(function (data) {
            response.success(JSON.parse(data.text));
        }, function (err) {
            response.error(err);
        })
});

var Cookie = AV.Object.extend('Cookie');
var Application = AV.Object.extend('Application');

function signIn() {
    return AV.Cloud.httpRequest({
        'method': 'POST',
        'url': 'https://avoscloud.com/1/signin',
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': {
            'email': 'cloud@petchat.io',
            'password': 'Senz2everyone'
        }
    }).then(function (resp) {
        return new Cookie({
            cookie: resp.headers['set-cookie']
        }).save();
    }, function (err) {
        console.log(err);
    })
}

function getAllApp() {
    var query = new AV.Query(Cookie);
    query.descending('updatedAt');
    return query.first()
        .then(function (cookie) {
            if (cookie) {
                var token = '';
                _.map(cookie.get('cookie'), function (c) {
                    if (s.startsWith(c, 'uluru_user')) {
                        token = c;
                    }
                })

                return AV.Cloud.httpRequest({
                    'method': 'GET',
                    'url': 'https://avoscloud.com/1/clients/self/apps',
                    'headers': {
                        'Cookie': token
                    }
                })
            } else {
                return AV.Promise.error();
            }
        }).then(function (resp) {
            return AV.Promise.as(JSON.parse(resp.text));
        })
}

function signinAndDo(jobAfterSignin) {
    return signIn().then(
        function (cookie) {
            return jobAfterSignin(cookie);
        })
}

function signinAndFetchApp() {
    return signIn().then(
        function (cookie) {
            return getAllApp(cookie);
        })
}

AV.Cloud.define("copy_prod_test", function (request, response) {
    var from = request.params.from,
        to = request.params.to;

});

function getClasses(app_id) {
    var query = new AV.Query(Cookie);
    query.descending('updatedAt');
    return query.first()
        .then(function (cookie) {
            if (cookie) {
                return AV.Cloud.httpRequest({
                    'method': 'GET',
                    'url': 'https://avoscloud.com/1/data/' + app_id + '/classes',
                    'headers': {
                        'Cookie': cookie.get('cookie')
                    }
                })
            } else {
                return AV.Promise.error();
            }
        }).then(function (resp) {
            return AV.Promise.as(JSON.parse(resp.text));
        })
}

function copyData(from, to) {
    return getClasses(from.app_id).then(function (classes) {
        return AV.Promise.as(classes);
    }, function () {
        return signinAndDo(getClasses);
    }).then(function (classes) {
        return AV.Promise.as(classes);
    })
}

AV.Cloud.define("refresh_all_apps", function (request, response) {
    var newApps = [];
    getAllApp()
        .then(function (apps) {
            return AV.Promise.as(apps);
        }, function (err) {
            return signinAndDo(getAllApp);
        })
        .then(function (apps) {
            newApps = apps;
            return new AV.Query(Application).find()
        })
        .then(function (existsApps) {
            AV.Object.destroyAll(existsApps);
        })
        .then(function () {
            var promises = [];
            newApps.forEach(function (app) {
                var record = {};
                record.raw = app;
                record.app_id = app.app_id;
                record.app_key = app.app_key;
                record.master_key = app.master_key;
                record.app_name = app.app_name;
                delete app.id;
                promises.push(new Application(record).save());
            })
            return AV.Promise.all(promises);
        })
        .then(function (apps) {
            response.success(apps);
        }, function (err) {
            response.error(err);
        })
});

function checkDup(app, className, data) {
    var dataToDedup = _.object(_.map(data, function (item) {
        return [item.objectId, item];
    }));
    var queryIds = ''
    _.mapObject(dataToDedup, function (val, key) {
        queryIds += '"' + val.objectId + '",';
    });
    queryIds = queryIds.slice(0, queryIds.length - 1);

    var cql = 'cql=select * from ' + className
        + ' where oringinalObjectId={"$in":[' + queryIds + ']}';

    return AV.Cloud.httpRequest({
        'method': 'GET',
        'url': 'https://api.leancloud.cn/1.1/cloudQuery',
        'params': cql,
        'headers': {
            'X-AVOSCloud-Application-Id': app.app_id,
            'X-AVOSCloud-Application-Key': app.app_key
        }
    }).then(function (resp) {
        console.log('query resylt, %s', JSON.parse(resp.text).results.length);
        var existsIds = _.map(JSON.parse(resp.text).results, function (item) {
            return item.oringinalObjectId;
        });

        console.log('exists ids,%s', existsIds);

        var toSave = _.map(
            _.difference(_.keys(dataToDedup), existsIds),
            function (k) {
                return dataToDedup[k];
            }
        );

        console.log('ready to save data,%s', toSave);

        //var toSave = JSON.parse(resp.text).results//.slice(3, 4);
        return AV.Promise.as(toSave);
    });
}

AV.Cloud.define("copy_app", function (request, response) {
    var from = {
        'app_id': '9ra69chz8rbbl77mlplnl4l2pxyaclm612khhytztl8b1f9o',
        'app_key': '1zohz2ihxp9dhqamhfpeaer8nh1ewqd9uephe9ztvkka544b'
    }, to = {
        'app_id': '168j9dwlm7vycnljl4h8x3jmkpokc7rq5ywf4nd7ffww3mbz',
        'app_key': 'gdvh4n189as9flc999ei21lc1bnya7cr4q3d1bfdh43u5l2t'
    }

    var classes_to_copy = ['Log'];
    classes_to_copy.forEach(function (className) {
        queryData(from, className)
            .then(function (data) {
                return checkDup(to, className, data);
            })
            .then(function (data) {
                if (data.length == 0) {
                    response.success('no data to duplicate');
                }
                return saveData(to, className, data);
            })
            .then(function (records) {
                response.success(records);
            }, function (err) {
                response.error(err);
            })
    })

});

function buildCookieJar(cookieStr, url){
    var jar = request.jar();
    var cookie = request.cookie(cookieStr);
    jar.setCookie(cookie, url);
    return jar;
}
var req;

function test_bugsnag(resp){
    req.get({url:'https://bugsnag.com/laboon/senz-dot-crawler-dot-nodejs/errors',
            followRedirect: false}, function (error, response, body){
            //console.log(body);
            resp.success(body);
        }
    );
}

function login_bugsnag(resp){
    var url = 'https://bugsnag.com/user/sign_in';
    request.get(url, function(error, response, body){
        var jr = buildCookieJar(response.headers['set-cookie'][0], url);
        var $ = cheerio.load(body);
        var token = $('input[name=authenticity_token]').val();
        var form = {
            'user[email]': 'cloud@petchat.io',
            'user[password]': 'Senz2everyone',
            'authenticity_token': token
        };
        request.post({url: url, jar: jr, followAllRedirects: true, form: form}, function (error, response, body) {
            if (!error) {
                var cookie = response.headers['set-cookie'];
                var j = buildCookieJar(cookie[0],url);
                req = request.defaults({jar:j});
                test_bugsnag(resp);
                //resp.success(cookie[0]);
            }else{
                console.log(error)
            }
        });

    });
}

function login_logentries(resp){
    var url = 'https://logentries.com/login';
    request.get(url, function(error, response, body){
        var jr = buildCookieJar(response.headers['set-cookie'][0], url);
        var $ = cheerio.load(body);
        var token = $('input[name=csrfmiddlewaretoken]').val();
        var form = {
            'username': 'cloud@petchat.io',
            'password': 'Senz2everyone',
            'csrfmiddlewaretoken': token
        };
        request.post({url: url, jar: jr, followAllRedirects: true, form: form}, function (error, response, body) {
            if (!error) {
                var cookie = response.headers['set-cookie'];
                var j = buildCookieJar(cookie[0],url);
                req = request.defaults({jar:j});
                test_bugsnag(resp);
                //resp.success(cookie[0]);
            }else{
                console.log(error)
            }
        });

    });
}

function login_tyk(resp){
    var url = 'http://182.92.4.173:3000/login';
    var form = {
        'username': 'cloud@petchat.io',
        'password': 'xiaosenz'
    };
    request.post({url: url, followAllRedirects: false, form: form}, function (error, response, body) {
        if (!error) {
            //console.log(response.headers);
            var cookie = response.headers['set-cookie'];
            var j = buildCookieJar(cookie[0],url);
            req = request.defaults({jar:j});
            req.get('http://182.92.4.173:3000/',function (error,response,body){
                //console.log(body);
                //resp.success(body);
                var $ = cheerio.load(body);
                //var css = $('link[rel=stylesheet]');
                //css.attr('href','http://182.92.4.173:3000/'+css.attr('href'));
                var img = $('img');
                img.attr('src','http://182.92.4.173:3000'+img.attr('src'))
                resp.success($.html());
            });

        }else{
            console.log(error)
        }
    });
}

var sortObj=function(arr,key,dir){
    key=key||'id';
    dir=dir||'asc';
    if (arr.length == 0) return [];

    var left = new Array();
    var right = new Array();
    var pivot = arr[0][key];//分割值
    var pivotObj = arr[0];//存储值

    if(dir==='asc'){//升序
        for (var i = 1; i < arr.length; i++) {
            arr[i][key] < pivot ? left.push(arr[i]): right.push(arr[i]);
        }
    }else{//降序
        for (var i = 1; i < arr.length; i++) {
            arr[i][key] > pivot ? left.push(arr[i]): right.push(arr[i]);
        }
    }
    return sortObj(left,key,dir).concat(pivotObj, sortObj(right,key,dir));
};


AV.Cloud.define("login_tyk", function (request, response) {

    login_tyk(response);

    //response.success(" login!");
});

AV.Cloud.define("login_bugsnag", function (request, response) {

    login_bugsnag(response);

    //response.success(" login!");
});


AV.Cloud.define("login_logentries", function (request, response) {

    login_logentries(response);

    //response.success(" login!");
});

function get_all_trace(user_id, begin, end){
    var where_cond = 'where={"user":{"__type":"Pointer","className":"_User","objectId":"'+user_id+ '"},' +
        '"timestamp":{"$gte":'+begin+',"$lte":'+end+'}}';
    return AV.Cloud.httpRequest({
        'method': 'GET',
        'url': 'https://api.leancloud.cn/1.1/classes/UserLocation',
        'params': where_cond + '&count=1&limit=0',
        'headers': {
            'X-AVOSCloud-Application-Id': 'pin72fr1iaxb7sus6newp250a4pl2n5i36032ubrck4bej81',
            'X-AVOSCloud-Application-Key': 'qs4o5iiywp86eznvok4tmhul360jczk7y67qj0ywbcq35iia'
        }
    }).then(function (resp) {
        var count = JSON.parse(resp.text).count;
        return AV.Promise.as(count);
    }).then(function(count) {
        console.log('trace points: '+count);
        var promises = [];
        for(var i= 0; i<(count/1000); i++)
            promises.push(get_trace_once(where_cond, i*1000, 1000));

        return AV.Promise.all(promises);
    });
}

function get_trace_once(where_cond, skip, limit){
    return AV.Cloud.httpRequest({
        'method': 'GET',
        'url': 'https://api.leancloud.cn/1.1/classes/UserLocation',
        'params': where_cond + '&order=timestamp&skip='+skip+'&limit='+limit,
        'headers': {
            'X-AVOSCloud-Application-Id': 'pin72fr1iaxb7sus6newp250a4pl2n5i36032ubrck4bej81',
            'X-AVOSCloud-Application-Key': 'qs4o5iiywp86eznvok4tmhul360jczk7y67qj0ywbcq35iia'
        }
    }).then(function(resp){
        return AV.Promise.as(JSON.parse(resp.text).results);
    });
}

AV.Cloud.define("get_trace", function (request, response) {
    var user_id = request.params.user_id;//'55a45b7fe4b04ac4cd851b06';
    var begin = request.params.begin;//'1437146984388';
    var end = request.params.end;//'1437146994390';
    console.log(' user:'+user_id+'\n begin:'+ begin + '\n end:'+end);
    get_all_trace(user_id,begin,end).then(function(re_list){
        var trace = [];
        for(var i in re_list){
            var points = re_list[i];
            for(var index in points){
                if(!points[index].location)
                    continue;
                var location = {
                    "locationId": points[index].objectId,
                    "gps": {
                        "lon": points[index].location.longitude,
                        "lat": points[index].location.latitude
                    },
                    "poi": 'None',
                    "timestamp": points[index].timestamp
                };

                if(points[index].pois)
                    location['poi'] = points[index].pois.pois[0].title;

                trace.push(location)
            }
        }
        //trace = sortObj(trace,'timestamp','asc');
        var result = {'result':trace};
        //console.log(JSON.stringify(trace));
        response.success(JSON.stringify(result));
    }, function(err){console.log(err);});
});

AV.Cloud.define("get_user_list", function (request, response) {
    return AV.Cloud.httpRequest({
        'method': 'GET',
        'url': 'https://leancloud.cn/1.1/cloudQuery',
        'params': 'cql=select username from ' + '_User'
        //+ ' limit 1 order by updatedAt desc'
        ,
        'headers': {
            'X-AVOSCloud-Application-Id': 'pin72fr1iaxb7sus6newp250a4pl2n5i36032ubrck4bej81',
            'X-AVOSCloud-Application-Key': 'qs4o5iiywp86eznvok4tmhul360jczk7y67qj0ywbcq35iia'
        }
    }).then(function (resp) {
        var users = JSON.parse(resp.text).results;
        var user_list = [];
        for(var i in users){
            var u = {id: users[i].objectId, name: users[i].username};
            user_list.push(u);
        }

        response.success(JSON.stringify(user_list))
    }, function(err){console.log(err);});
});

AV.Cloud.define("get_poi", function (request, response) {
    var id = request.params.id;//'55a45b7fe4b04ac4cd851b06';

    return AV.Cloud.httpRequest({
        'method': 'GET',
        'url': 'https://api.leancloud.cn/1.1/classes/UserLocation',
        'params': 'keys=pois&where={"objectId":"'+id+'"}',
        'headers': {
            'X-AVOSCloud-Application-Id': 'pin72fr1iaxb7sus6newp250a4pl2n5i36032ubrck4bej81',
            'X-AVOSCloud-Application-Key': 'qs4o5iiywp86eznvok4tmhul360jczk7y67qj0ywbcq35iia'
        }
    }).then(function (resp) {
        console.log(resp.text);
        //var pois = JSON.parse(resp.text).results;
        //console.log(pois.pois[0]);


        //response.success(JSON.stringify(user_list))
    }, function(err){console.log(err);});
});