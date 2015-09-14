var    cookieParser     = require( 'cookie-parser'   ),
       cookieSession    = require( 'cookie-session'  ),
       storage          = require( 'node-persist'    ),
	   time             = require( 'time'            );
	
var NUM_VIEWS    = 0;
var NUM_SESSIONS = 0;

function init(app) {
    app.mods.cookieParser     = cookieParser;
    app.mods.cookieSession    = cookieSession;
    app.mods.storage          = storage;
    
    var tmp_folder = 'tmp/';
    console.log('tmp_folder', tmp_folder);
    storage.initSync({dir: tmp_folder, ttl: false, loggin: true});

    app.use(cookieParser('ILuvCookies'));
    app.use(
        cookieSession(
            {
                name: 'dockerhubuibiodocker',
                keys: ['firstvisit', new time.Date()]
            }
        )
    );

    app.set('trust proxy', 1) // trust first proxy
    
    app.use(session_keeper);

    app.get(    '/usage/'                                , get_usage);

    NUM_SESSIONS = get_num_sessions_sync();
    NUM_VIEWS    = get_num_views_sync();
    
    console.log('NUM_SESSIONS', NUM_SESSIONS);
    console.log('NUM_VIEWS'   , NUM_VIEWS   );
}



function session_keeper(req, res, next) {
  // Update views
  if (req.url == '/') {
    //console.log("req url", req.url);
    req.session.views = (req.session.views || 0) + 1
    //console.log("req", req);
    //console.log("req session", JSON.stringify(req.session));
    //console.log("req session views", req.session.views);
    var cookie_id = req.cookies.dockerhubuibiodocker;
    console.log("req cookie_id", cookie_id);
    if (req.session.isNew) {
        console.log("adding session");
        add_session(cookie_id);
        add_view();
    } {
        console.log("adding view");
        add_view();
    }
  } else {
      //console.log("req url", req.url);
  }
  // Write response
  //res.end(req.session.views + ' views')
  next();
}

function get_usage(req,res) { 
    console.log("reporting sever usage: sessions:", NUM_SESSIONS, "views:", NUM_VIEWS);
    res.json({"num_sessions": NUM_SESSIONS || -1, "num_views": NUM_VIEWS || -1});
}


function get_num_sessions(clbk) {
    storage.getItem('num_sessions', clbk);
}

function get_num_sessions_sync() {
    return storage.getItemSync('num_sessions') || 0;
}

function set_num_sessions(val, clbk) {
    storage.setItem('num_sessions', val, clbk);
}

function add_session() {
    console.log('adding session');
    get_num_sessions(
        function(err, num_sessions) {
            if (err) {
                console.log("adding session :: error getting num_sessions", num_sessions);
                return;
            }
            if (!num_sessions) {
                console.log("adding session :: no num_sessions", num_sessions);
                num_sessions = 0;
            }
            set_num_sessions(num_sessions+1,
                function (err) {
                    if (!err) {
                        NUM_SESSIONS = num_sessions+1;
                        console.log("adding session :: new session", num_sessions+1);
                    } else {
                        console.error("adding session :: error adding num_sessions", err);
                    }
                }
            );
        }
    );
}

function get_num_views(clbk) {
    storage.getItem('num_views', clbk);
}

function get_num_views_sync() {
    return storage.getItemSync('num_views') || 0;
}

function set_num_views(val, clbk) {
    storage.setItem('num_views', val, clbk);
}

function add_view() {
    console.log('adding view');
    get_num_views(
        function(err, num_views) {
            if (err) {
                console.log("adding view :: error getting num_views", err);
                return;
            }
            if (!num_views) {
                console.log("adding view :: no num_views", err);
                num_views = 0;
            }
            console.log("adding view :: got num_views", num_views);
            set_num_views( num_views+1, 
                function(err) {
                    if (!err) {
                        console.log("adding view :: set num_views", num_views+1);
                        NUM_VIEWS = num_views+1;
                    } else {
                        console.error("adding view :: error adding num_views", err);
                    }
                }
            );
        }
    );
}

exports.init                  = init;
exports.get_num_views         = get_num_views;
exports.get_num_views_sync    = get_num_views_sync;
exports.get_num_sessions      = get_num_sessions;
exports.get_num_sessions_sync = get_num_sessions_sync;