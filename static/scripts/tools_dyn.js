/* global gen_pre      */
/* global get_logs_raw */
/* global marked       */

function show_description (el      ) { show_child_span_as_popup(el); }
function show_logs        (key, src) { request_data(key, src, show_log_data_success, show_log_data_failure); }
function show_dockerfile  (key, src) { request_data(key, src, show_log_data_success, show_log_data_failure); }
function show_failure     (key, src) { request_data(key, src, show_log_data_success, show_log_data_failure); }
function show_error       (key, src) { request_data(key, src, show_log_data_success, show_log_data_failure); }

function request_data(key, src, clbk_success, clbk_failure) {
    get_log_data_from_server(src, 
        function(data) { 
            clbk_success(key, data);
            
        }, 
        function(data) {
            clbk_failure(key, data);
        }
    );
}


function get_log_data_from_server(src, clbk_success, clbk_failure) {
    var repo_full_name = src.getAttribute('repo_full_name');
    var build_code     = src.getAttribute('build_code'    );
    
    console.log('showing log for repo "' + repo_full_name + '" build code "' + build_code + '"');
    
    if ( repo_full_name && build_code ) {
        console.log('querying');
        get_logs_raw(repo_full_name, build_code, clbk_success, clbk_failure);
    
    } else {
        console.log('info is missing');
    
    }
}

function show_log_data_success(key, logs) {
    console.log('success getting log', key);
    display_popup(gen_pre(logs[key]));
    //display_popup(logs[key]);
}

function show_log_data_failure(key, logs) {
    alert('error downloading logs', key, logs);
}


function show_child_span_as_popup(el) {
    console.log("popping");
    
    var span = el.getElementsByTagName('span')[0];
    var val  = span.cloneNode(true);
    val.removeAttribute('class');
    
    console.log(val);
    //console.log(marker(val.innerHTML));
    
    display_popup(marker(val.innerHTML));
}

function display_popup(val) {
    var $hover = $('#hoverer');
    $hover.addClass('visible');

    var $hoverin = $('#hoverer_inner');
    $hoverin.html('');
    $hoverin.append(val);
}

function close_popup(){
    var $hover = $('#hoverer');

    var $hoverin = $('#hoverer_inner');
    $hoverin.html('');

    $hover.removeClass('visible');
}

function marker(el) {
    return marked(el).replace('=====', '<tr/>');
}