var bodyParser       = require( 'body-parser'     ),
    compression      = require( 'compression'     ),
	errorHandler     = require( 'errorhandler'    ),
	methodOverride   = require( 'method-override' ),
	serveStatic      = require( 'serve-static'    ),
	serveFavicon     = require( 'serve-favicon'   )
    ;

var logger  = require('./logger.js' );

function init(app) {
    app.mods.bodyParser       = bodyParser;
    app.mods.compression      = compression;
    app.mods.errorHandler     = errorHandler;
    app.mods.methodOverride   = methodOverride;
    app.mods.serveStatic      = serveStatic;
    app.mods.serveFavicon     = serveFavicon;

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
    
    
    //Add etag
    var checksum         = require( 'checksum'        );
    app.set('etag', function (body, encoding) {
      return checksum(body); // consider the function is defined
    });
    
    //Serve static pages
    app.use(app.mods.express.static('static', {etag: true}));
}


exports.init   = init;
