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
            }
        })
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
    })

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

})

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
            return AV.Promise.when(promises);
        })
        .then(function (apps) {
            response.success(apps);
        }, function (err) {
            response.error(err);
        })
})

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
                response.success(records.length);
            }, function (err) {
                response.error(err);
            })
    })

})
