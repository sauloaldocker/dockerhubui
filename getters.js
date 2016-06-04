var dockerhub = require( './dockerhub.js' );
var logger    = require( './logger.js'    );


function init(app) {
    dockerhub.init(app);

    //Set routes
    app.get(    '/repos/:username/'                      , get_repos        );
    app.get(    '/info/:username/:reponame/'             , get_repo_info    );
    app.get(    '/history/:username/:reponame/'          , get_repo_history );
    app.get(    '/logs/:username/:reponame/:build_code/' , get_build_log    );
    app.get(    '/xml/:username/'                        , dynamic_xml      );
    app.get(    '/html/:username/'                       , dynamic_html     );
    app.get(    '/title/'                                , get_title        );
    app.get(    '/permissions/'                          , get_permissions  );
    app.get(    '/namespaces/'                           , get_namespaces  );

    app.get(    '/update/'                               , update           );
}


function get_title(req,res) {
    res.json({"title": req.app.conf.APP_TITLE});
}


function get_permissions(req,res) {
    res.json({"allowed": req.app.conf.ALLOWED_REPOS, "forbidden": req.app.conf.FORBIDDEN_REPOS});
}

function get_namespaces(req,res) {
    res.json({"namespaces": req.app.conf.REQUESTED_REPOS});
}

function send_data(hit_cache, res, data) {
    //var jdata = JSON.stringify(data);
    //var cs    = checksum(jdata);
    res.setHeader('Content-Type', 'application/json');
    //res.send( jdata );
    res.json( data );
}

function get_repos (req,res) {
    //'/repos/:username/'
    var username = req.params.username;

    logger(1, "getting repos from username", username);

    var data = { "username": username, "status": 1, "status_desc": "getting repos from username " + username };

    dockerhub.get_repos(username, false,
        function(hit_cache, repos) {
            if (!repos) {
                logger(1, "no repos");

                data.status      = 2;
                data.status_desc = "error getting list of repositories for username " + username;

                send_data(false, res, data);
                return;
            }

            data.status      = 0;
            data.status_desc = "succes";
            data.data        = repos;

            send_data(hit_cache, res, data);
        }
    );
}

function get_repo_info (req,res) {
    //'/info/:username/:reponame/'
    var username       = req.params.username;
    var reponame       = req.params.reponame;
    var repo_name_full = username + "/" + reponame;

    logger(1, "getting info from repo", repo_name_full);

    var data = { "username": username, "reponame": reponame, "status": 1, "status_desc": "getting info from repo " + repo_name_full };

    dockerhub.get_repo_info(repo_name_full, false,
        function(hit_cache, info) {
            if (!info) {
                logger(1, "no info");

                data.status      = 2;
                data.status_desc = "error getting info for repository " + repo_name_full;

                send_data(false, res, data);
                return;
            }

            data.status      = 0;
            data.status_desc = "succes";
            data.data        = info;
            send_data(hit_cache, res, data);
        }
    );
}

function get_repo_history (req,res) {
    //'/history/:username/:reponame/'
    var username       = req.params.username;
    var reponame       = req.params.reponame;
    var repo_name_full = username + "/" + reponame;

    logger(1, "getting history from repo", repo_name_full);

    var data = { "username": username, "reponame": reponame, "status": 1, "status_desc": "getting history from repo " + repo_name_full };

    dockerhub.get_build_history(repo_name_full, false,
        function(hit_cache, hist) {
            if (!hist) {
                logger(1, "no history");

                data.status      = 2;
                data.status_desc = "error getting history for repository " + repo_name_full;

                send_data(false, res, data);
                return;
            }

            data.status      = 0;
            data.status_desc = "succes";
            data.data        = hist;

            send_data(hit_cache, res, data);
        }
    );
}

