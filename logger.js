/* global __stack        */
/* global __stk_line     */
/* global __stk_file     */
/* global __stk_function_ret */

//https://github.com/felixge/node-stack-trace

var path = require('path');

function logger() {
    var log_level = 0;

    if (process.env.DEBUG) {
        log_level = Number.MAX_VALUE;
        try {
            log_level = parseInt(process.env.DEBUG, 10);
        } catch (e) {
        }
    }
        
    if ( log_level > 0 ) {
        //console.log('log_level  ', log_level  );
        var debug_level = arguments["0"];
        delete arguments["0"];
        //console.log('debug_level', debug_level);
        
        if ( debug_level >= log_level ) {
            process.stdout.write(path.basename(__stk_file) + " : " + __stk_line + " : " + __stk_function_ret + ":: ");
            console.log.apply(console, arguments);
        }
    }
}

module.exports = logger;

Object.defineProperty(global, '__stack', {
get: function() {
        var orig = Error.prepareStackTrace;
        Error.prepareStackTrace = function(_, stack) {
            return stack;
        };
        var err = new Error;
        Error.captureStackTrace(err, arguments.callee);
        var stack = err.stack;
        Error.prepareStackTrace = orig;
        return stack;
    }
});

Object.defineProperty(global, '__stk_line', {
get: function() {
        return __stack[2].getLineNumber();
    }
});

Object.defineProperty(global, '__stk_function_ret', {
get: function() {
        for ( var f = 2; f < __stack.length; f++ ) {
            if ( __stack[f] ) {
                //var n = __stack[f].getFunctionName();
                var n = __stack[f].getMethodName();
                if ( n ) {
                    return n;
                }
            } else {
                return;
            }
        }
        return;
    }
});

Object.defineProperty(global, '__stk_file', {
get: function() {
        return __stack[2].getFileName();
    }
});


/*
Object.defineProperty(global, '__stk_function', {
get: function() {
        return __stack[2].getFunctionName();
    }
});


Object.defineProperty(global, '__stk_len', {
get: function() {
        return __stack.length;
    }
});


Object.defineProperty(global, '__stk_method', {
get: function() {
        return __stack[2].getMethodName();
    }
});
*/
