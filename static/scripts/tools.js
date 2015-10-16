/* global DOCKER_DATA */
/* global HOVER */
/* global gen_pre */


function show_popup(el) {
    var username       = el.getAttribute('username'      );
    var repo_full_name = el.getAttribute('repo_full_name');
    var build_code     = el.getAttribute('build_code'    );
    var type_name      = el.getAttribute('type_name'     );
    var var_name       = el.getAttribute('var_name'      );
    var var_title      = el.getAttribute('var_title'     );
    var val            = DOCKER_DATA[username][repo_full_name][type_name][var_name];
    
    //console.log("popping", username, repo_full_name, build_code, type_name, var_name, var_title, val);
    console.log("popping", username, repo_full_name, build_code, type_name, var_name, var_title);
    
    var $hover = $('#'+HOVER);
    $hover.addClass('visible');

    var $hoverin = $('#'+HOVER+'_inner');
    $hoverin.html(gen_pre(val));
}

function close_popup(){
    var $hover = $('#'+HOVER);
    $hover.removeClass('visible');
}



function format_date(d) {
    d = new Date(d);
    var day = d.getUTCDate();
    var mon = d.getUTCMonth();
    var yr  = d.getUTCFullYear();
    
    var hr  = d.getUTCHours();
    var min = d.getUTCMinutes();

    day = day > 9 ? day : '0' + day;
    mon = mon > 9 ? mon : '0' + mon;
    hr  = hr  > 9 ? hr  : '0' + hr ;
    min = min > 9 ? min : '0' + min;
    
    var str = yr + '-' + mon + '-' + day + ' ' + hr + ':' + min + ' UTC';

    //console.log(str);
    
    return str;
}


function sanitize_status(n) {
    return n.replace(/\./g, '_').replace(/-/g, '_').replace(/\+/g, '_').replace(/\//g, '_').replace(/\\/g, '_').replace(/ /g, '_').replace(/_+/g, '_')
}

function sanitize_name(n) {
    return n.replace(/\./g, '_').replace(/-/g, '_').replace(/\+/g, '_').replace(/\//g, '_').replace(/\\/g, '_').replace(/ /g, '_').replace(/_+/g, '_').toLowerCase();
}

function gen_pre (y) {
    return "<pre>"+y+"</pre>"; 
}