function get_build_log (req,res) {
    //'/log/:username/:reponame/:build_code'
    var username       = req.params.username;
    var reponame       = req.params.reponame;
    var build_code     = req.params.build_code;
    var repo_name_full = username + "/" + reponame;

    logger(1, "getting log from repo", repo_name_full, 'build', build_code);

    var data = { "username": username, "reponame": reponame, "buid_code": build_code, "status": 1, "status_desc": "getting log from repo " + repo_name_full + ' build ' + build_code };

    dockerhub.get_build_log(repo_name_full, build_code, false,
        function(hit_cache, logs) {
            if (!logs) {
                logger(1, "no logs");

                data.status      = 2;
                data.status_desc = "error getting logs for repository " + repo_name_full + " build " + build_code;

                send_data(false, res, data);
                return;
            }

            data.status      = 0;
            data.status_desc = "succes";
            data.data        = logs;

            send_data(hit_cache, res, data);
        }
    );
}


function update(req,res) {
    dockerhub.cacher.clean();
    res.json({'res': true});
}


function get_all(req,res) {
    var username = req.params.username;

    logger(1, "getting username", username  );
    logger(2, "req"             , req.params);

    var no_cache = false;

    get_all_username(username, req.app, no_cache,
        function(data) {
            if ( data.status == 1 ) {
                var repos = data.data;
                get_all_repo(username, repos, req.app, no_cache,
                    function(data) {
                        send_data(res, data);
                    }
                );
            } else {
                send_data(res, data);
            }
        }
    );
}


function get_all_users(src, dst, ind, app, no_cache, clbk) {
    var username = src[ind];

    logger(1, "get_users: src", src, 'dst', dst, 'ind', ind, 'no_cache', no_cache, 'username', username);

    get_all_username(username, app, no_cache,
        function get_all_username_callback(data) {
            logger(1, 'render_dynamic: converting to html');

            if ( data.status == 1 ) {
                var repos = data.data;

                get_all_repo(username, repos, app, no_cache,
                    function get_all_repo_callback(data) {
                        if ( data.status != 0 ) {
                            logger(1, 'render_dynamic: error getting data', data);
                            clbk(false);

                        } else {
                            logger(1, 'render_dynamic: success getting data');

                            var results    = data.data.results;
                            var cache_time = data.data.cache_time;

                            results.sort(compare_info);

                            dst.push([results, cache_time, username]);

                            if (ind == (src.length - 1)) {
                                clbk(true);

                            } else {
                                get_all_users(src, dst, ind+1, app, no_cache, clbk);

                            }
                        }
                    }
                );
            } else {
                logger(1, 'render_dynamic: error getting data', data);
                clbk(false);
            }
        }
    );
}


function get_all_username(username, app, no_cache, callback) {
    var data = {
        "username"   : username,
        "status"     : 1,
        "status_desc": "getting data"
    };

    logger(1, 'get_all_username: username', username);

    dockerhub.get_repos(username, no_cache,
        function get_repos_callback(hit_cache, repos) {

            logger(2, 'get_all_username: username', username, 'repos');

            if (!repos) {
                logger(2, 'get_all_username: username', username, "no repos");

                data.status      = 2;
                data.status_desc = "error getting list of repositories";

                callback(data);

                return;
            }

            logger(2, 'get_all_username: username', username, "success getting repository list");

            /*
            if ( app.conf.DEBUG > 1 ) {
                logger(2, 'get_all_username: username', username, "got repos", 'DEBUGGING', app.conf.DEBUG, 'ONLY REPORTING ONE REPOSITORY');
                if ( repos.results.length > 2 ) {
                    repos.results = [ repos.results[2] ];

                } else
                if ( repos.results.length > 1 ) {
                    repos.results = [ repos.results[1] ];

                }
            }
            */

            var repo_list = repos.results;

            logger(2, 'get_all_username: username', username, "got repos", "# repos", repo_list.length);

            if (repo_list.length == 0) {
                logger(2, 'get_all: username', username, "got repos", "zero repos");

                data.status      = 3;
                data.status_desc = "no repositories";

                callback(data);

            } else {
                logger(2, 'get_all: username', username, "got repos", repo_list.length, "repos");
                data.data        = repos;
                callback(data);

            }
        }
    );
}


