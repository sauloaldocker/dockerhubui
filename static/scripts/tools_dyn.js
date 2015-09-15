/* global gen_pre      */
/* global get_logs_raw */

function show_logs(key, src) {
    get_logs_str(src, 
        function(data) { 
            show_logs_success(key, data) 
            
        }, 
        function(data) {
            show_logs_failure(key, data)
        }
    );
}


function get_logs_str(src, clbk_success, clbk_failure) {
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

function show_logs_success(key, logs) {
    console.log('success getting log', key);
    display_popup(gen_pre(logs[key]));
}

function show_logs_failure(key, logs) {
    alert('error downloading logs', key, logs);
}


function show_popup(el) {
    console.log("popping");
    
    var pre = el.getElementsByTagName('pre')[0];
    var val = pre.cloneNode(true);
    val.removeAttribute('class');
    
    console.log(val);
    
    display_popup(val);
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
    $hover.removeClass('visible');
}