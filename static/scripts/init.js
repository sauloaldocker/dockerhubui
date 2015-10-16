/* global CONTAINER     */
/* global DOCKER_DATA   */
/* global COL_NAMES     */
/* global DEBUG         */
/* global DOCKERHUB_URL */
/* global parse_date    */
/* global COL_TYPES     */
/* global chain_repos   */
/* global get_usage     */
/* global get_title     */

$(document).ready(function(){
    init( finish );

    $("#reload").click(
        function() {
            $.getJSON( "/update/", function(data){
                console.log("updated");
                $("#reload_label").html("reloaded");
                $("#reload_label").delay(1000).fadeOut('normal', function() {
                    $(this).html('');
                    $(this).fadeIn('fast');
                    var $container = $("#"+CONTAINER);
                    $container.html('');
                    init( finish );
                });
            });
        }
    );
});


function init( clbk ) {
    console.log('initing');
    
    get_usage("num_sessions", "num_views");
    get_title("title_title" );
    get_title("header_title");

    var $container = $("#"+CONTAINER);
    
    var usernames  = [];
    for ( var username in DOCKER_DATA ) {
        usernames.push(username);
        //var userdata = DOCKER_DATA[username];
        //console.log("checking user", username, userdata);
    }
    
    var $tbl = $("<table/>", { "id": "repo_table", "class": "repo_table tablesorter" } );
    $tbl.appendTo($container);

    var $thead = $("<thead/>");
    var $tr1   = $("<tr/>"   );
    var $tr2   = $("<tr/>"   );
    var $tbody = $("<tbody/>");
    
    $thead.appendTo($tbl  );
    $tbody.appendTo($tbl  );
    $tr1  .appendTo($thead);
    $tr2  .appendTo($thead);
    
    $tr1.append($("<th/>", { "html": "Repository Name", "rowspan": 2}).append($('<img>', {'src': 'images/sort.svg', 'class': 'arrows'})));
    $tr1.append($("<th/>", { "html": "Cache Time"     , "rowspan": 2}).append($('<img>', {'src': 'images/sort.svg', 'class': 'arrows'})));

    for ( var t = 0; t < COL_NAMES.length; t++ ) {
        var type       = COL_NAMES[t];
        //var type_name  = type[0];
        var type_title = type[1];
        var type_cols  = type[2];

        $("<th/>", {"class": "row_header", "html": type_title, "colspan":type_cols.length}).appendTo($tr1);

        for ( var c = 0; c < type_cols.length; c++ ) {
            var col_data = type_cols[c];
            //var col_var  = col_data[0];
            var col_name = col_data[1];
            $("<th/>", {"class": "row_header", "html": col_name}).append($('<img>', {'src': 'images/sort.svg', 'class': 'arrows'})).appendTo($tr2);
        }
    }

    chain_repos( usernames, 0, $tbody, clbk );
}

function finish() {
    console.log("initing table sorter");
    $("#repo_table").tablesorter(); 
    console.log("table sorter initialized");
}