function get_all_repo(username, repos, app, no_cache, callback) {
    var data = {
        "username"   : username,
        "status"     : 1,
        "status_desc": "getting data"
    };

    /*
    if ( app.conf.DEBUG > 1 ) {
        logger(1, 'get_all_username: username', username, "got repos", 'DEBUGGING', app.conf.DEBUG, 'ONLY REPORTING ONE REPOSITORY');
        if ( repos.results.length > 2 ) {
            repos.results = [ repos.results[2] ];

        } else
        if ( repos.results.length > 1 ) {
            repos.results = [ repos.results[1] ];

        }
    }
    */


    logger(3, 'get_all_username: username', username, "repos", repos);
    var repo_list = repos.results;
    logger(3, 'get_all_username: username', username, "repo list", repo_list);


    function info_getter(el, clbk) {
        logger(2, 'get_all_username: username', username, "getting info");

        var repo_name      = el.name;
        var repo_space     = el.namespace;
        var repo_name_full = repo_space + '/' + repo_name;

        dockerhub.get_repo_info(repo_name_full, no_cache, clbk);
    }

    _get_from_list_serial(repo_list, 'info', 0, info_getter, no_cache,
        function _get_from_list_serial_callback(status, msg, list_size){
            logger(2, 'get_all_username: username', username, "got info");

            if (!status) {
                logger(2, 'get_all_username: username', username, "got info", "failed getting repository information");

                data.status      = 4;
                data.status_desc = "failed getting repository information. " + msg;

                callback(data);
                return;
            }

            logger(2, 'get_all_username: username', username, "got info", "success getting repository information");

            function hist_getter(el, clbk) {
                logger(2, 'get_all_username: username', username, "getting history");

                var repo_name      = el.name;
                var repo_space     = el.namespace;
                var repo_name_full = repo_space + '/' + repo_name;

                dockerhub.get_build_history(repo_name_full, no_cache, clbk);
            }

            _get_from_list_serial(repo_list, 'history', 0, hist_getter, no_cache,
                function _get_from_list_serial_callback(status, msg, list_size){
                    logger(2, 'get_all_username: username', username, "got history");

                    if (!status) {
                        logger(2, 'get_all_username: username', username, "got hist", "failed getting repository history");

                        data.status      = 5;
                        data.status_desc = "failed getting repository history. " + msg;

                        callback(data);
                        return;
                    }

                    logger(2, 'get_all_username: username', username, "got hist", "success getting repository history");

                    //logger(repo_list);
                    var histories = [];
                    for ( var r in repo_list ) {
                        var rel = repo_list[r];
                        var rhi = rel.history.results;
                        logger(3, 'get_all_username: username', username, "got hist", "repo_list #",r,'name',rel.name,'namespace',rel.namespace);
                        //logger('get_all: username', username, "got hist", "repo_list #",r,'rel',rel);
                        //logger('get_all: username', username, "got hist", "repo_list #",r,'rhi',rhi);

                        /*
                        for (var h in rhi ) {
                            //rhi[h].name      = rel.name;
                            //rhi[h].namespace = rel.namespace;
                            histories.push(rhi[h]);
                        }
                        */

                        if ( rhi && rhi.length > 0 ) {
                            rhi[0].name      = rel.name;
                            rhi[0].namespace = rel.namespace;
                            histories.push( rhi[0] );
                            logger(3, 'get_all_username: username', username, "got hist", "repo_list #",r,'pushed');

                        } else {
                            logger(3, 'get_all_username: username', username, "got hist", "repo_list #",r,'has no history');
                        }
                    }


                    logger(3, 'get_all_username: username', username, "got hist", 'histories:', histories);


                    function log_getter(el, clbk) {
                        logger(3, 'get_all_username: username', username, "getting log");

                        var repo_name      = el.name;
                        var repo_space     = el.namespace;
                        var build_code     = el.build_code;
                        var repo_name_full = repo_space + '/' + repo_name;

                        dockerhub.get_build_log(repo_name_full, build_code, no_cache, clbk);
                    }

                    _get_from_list_serial(histories, 'log', 0, log_getter, no_cache,
                        function _get_from_list_serial_callback(status, msg, list_size){
                            logger(3, 'get_all_username: username', username, "got log");
                            if (!status) {
                                logger(3, 'get_all_username: username', username, "got log", "failed getting build log");

                                data.status      = 6;
                                data.status_desc = "failed getting build log. " + msg;

                                callback(data);
                                return;
                            }

                            logger(3, 'get_all_username: username', username, "got log", "success getting build log");

                            data.status      = 0;
                            data.status_desc = "success";
                            data.data        = repos;

                            callback(data);
                            return;
                        }
                    );
                }
            );
        }
    );
}


