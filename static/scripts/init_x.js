/* global get_usage  */
/* global CONTAINER  */
/* global get_tables */

$(document).ready(function(){
    console.log('document is ready');
    
        get_usage("num_sessions", "num_views");

        var username = 'biodckr';

        get_tables(CONTAINER, username);
})