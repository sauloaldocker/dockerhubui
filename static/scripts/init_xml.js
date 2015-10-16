/* global get_usage      */
/* global CONTAINER      */
/* global get_tables     */
/* global DOCKER_DATA    */
/* global get_title      */
/* global get_namespaces */
/* global recolor        */
/* global resize_cols    */
/* global finish         */


$(document).ready(
    function(){
        console.log('document is ready');
        
        get_usage("num_sessions", "num_views");
        get_title("title_title" );
        get_title("header_title");
        get_namespaces(DOCKER_DATA, 
            function() {
                console.log('DOCKER_DATA', DOCKER_DATA);
                var usernames = Object.keys(DOCKER_DATA);
                var username  = usernames.join('|');
                if ( usernames.length > 0 ) {
                    get_tables(CONTAINER, username, 
                        function(status) {
                            if (status) {
                                console.log('success getting tables');
                                recolor();
                                resize_cols();

                                $(".tablesorter").each(
                                    function(e, el) {
                                        console.log("initing table sorter on", e, el);
                                        $('#'+el.getAttribute('id')).tablesorter();
                                        console.log("table sorter initialized on", e, el);
                                    }
                                );
                            } else {
                                console.log('error getting tables');
                                
                            }
                        }
                    );
                }
            }
        );
    }
)
