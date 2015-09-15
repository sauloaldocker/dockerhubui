var ip                    = process.env.IP            || "0.0.0.0";
var port                  = process.env.PORT          || 8080;
var DOCKERHUB_URL         = process.env.DOCKERHUB_URL || 'https://hub.docker.com/';
var DEBUG                 = process.env.DEBUG         || false;
//var DEBUG                 = process.env.DEBUG         || true;
console.log('DEBUG', DEBUG);

var application_root      = __dirname,
    express               = require( 'express'         ),   //Web framework
    request               = require( 'request'         )    //Web request
	;

var expresser             = require( './expresser.js'       );
var getters               = require( './getters.js'         );
var logger                = require( './logger.js'          );
var sessionCounter        = require( './session_counter.js' );
var swigger               = require( './swigger.js'         );

var app                   = express();

app.conf                  = {};
app.conf.application_root = application_root;
app.conf.port             = port;
app.conf.ip               = ip;
app.conf.DOCKERHUB_URL    = DOCKERHUB_URL;
app.conf.DEBUG            = DEBUG;

app.mods                  = {};
app.mods.console          = console;
app.mods.express          = express;
app.mods.request          = request;

app.mods.expresser        = expresser;
app.mods.getters          = getters;
app.mods.logger           = logger;
app.mods.sessionCounter   = sessionCounter;
app.mods.swigger          = swigger;




console.warn( 'application_root: ', application_root );


sessionCounter.init(app); //Cookies and user count
swigger.init(app);        //Swig
expresser.init(app);      //Express


//Add app to all requests
function add_app(req, res, next) {
    req.app = app;
    next();
}
app.use(add_app);


//Set routes 
app.get(    '/repos/:username/'                      , getters.get_repos        );
app.get(    '/info/:username/:reponame/'             , getters.get_repo_info    );
app.get(    '/history/:username/:reponame/'          , getters.get_repo_history );
app.get(    '/logs/:username/:reponame/:build_code/' , getters.get_build_log    );
app.get(    '/update/'                               , getters.update           );
app.get(    '/xml/:username/'                        , getters.dynamic_xml      );
app.get(    '/html/:username/'                       , getters.dynamic_html     );


exports.app      = app;

app.listen( port, ip, function() {
    console.warn( 'Express server listening on http://%s:%s', ip, port );
});