function _get_from_list_serial(list, key, list_pos, func, no_cache, clbk) {
    logger(3, '_get_from_list_serial: key', key, 'list_pos', list_pos, 'no_cache', no_cache);

    var list_size = list.length;

    func(list[list_pos],
        function _get_from_list_serial_func_callback(hit_cache, res) {
            if (!res) {
                logger(3, '_get_from_list_serial: key', key, 'list_pos', list_pos, 'no_cache', no_cache, "no res #", list_pos + 1, "/", list_size, ' key: ', key);
                clbk(false, "error getting res: " + list_size, list_size);

            } else {
                logger(3, '_get_from_list_serial: key', key, 'list_pos', list_pos, 'no_cache', no_cache, "got res. #", list_pos + 1, "/", list_size, ' key: ', key);
                list[ list_pos ][ key ] = res;

                if ( list_pos == (list_size - 1) ) {
                    logger(3, '_get_from_list_serial: key', key, 'list_pos', list_pos, 'no_cache', no_cache, "got all data. #", list_pos + 1, "/", list_size, ' key: ', key);
                    clbk(true, "success getting all data: " + list_size);

                } else {
                    logger(3, '_get_from_list_serial: key', key, 'list_pos', list_pos, 'no_cache', no_cache, "getting next data. #", list_pos + 1, "/", list_size, ' key: ', key);
                    _get_from_list_serial(list, key, list_pos + 1, func, no_cache, clbk);

                }
            }
        }
    );
}


function render_dynamic(req, res, file, render_as, no_cache) {
    var username = req.params.username;

    logger(3, "render_dynamic: req"             , req.params);
    logger(2, "render_dynamic: getting username", username  );
    logger(2, "render_dynamic: file"            , file      );
    logger(3, "render_dynamic: render_as"       , render_as );

    var all_results = [];

    var clbk = function render_dynamic_callback(success) {
        if (success) {
            res.set('Content-Type', 'text/'+render_as);

            logger(2, 'render_dynamic: rendering');
            res.render(
                file,
                {
                    file         : file,
                    all_results  : all_results,
                    num_sessions : req.app.mods.sessionCounter.get_num_sessions_sync(),
                    num_views    : req.app.mods.sessionCounter.get_num_views_sync(),
                    conf         : req.app.conf
                }
            );
        } else {
            logger(2, 'render_dynamic: failed to get data', all_results);

            if (all_results.length == 0) {
                logger(3, 'render_dynamic: failed to get data. no result');

                res.set('Content-Type', 'text/xml' );

                res.send(
                    '<h2>Error</h2>\n'+
                    '<h3>Error Number: -1 </h3>\n'+
                    '<h4>Error: No data</h4>\n'
                );

            } else {
                logger(3, 'render_dynamic: failed to get data. error message');

                res.set('Content-Type', 'text/xml' );

                res.send(
                    '<h2>Error</h2>\n'+
                    '<h3>Error Number: ' + all_results[all_results.length -1].status      + '</h3>\n'+
                    '<h4>Error: '        + all_results[all_results.length -1].status_desc + '</h4>\n'
                );
            }
        }
    };

    var users = username.split("|");
    get_all_users(users, all_results, 0, req.app, no_cache, clbk);
}


