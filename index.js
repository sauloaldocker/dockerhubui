var ip                    = process.env.IP              || process.env.OPENSHIFT_NODEJS_IP   || "0.0.0.0";
var port                  = process.env.PORT            || process.env.OPENSHIFT_NODEJS_PORT || 8080;
var DOCKERHUB_URL         = process.env.DOCKERHUB_URL   || 'https://hub.docker.com/';
var GIT_URL               = process.env.GIT_URL         || 'https://github.com/';
var DEBUG                 = process.env.DEBUG           || false;
var ALLOWED_REPOS         = process.env.ALLOWED_REPOS   || "biodckr,sauloal";
var FORBIDDEN_REPOS       = process.env.FORBIDDEN_REPOS || "";
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


ALLOWED_REPOS             = ALLOWED_REPOS.split(',');
FORBIDDEN_REPOS           = FORBIDDEN_REPOS.split(',');

if ( ALLOWED_REPOS[0]   == "" ) { ALLOWED_REPOS   = [] }
if ( FORBIDDEN_REPOS[0] == "" ) { FORBIDDEN_REPOS = [] }

app.conf                  = {};
app.conf.application_root = application_root;
app.conf.port             = port;
app.conf.ip               = ip;
app.conf.DOCKERHUB_URL    = DOCKERHUB_URL;
app.conf.GIT_URL          = GIT_URL;
app.conf.DEBUG            = DEBUG;
app.conf.ALLOWED_REPOS    = ALLOWED_REPOS;
app.conf.FORBIDDEN_REPOS  = FORBIDDEN_REPOS;
app.conf.HAS_FILTER       = ( ALLOWED_REPOS.length > 0 || FORBIDDEN_REPOS.length > 0 );

console.log('ALLOWED_REPOS  ', app.conf.ALLOWED_REPOS  , app.conf.ALLOWED_REPOS.length   );
console.log('FORBIDDEN_REPOS', app.conf.FORBIDDEN_REPOS, app.conf.FORBIDDEN_REPOS.length );
console.log('HAS_FILTER     ', app.conf.HAS_FILTER                                       );

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
app.get(    '/xml/:username/'                        , getters.dynamic_xml      );
app.get(    '/html/:username/'                       , getters.dynamic_html     );
//app.get(    '/update/'                               , getters.update           );

exports.app      = app;

app.listen( port, ip, function() {
    console.warn( 'Express server listening on http://%s:%s', ip, port );
});

