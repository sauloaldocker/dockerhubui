/* global get_usage   */
/* global CONTAINER   */
/* global get_tables  */
/* global DOCKER_DATA */
/* global get_title   */

$(document).ready(function(){
    console.log('document is ready');
    
        get_usage("num_sessions", "num_views");
        get_title("title_title" );
        get_title("header_title");
        //var username = 'biodckr';
        
        console.log(DOCKER_DATA);
        var usernames = Object.keys(DOCKER_DATA);
        var username  = usernames.join('|');
        if ( usernames.length > 0 ) {
            get_tables(CONTAINER, username);
        }
})