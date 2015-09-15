var dockerhub = require( './dockerhub.js' );
var logger    = require('./logger.js'     );

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

    logger("getting repos from username", username);
    
    var data = { "username": username, "status": 1, "status_desc": "getting repos from username " + username };

    dockerhub.get_repos(username, false,
        function(hit_cache, repos) {
            if (!repos) {
                logger("no repos");
                
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
    
    logger("getting info from repo", repo_name_full);
    
    var data = { "username": username, "reponame": reponame, "status": 1, "status_desc": "getting info from repo " + repo_name_full };
    
    dockerhub.get_repo_info(repo_name_full, false,
        function(hit_cache, info) {
            if (!info) {
                logger("no info");
                
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
    
    logger("getting history from repo", repo_name_full);

    var data = { "username": username, "reponame": reponame, "status": 1, "status_desc": "getting history from repo " + repo_name_full };
    
    dockerhub.get_build_history(repo_name_full, false,
        function(hit_cache, hist) {
            if (!hist) {
                logger("no history");
                
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

    logger("getting log from repo", repo_name_full, 'build', build_code);

    var data = { "username": username, "reponame": reponame, "buid_code": build_code, "status": 1, "status_desc": "getting log from repo " + repo_name_full + ' build ' + build_code };
    
    dockerhub.get_build_log(repo_name_full, build_code, false,
        function(hit_cache, logs) {
            if (!logs) {
                logger("no logs");
                
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


function getter(req,res) { 
    var username = req.params.username;

    logger("req"             , req.params);
    logger("getting username", username  );
    
    get_all(username, function(data) {
        send_data(res, data);
    });
}

function get_all(username, app, callback) {
    var data = {
        "username"   : username,
        "status"     : 1,
        "status_desc": "getting data"
    };
    
    logger('get_all: username', username);
    
    dockerhub.get_repos(username, false,
        function (hit_cache, repos) {

            logger('get_all: username', username, 'repos');

            if (!repos) {
                logger('get_all: username', username, "no repos");
                
                data.status      = 2;
                data.status_desc = "error getting list of repositories";
                
                callback(data);
                return;
            }
            
            logger('get_all: username', username, "success getting repository list");
            
            if ( app.conf.DEBUG ) {
                logger('get_all: username', username, "got repos", 'DEBUGGING', app.conf.DEBUG, 'ONLY REPORTING ONE REPOSITORY');
                if ( repos.results.length > 2 ) {
                    repos.results = [ repos.results[2] ];
                } else
                if ( repos.results.length > 1 ) {
                    repos.results = [ repos.results[1] ];
                }
            }
            
            
            var repo_list = repos.results;

            logger('get_all: username', username, "got repos", "# repos", repo_list.length);

            if (repo_list.length == 0) {
                logger('get_all: username', username, "got repos", "zero repos");
                
                data.status      = 3;
                data.status_desc = "no repositories";
                
                callback(data);
                return;
            }


            function info_getter(el, clbk) {
                logger('get_all: username', username, "getting info");
                
                var repo_name      = el.name;
                var repo_space     = el.namespace;
                var repo_name_full = repo_space + '/' + repo_name;

                dockerhub.get_repo_info(repo_name_full, false, clbk);
            }

            _get_from_list_serial(repo_list, 'info', 0, info_getter, false,
                function(status, msg, list_size){
                    logger('get_all: username', username, "got info");
                    
                    if (!status) {
                        logger('get_all: username', username, "got info", "failed getting repository information");

                        data.status      = 4;
                        data.status_desc = "failed getting repository information. " + msg;
    
                        callback(data);
                        return;
                    }
                    
                    logger('get_all: username', username, "got info", "success getting repository information");
                    

                    function hist_getter(el, clbk) {
                        logger('get_all: username', username, "getting history");
                        
                        var repo_name      = el.name;
                        var repo_space     = el.namespace;
                        var repo_name_full = repo_space + '/' + repo_name;
        
                        dockerhub.get_build_history(repo_name_full, false, clbk);
                    }
                    
                    _get_from_list_serial(repo_list, 'history', 0, hist_getter, false,
                        function(status, msg, list_size){
                            logger('get_all: username', username, "got history");
                            
                            if (!status) {
                                logger('get_all: username', username, "got hist", "failed getting repository history");
                                
                                data.status      = 5;
                                data.status_desc = "failed getting repository history. " + msg;
            
                                callback(data);
                                return;
                            }
                            
                            logger('get_all: username', username, "got hist", "success getting repository history");

                            //logger(repo_list);
                            var histories = [];
                            for ( var r in repo_list ) {
                                var rel = repo_list[r];
                                var rhi = rel.history.results;
                                logger('get_all: username', username, "got hist", "repo_list #",r,'name',rel.name,'namespace',rel.namespace, 'length', rhi.length);
                                //logger('get_all: username', username, "got hist", "repo_list #",r,'rel',rel);
                                //logger('get_all: username', username, "got hist", "repo_list #",r,'rhi',rhi);
                                
                                /*
                                for (var h in rhi ) {
                                    //rhi[h].name      = rel.name;
                                    //rhi[h].namespace = rel.namespace;
                                    histories.push(rhi[h]);
                                }
                                */
                                
                                if ( rhi.length > 0 ) {
                                    rhi[0].name      = rel.name;
                                    rhi[0].namespace = rel.namespace;
                                    histories.push( rhi[0] );
                                    logger('get_all: username', username, "got hist", "repo_list #",r,'pushed');
                                } else {
                                    logger('get_all: username', username, "got hist", "repo_list #",r,'has no history');
                                }
                            }

                            //logger('get_all: username', username, "got hist", 'histories:', histories);

                            function log_getter(el, clbk) {
                                logger('get_all: username', username, "getting log");
                                
                                var repo_name      = el.name;
                                var repo_space     = el.namespace;
                                var build_code     = el.build_code;
                                var repo_name_full = repo_space + '/' + repo_name;
                
                                dockerhub.get_build_log(repo_name_full, build_code, false, clbk);
                            }
                            
                            _get_from_list_serial(histories, 'log', 0, log_getter, false,
                                function(status, msg, list_size){
                                    logger('get_all: username', username, "got log");
                                    if (!status) {
                                        logger('get_all: username', username, "got log", "failed getting build log");
                                        
                                        data.status      = 6;
                                        data.status_desc = "failed getting build log. " + msg;
                    
                                        callback(data);
                                        return;
                                    }

                                    logger('get_all: username', username, "got log", "success getting build log");

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
    );
}


function _get_from_list_serial(list, key, list_pos, func, no_cache, clbk) {
    logger('_get_from_list_serial: key', key, 'list_pos', list_pos, 'no_cache', no_cache);

    var list_size = list.length;

    func(list[list_pos], 
        function(hit_cache, res) {
            if (!res) {
                logger('_get_from_list_serial: key', key, 'list_pos', list_pos, 'no_cache', no_cache, "no res #", list_pos + 1, "/", list_size, ' key: ', key);
                clbk(false, "error getting res: " + list_size, list_size);

            } else {
                logger('_get_from_list_serial: key', key, 'list_pos', list_pos, 'no_cache', no_cache, "got res. #", list_pos + 1, "/", list_size, ' key: ', key);
                list[ list_pos ][ key ] = res;
    
                if ( list_pos == (list_size - 1) ) {
                    logger('_get_from_list_serial: key', key, 'list_pos', list_pos, 'no_cache', no_cache, "got all data. #", list_pos + 1, "/", list_size, ' key: ', key);
                    clbk(true, "success getting all data: " + list_size);
                    
                } else {
                    logger('_get_from_list_serial: key', key, 'list_pos', list_pos, 'no_cache', no_cache, "getting next data. #", list_pos + 1, "/", list_size, ' key: ', key);
                    _get_from_list_serial(list, key, list_pos + 1, func, no_cache, clbk);
    
                }
            }
        }
    );
}


function render_dynamic(req, res, file, render_as) {
    var username = req.params.username;

    logger("render_dynamic: req"             , req.params);
    logger("render_dynamic: getting username", username  );
    logger("render_dynamic: file"            , file      );
    logger("render_dynamic: render_as"       , render_as );

    var all_results = [];

    var clbk = function(success) {
        if (success) {
            res.set('Content-Type', 'text/'+render_as);

            //logger(results[0]);
    
            logger('render_dynamic: rendering');
            res.render(
                file, 
                {
                    file         : file,
                    all_results  : all_results,
                    num_sessions : req.app.mods.sessionCounter.get_num_sessions_sync(),
                    num_views    : req.app.mods.sessionCounter.get_num_views_sync(),
                    DOCKERHUB_URL: req.app.conf.DOCKERHUB_URL,
                    GIT_URL      : req.app.conf.GIT_URL
                }
            );
        } else {
            //logger('render_dynamic: failed to get data', all_results);
            
            if (all_results.length == 0) {
                logger('render_dynamic: failed to get data. no result');
                
                res.set('Content-Type', 'text/xml' );

                res.send(
                    '<h2>Error</h2>\n'+
                    '<h3>Error Number: -1 </h3>\n'+ 
                    '<h4>Error: No data</h4>\n' 
                );

            } else {
                logger('render_dynamic: failed to get data. error message');

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
    get_users(users, all_results, 0, req.app, clbk);
}

function get_users(src, dst, ind, app, clbk) {
    var usr = src[ind];
    logger("get_users: src", src, 'dst', dst, 'ind', ind, 'usr', usr);
    
    get_all(usr, app,
        function(data){
            logger('render_dynamic: converting to html');
            
            if ( data.status != 0 ) {
                logger('render_dynamic: error getting data', data);
                clbk(false);
                
            } else {
                logger('render_dynamic: success getting data');
                var results    = data.data.results;
                var cache_time = data.data.cache_time;
                
                results.sort(compare_info);

                dst.push([results, cache_time, usr]);
                
                if (ind == (src.length - 1)) {
                    clbk(true)
                } else {
                    get_users(src, dst, ind+1, app, clbk);
                }
            }
        }
    );
}

function dynamic_xml(req,res) {
    render_dynamic(req, res, 'base', 'xml');
}


function dynamic_html(req,res) {
    render_dynamic(req, res, 'index', 'html');
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


exports.getter           = getter;
exports.get_repos        = get_repos;
exports.get_repo_info    = get_repo_info;
exports.get_repo_history = get_repo_history;
exports.get_build_log    = get_build_log;
exports.update           = update;
exports.dynamic_xml      = dynamic_xml;
exports.dynamic_html     = dynamic_html;
