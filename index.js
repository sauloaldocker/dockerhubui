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
    serveStatic      = require( 'serve-static'    ),
	serveFavicon     = require( 'serve-favicon'   );


var app = express();


app.console          = console;
app.application_root = application_root;
app.tempPath         = 

app.bodyParser       = bodyParser;
app.compression      = compression;
app.cookieParser     = cookieParser;
app.errorHandler     = errorHandler;
app.express          = express;
app.request          = request,
app.serveStatic      = serveStatic,
app.serveFavicon     = serveFavicon;


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

app.use(express.static('static'));

//console.log('views path', path.join(application_root, 'views'));

app.get(    '/' , function (req,res) { res.redirect('/static/'); } );

app.get(    '/data/:user_name' , getter );

function getter(req,res) { 
    var username = request.params.username;
    console.log("getting username");
}

exports.app      = app;

app.listen( port, ip, function() {
    console.log( 'Express server listening on http://%s:%s', ip, port);
});

