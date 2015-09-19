var swig    = require( 'swig'        ),
    logger  = require( './logger.js' )
    ;	
	
function init(app) {
    app.mods.swig             = swig;

    // This is where all the magic happens!
    app.engine('html', swig.renderFile);
    
    app.set( 'view engine', 'html'                        );
    app.set( 'views'      , app.conf.swig.template_folder );
    app.set( 'view cache' , app.conf.swig.view_cache      );

    swig.setDefaults({ cache: app.conf.swig.cache });
    
    swig.setFilter( 'sanitize'              , sanitize               );
    swig.setFilter( 'parse_date'            , parse_date             );
    swig.setFilter( 'status_colorer'        , status_colorer         );
    swig.setFilter( 'automated_colorer'     , automated_colorer      );
    swig.setFilter( 'strip_leading_slash'   , strip_leading_slash    );
    swig.setFilter( 'strip_trailing_slash'  , strip_trailing_slash   );
    swig.setFilter( 'strip_terminal_slashes', strip_terminal_slashes );
}

function sanitize(n) {
    return n.replace('.', '_').replace('+', '_').replace('/', '_').replace('\\', '_');
}


function parse_date         (z) { return format_date(new Date(z)); }
function format_date(d) {
    var day = d.getUTCDate();
    var mon = d.getUTCMonth();
    var yr  = d.getUTCFullYear();
    
    var hr  = d.getUTCHours();
    var min = d.getUTCMinutes();

    day = day > 9 ? day : '0' + day;
    mon = mon > 9 ? mon : '0' + mon;
    hr  = hr  > 9 ? hr  : '0' + hr ;
    min = min > 9 ? min : '0' + min;
    
    var str = yr + '-' + mon + '-' + day + ' ' + hr + ':' + min + ' UTC';

    //logger(str);
    
    return str;
}



function status_colorer     (z) { var zz = sanitize_status(z); return '<span class="status '+zz+'">'+z+'</span>'; }


function automated_colorer  (z) { var zz = z ? 'automated' : 'manual'; return '<span class="automation '+zz+'">'+z+'</span>'; }


function sanitize_status(n) {
    return n.replace('.', '_').replace('+', '_').replace('/', '_').replace('\\', '_').replace(' ', '_').replace('__', '_').replace('__', '_').toLowerCase();
}

function strip_leading_slash(s){
    return s.replace(/^\//,'')
}

function strip_trailing_slash(s){
    return s.replace(/\/$/,'')
}

function strip_terminal_slashes(s){
    return strip_leading_slash(strip_trailing_slash(s));
}

exports.init   = init;
