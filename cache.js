var storage          = require( 'node-persist' );
var path             = require( 'path'         );
var logger           = require('./logger.js'   );

var tmp_folder       = path.join( __dirname, 'storage' );

logger('storage folder', tmp_folder);

//storage.setItemSync('test', 'test');

var cache = function(cache_timeout) {
    this.cache_timeout = cache_timeout || 0; // no cache
    this.data          = {};
};

cache.prototype.add_db = function(db, clbk) {
    db = this.sanitize(db);
    logger('cache.add: adding db', db);
    
    if ( db in this.data ) {
        logger('cache.add: db already in cache', db);
        clbk();

    } else {
        logger('cache.add: creating cache for db', db);
    
        var db_folder = path.join( tmp_folder, db );
        var myStorage = storage.create({dir: db_folder, ttl: this.cache_timeout, loggin: true});
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
}


exports.cache  = cache;
