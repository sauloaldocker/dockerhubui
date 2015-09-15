var express               = require( 'express'              ),   //Web framework
    request               = require( 'request'              )    //Web request
	;

var expresser             = require( './expresser.js'       ),
    getters               = require( './getters.js'         ),
    logger                = require( './logger.js'          ),
    sessionCounter        = require( './session_counter.js' ),
    swigger               = require( './swigger.js'         ),
    config                = require( './config.js'          )
    ;

var app                   = express();

app.mods                  = {};
app.mods.console          = console;
app.mods.express          = express;
app.mods.request          = request;

app.mods.expresser        = expresser;
app.mods.getters          = getters;
app.mods.logger           = logger;
app.mods.sessionCounter   = sessionCounter;
app.mods.swigger          = swigger;

config(app);

app.conf.ALLOWED_REPOS    = app.conf.ALLOWED_REPOS.split(',');
app.conf.FORBIDDEN_REPOS  = app.conf.FORBIDDEN_REPOS.split(',');

if ( app.conf.ALLOWED_REPOS[0]   == "" ) { app.conf.ALLOWED_REPOS   = [] }
if ( app.conf.FORBIDDEN_REPOS[0] == "" ) { app.conf.FORBIDDEN_REPOS = [] }

console.log( 'PORT            ', app.conf.PORT                                             );
console.log( 'IP              ', app.conf.IP                                               );
console.log( 'DOCKERHUB_URL   ', app.conf.DOCKERHUB_URL                                    );
console.log( 'APP_TITLE       ', app.conf.APP_TITLE                                        );
console.log( 'GIT_URL         ', app.conf.GIT_URL                                          );
console.log( 'DEBUG           ', app.conf.DEBUG                                            );
console.log( 'ALLOWED_REPOS   ', app.conf.ALLOWED_REPOS  , app.conf.ALLOWED_REPOS.length   );
console.log( 'FORBIDDEN_REPOS ', app.conf.FORBIDDEN_REPOS, app.conf.FORBIDDEN_REPOS.length );
console.log( 'HAS_FILTER      ', app.conf.HAS_FILTER                                       );
console.log( 'APPLICATION_ROOT', app.conf.APPLICATION_ROOT                                 );
console.log( 'DATA_DIR        ', app.conf.DATA_DIR                                         );
console.log( 'SWIG            ', app.conf.swig                                             );
console.log( 'SESSION_COUNTER ', app.conf.session_counter                                  );
console.log( 'CACHE           ', app.conf.cache                                            );


app.mods.sessionCounter.init(app); //Cookies and user count

app.mods.swigger.init(app);        //Swig

app.mods.getters.init(app);        //Endpoints

app.mods.expresser.init(app);      //Express


//Add app to all requests
function add_app(req, res, next) {
    req.app = app;
    next();
}
app.use(add_app);

exports.app      = app;

app.listen( app.conf.PORT, app.conf.IP, function() {
    console.warn( 'Express server listening on http://%s:%s', app.conf.IP, app.conf.PORT );
});

