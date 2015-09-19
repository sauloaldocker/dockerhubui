var storage          = require( 'node-persist' ),
    path             = require( 'path'         ),
    logger           = require( './logger.js'  );

var storage_defaults = {
    dir   : path.join( __dirname, 'storage' ), 
    ttl   : 24 * 60 * 60 * 1000, // 1 day 
    loggin: true
};


function init(app) {
    storage_defaults = app.conf.cache; 
    logger('storage_defaults', storage_defaults);
}


//storage.setItemSync('test', 'test');

var cache = function(cache_timeout) {
    this.cache_timeout = cache_timeout || 0; // no cache
    this.data          = {};
    this.cache_id      = (new Date()).getTime();
    logger('initializing cache: id:', this.cache_id);
};

cache.prototype.add_db = function(db, clbk) {
    db = this.sanitize(db);
    logger('cache.add: adding db', db);
    
    if ( db in this.data ) {
        logger('cache.add: db already in cache', db);
        clbk();

    } else {
        logger('cache.add: creating cache for db', db);
    
        var storate_opts = JSON.parse(JSON.stringify(storage_defaults));
        storate_opts.dir = path.join( storage_defaults.dir, db );
        storate_opts.ttl = this.cache_timeout;

        //logger('storate_opts', storate_opts);
        
        var myStorage = storage.create(storate_opts);
        
        myStorage.initSync();
    
        this.data[db] = myStorage;
        
        clbk();
    }
};

cache.prototype.clean = function() {
    logger("cache.clean: cleaning cache");
    for ( var c in this.data ) {
        logger("cache.clean: cleaning cache", c);

        this.data[c].clearSync();
    }
};

cache.prototype.get   = function(db, key, clbk) {
    db  = this.sanitize(db );
    key = this.sanitize(key);

    logger("cache.get: getting cache: db", db, 'key', key);
    
    var th = this;
    
    if ( !(db in this.data) ) {
        logger("cache.get: getting cache: db", db, 'key', key, "no such db");
        this.add_db(db, 
            function() {
                th.get(db, key, clbk); 
            }
        );

    } else {
        logger("cache.get: getting cache: db", db, 'key', key, "db is present");
    
        this.data[db].getItem(key, 
            function(err, val) {
                logger("cache.get: getting cache: db", db, 'key', key, "got key");
                if ( err ) {
                    logger("cache.get: getting cache: db", db, 'key', key, "got key error", err);
                    clbk(null);

                } else {
                    logger("cache.get: getting cache: db", db, 'key', key, "got key success");
                    clbk(val);

                }
            }
        );
    }
};

cache.prototype.set   = function(db, key, val, clbk) {
    db     = this.sanitize(db );
    key    = this.sanitize(key);
    
    logger("cache.set: setting cache: db", db, 'key', key);
        
    var th = this;
    if ( !(db in this.data) ) {
        logger("cache.set: setting cache: db", db, 'key', key, "no such db. creating");
        this.add_db(db, 
            function() {
                th.set(db, key, val, clbk); 
            }
        );

    } else {
        logger("cache.set: setting cache: db", db, 'key', key, "db is present");
        var ch   = this.data[db];
        var now  = (new Date()).getTime();
        logger("cache.set: setting cache: db", db, 'key', key, 'now', now);
        ch.setItem(key, val, clbk);
        
    }
};


cache.prototype.sanitize = function(n) {
    return n.replace('.', '_').replace('-', '_').replace('+', '_').replace('/', '_').replace('\\', '_').replace(' ', '_').replace('__', '_').replace('__', '_').toLowerCase();
};


exports.init   = init;
exports.cache  = cache;
