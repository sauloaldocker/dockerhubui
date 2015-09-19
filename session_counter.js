var cookieParser     = require( 'cookie-parser'   ),
    cookieSession    = require( 'cookie-session'  ),
    storage          = require( 'node-persist'    ),
	time             = require( 'time'            ),
    logger           = require( './logger.js'     )
	;


var NUM_VIEWS        = 0;
var NUM_SESSIONS     = 0;

function init(app) {
    app.mods.cookieParser     = cookieParser;
    app.mods.cookieSession    = cookieSession;
    app.mods.storage          = storage;

    console.log( 'default     ', app.conf.session_counter.default      );
    console.log( 'session_name', app.conf.session_counter.session_name );
    console.log( 'secret      ', app.conf.session_counter.secret       );
    console.log( 'trust_proxy ', app.conf.session_counter.trust_proxy  );

    storage.initSync( app.conf.session_counter.default );

    app.use(cookieParser(app.conf.session_counter.secret));

    app.use(
        cookieSession(
            {
                name: app.conf.session_counter.session_name,
                keys: ['server_start', new time.Date()]
            }
        )
    );

    app.set('trust proxy', app.conf.session_counter.trust_proxy); // trust first proxy
    
    app.use(session_keeper);

    app.get(    '/usage/'                                , get_usage);

    NUM_SESSIONS = get_num_sessions_sync();
    NUM_VIEWS    = get_num_views_sync();
    
    logger(3, 'NUM_SESSIONS', NUM_SESSIONS);
    logger(3, 'NUM_VIEWS'   , NUM_VIEWS   );
}



function session_keeper(req, res, next) {
  // Update views
  if (req.url == '/') {
    //logger(3, "req url", req.url);
    req.session.views = (req.session.views || 0) + 1;
    //logger(3, "req", req);
    //logger(3, "req session", JSON.stringify(req.session));
    //logger(3, "req session views", req.session.views);

    var cookie_id = req.cookies.dockerhubuibiodocker;

    logger(3, "req cookie_id", cookie_id);

    if (req.session.isNew) {
        logger(3, "adding session");
        add_session(cookie_id);
        add_view();

    } {
        logger(3, "adding view");
        add_view();

    }
  } else {
      logger(3, "req url", req.url);

  }
  // Write response
  //res.end(req.session.views + ' views')
  next();
}


function get_usage(req,res) { 
    logger(3, "reporting sever usage: sessions:", NUM_SESSIONS, "views:", NUM_VIEWS);
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
    logger(3, 'adding session');
    get_num_sessions(
        function(err, num_sessions) {
            if (err) {
                logger(3, "adding session :: error getting num_sessions", num_sessions);
                return;
            }
            if (!num_sessions) {
                logger(3, "adding session :: no num_sessions", num_sessions);
                num_sessions = 0;
            }
            set_num_sessions(num_sessions+1,
                function (err) {
                    if (!err) {
                        NUM_SESSIONS = num_sessions+1;
                        logger(3, "adding session :: new session", num_sessions+1);
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
    logger(3, 'adding view');
    get_num_views(
        function(err, num_views) {
            if (err) {
                logger(3, "adding view :: error getting num_views", err);
                return;
            }
            if (!num_views) {
                logger(3, "adding view :: no num_views", err);
                num_views = 0;
            }
            logger(3, "adding view :: got num_views", num_views);
            set_num_views( num_views+1, 
                function(err) {
                    if (!err) {
                        logger(3, "adding view :: set num_views", num_views+1);
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
