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
    
    storage.initSync({dir:'tmp/', ttl: false});

    app.use(cookieParser('ILuvCookies'))
    app.use(cookieSession({
      name: 'dockerhubuibiodocker',
      keys: ['firstvisit', new time.Date()]
    }))
    app.set('trust proxy', 1) // trust first proxy
    
    app.use(session_keeper);

    app.get(    '/usage/'                                , get_usage);
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


function add_session() {
    storage.getItem('num_sessions', 
        function(err, num_sessions) {
            if (err) {
                console.log("error getting num_sessions", num_sessions);
                return;
            }
            if (!num_sessions) {
                num_sessions = 0;
            }
            storage.setItem('num_sessions',num_sessions+1,
                function (err) {
                    if (!err) {
                        NUM_SESSIONS = num_sessions+1;
                        console.log("new session", num_sessions+1);
                    } else {
                        console.error("error adding num_sessions", err);
                    }
                }
            );
        }
    );
}

function add_view() {
    storage.getItem('num_views', 
        function(err, num_views) {
            if (err) {
                console.log("error getting num_views", err);
                return;
            }
            if (!num_views) {
                num_views = 0;
            }
            console.log("got num_views", num_views);
            storage.setItem('num_views',num_views+1, 
                function(err) {
                    if (!err) {
                        console.log("set num_views", num_views+1);
                        NUM_VIEWS = num_views+1;
                    } else {
                        console.error("error adding num_views", err);
                    }
                }
            );
        }
    );
}

exports.init = init;
