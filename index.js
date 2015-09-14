var ip               = process.env.IP   || "0.0.0.0";
var port             = process.env.PORT || 8080;
var DOCKERHUB_URL    = 'https://hub.docker.com/';

var application_root = __dirname,
    express          = require( 'express'         ),   //Web framework
	//path             = require( 'path'            ),
    request          = require( 'request'         )
	;


var getters          = require( './getters.js'         );
var sessionCounter   = require( './session_counter.js' );
var swigger          = require( './swigger.js'         );
var expresser        = require( './expresser.js'       );


var app  = express();

app.conf = {};
app.conf.application_root = application_root;
app.conf.port             = port;
app.conf.ip               = ip;
app.conf.DOCKERHUB_URL    = DOCKERHUB_URL;

app.mods = {}
app.mods.console          = console;
app.mods.express          = express;
app.mods.request          = request;

app.mods.getters          = getters;
app.mods.sessionCounter   = sessionCounter;
app.mods.swigger          = swigger;
app.mods.expresser        = expresser;


console.log( 'application_root: ', application_root );


//Cookies and user count
sessionCounter.init(app);

//Swig
swigger.init(app);

//Express
expresser.init(app);

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
app.get(    '/xml/:username/'                        , getters.static_xml       );


exports.app      = app;

app.listen( port, ip, function() {
    console.log( 'Express server listening on http://%s:%s', ip, port);
});

