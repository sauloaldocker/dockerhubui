var cache = function(cache_timeout) {
    this.cache_timeout = cache_timeout || 0; // no cache
    this.data          = {};
};

cache.prototype.add_db = function(db) {
    if ( db in this.data ) {
        console.log('db already in cache', db);
        return;
    }

    console.log('creating cache for db', db);

    this.data[db] = {};
};

cache.prototype.clean = function(db, key) {
    console.log("cleaning cache");
    for ( var c in this.data ) {
        console.log("cleaning cache", c);
        this.data[c] = {};
    }    
};

cache.prototype.get   = function(db, key) {
    if (this.cache_timeout == 0){
        console.log("no cache enabled");
        return null;
    }
    
    if ( !(db in this.data) ) {
        console.log("no such db in cache", db);
        return null;
    }
    
    var ch   = this.data[db];
    
    if ( !(key in ch) ) {
        console.log("missed cache  ", 'db', db, 'key', key, 'ctm', ctm);
        return null;
        
    } else {
        var ctm  = ch[key][0];
        var val  = ch[key][1];
        var now  = (new Date()).getTime();
        var diff = now - ctm;

        if ( diff > this.cache_timeout ) {
            console.log("cache timedout", 'db', db, 'key', key, 'ctm', ctm, 'now', now, 'timeout', this.cache_timeout, 'diff', diff);
            return null;
        
        } else {
            console.log("found cache   ", 'db', db, 'key', key, 'ctm', ctm, 'now', now, 'timeout', this.cache_timeout, 'diff', diff);
            return val;

        }
    }
};

cache.prototype.set   = function(db, key, val) {
    if (this.cache_timeout == 0){
        console.log("no cache enabled");
        return null;
    }
    
    if ( !(db in this.data) ) {
        console.log("no such db in cache", db);
        this.add_db(db);
    }
    
    var ch   = this.data[db];
    var now  = (new Date()).getTime();
    console.log("adding to cache", 'db', db, 'key', key, 'now', now);
    ch[key] = [now, val];
};


exports.cache = cache;