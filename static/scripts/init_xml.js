/* global get_usage      */
/* global CONTAINER      */
/* global get_tables     */
/* global DOCKER_DATA    */
/* global get_title      */
/* global get_namespaces */

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
                                $(".tablesorter").each(
                                    function(e, el) {
                                        console.log("initing table sorter on", e, el);
                                        $('#'+el.getAttribute('id')).tablesorter();
                                        console.log("table sorter initialized on", e, el);
                                    }
                                );
                                
                                resize_cols();
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


function resize_cols() {
    var sizes = {};
    var cols  = $('.col_header');
    
    $.each(cols, 
        function(x,v) {
            //console.log(x,v);
            var $v    = $(v);
            var name  = $v.attr('name');
            var width = $v.width();
            if ( name in sizes ) {
                sizes[name] = width > sizes[name] ? width : sizes[name];
            } else {
                sizes[name] = width;
            }
        }
    );
    
    console.log('sizes',sizes);
    
    var sum = 0;
    $.each(sizes, 
        function(x, v) {
            var $els = $('[name="'+x+'"]');
            //console.log('x',x,'v',v,'$els',$els);
            v *= 1.05;
            sum += v;
            
            $.each($els,
                function(y, w) {
                    //console.log(' y',y,'w',w);
                    $(w).width( v + 'px' );
                    $(w).css('max-width', v + 'px');
                    $(w).css('min-width', v + 'px');
                    //$(w).css('background-color', 'red');
                }
            );
        }
    );
    
    //console.log('sum', sum);

    /*
    $.each($('.repo_table'), 
        function(x, v) {
            $(v).width(sum);
        }
    );
    */
    
}