function dynamic_xml(req,res) {
    var no_cache = false;
    render_dynamic(req, res, 'base', 'xml', no_cache);
}


function dynamic_html(req,res) {
    var no_cache = false;
    render_dynamic(req, res, 'index', 'html', no_cache);
}


function compare_info(a,b) {
    if (a.name < b.name) {
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }
    return 0;
}





//Filter username
function filter_username(req, res, func) {
    var app = req.app;

    if ( app.conf.HAS_FILTER && req.method == 'GET' && 'username' in req.params ) { // Has filter
        var username       = req.params.username;
        if ( app.conf.ALLOWED_REPOS.length > 0 ) { // Has whitelist
            if ( app.conf.ALLOWED_REPOS.indexOf( username ) != -1 ) { // Has whitelist. In whitelist
                logger(2, 'Has filter. Has whitelist. In whitelist', username, app.conf.ALLOWED_REPOS, app.conf.FORBIDDEN_REPOS);
                func(req, res); // proceed
                return;

            } else { // Has whitelist. Not in whitelist
                logger(2, 'Has filter. Has whitelist. Not in whitelist', username, app.conf.ALLOWED_REPOS, app.conf.FORBIDDEN_REPOS);
                res.status(401)        // HTTP status 304: NotAllowed
                    .send('Not allowed');
                return;

            }
        } else { // No whitelist list
            logger(2, 'No whitelist list', username);
            if ( app.conf.FORBIDDEN_REPOS.length > 0 ) { // No whitelist list. Has blacklist
                logger(2, 'Has filter. No whitelist list. Has blacklist', username, app.conf.ALLOWED_REPOS, app.conf.FORBIDDEN_REPOS);

                if ( !(app.conf.FORBIDDEN_REPOS.indexOf( username ) != -1) ) { // No whitelist list. Has blacklist. Not in blacklist
                    logger(2, 'Has filter. No whitelist list. Has blacklist. Not in blacklist', username, app.conf.ALLOWED_REPOS, app.conf.FORBIDDEN_REPOS);
                    func(req, res); // proceed
                    return;

                } else { // No whitelist list. Has blacklist. In blacklist
                    logger(2, 'Has filter. No whitelist list. Has blacklist. In blacklist', username, app.conf.ALLOWED_REPOS, app.conf.FORBIDDEN_REPOS);
                    res.status(401)        // HTTP status 304: NotAllowed
                        .send('Not allowed');

                }
            } else { // No blacklist
                logger(2, 'Has filter. No blacklist', username, app.conf.ALLOWED_REPOS, app.conf.FORBIDDEN_REPOS);
                func(req, res); // proceed
                return;

            }
        }
    } else { // No filter
        logger(3, 'No filter', username, app.conf.ALLOWED_REPOS, app.conf.FORBIDDEN_REPOS);
        func(req, res);

    }
}


function add_filter( filter, func ) {
    return function (req, res) {
        filter(req, res, func);
    };
}


exports.init             = init;

exports.get_all_users    = get_all_users;
exports.get_all_username = get_all_username;
exports.get_all_repo     = get_all_repo;

exports.get_all          = add_filter( filter_username, get_all          );
exports.get_repos        = add_filter( filter_username, get_repos        );
exports.get_repo_info    = add_filter( filter_username, get_repo_info    );
exports.get_repo_history = add_filter( filter_username, get_repo_history );
exports.get_build_log    = add_filter( filter_username, get_build_log    );
exports.update           = add_filter( filter_username, update           );
exports.dynamic_xml      = add_filter( filter_username, dynamic_xml      );
exports.dynamic_html     = add_filter( filter_username, dynamic_html     );
