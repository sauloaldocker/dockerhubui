var ip                 = process.env.IP   || "0.0.0.0";
var port               = process.env.PORT || 8080;

var application_root = __dirname,
    bodyParser       = require( 'body-parser'     ),
	compression      = require( 'compression'     ),
    cookieParser     = require( 'cookie-parser'   ),
	errorHandler     = require( 'errorhandler'    ),
    express          = require( 'express'         ),   //Web framework
	methodOverride   = require( 'method-override' ),
	path             = require( 'path'            ),
    request          = require( 'request'         ),
    requestCaching   = require( 'node-request-caching' ),
    serveStatic      = require( 'serve-static'    ),
	serveFavicon     = require( 'serve-favicon'   );

var getters          = require( './getters.js'    );


var app = express();

app.conf = {};
app.conf.application_root = application_root;
app.conf.port             = port;
app.conf.ip               = ip;

app.mods = {}
app.mods.console          = console;
app.mods.bodyParser       = bodyParser;
app.mods.compression      = compression;
app.mods.cookieParser     = cookieParser;
app.mods.errorHandler     = errorHandler;
app.mods.express          = express;
app.mods.request          = request,
app.mods.requestCaching   = requestCaching;
app.mods.serveStatic      = serveStatic,
app.mods.serveFavicon     = serveFavicon;


console.log( 'application_root: ', application_root );


//http://stackoverflow.com/questions/25550819/error-most-middleware-like-bodyparser-is-no-longer-bundled-with-express
// parse application/json
app.use( bodyParser.json() );

// parse application/x-www-form-urlencoded
app.use( bodyParser.urlencoded({ extended: true, uploadDir: app.tempPath }) );


//checks request.body for HTTP method overrides
app.use( methodOverride('X-HTTP-Method-Override') );

//allow data compression
app.use( compression() );

//Show all errors in development
app.use( errorHandler({ dumpExceptions: true, showStack: true }));

app.use(express.static('static', {etag: true}));

var checksum         = require( 'checksum'        );
app.set('etag', function (body, encoding) {
  return checksum(body); // consider the function is defined
})

//console.log('views path', path.join(application_root, 'views'));

//app.get(    '/'                                      , function (req,res) { res.redirect('/static/'); } );

app.get(    '/repos/:username/'                      , getters.get_repos        );
app.get(    '/info/:username/:reponame/'             , getters.get_repo_info    );
app.get(    '/history/:username/:reponame/'          , getters.get_repo_history );
app.get(    '/logs/:username/:reponame/:build_code/' , getters.get_build_log    );

exports.app      = app;

app.listen( port, ip, function() {
    console.log( 'Express server listening on http://%s:%s', ip, port);
});

