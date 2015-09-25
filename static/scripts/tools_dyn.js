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

function recolor_classes() {
    var rclasses = $(".repo_class");
    //console.log('rclasses', rclasses);
    var classes  = {};
    $.each(rclasses, 
        function(x, v) {
            var $v   = $(v);
            var vals = $v.html();
            //console.log('x',x,'v',v,'val',vals);
            $.each(vals.split("|"), 
                function(y, w) {
                    if ( ! ( w in {"":0, "-":0, "*":0} ) ) {
                        classes[w] = classes[w] ? classes[w] + 1 : 1;
                    }
                }
            );
        }
    );
    
    console.log('classes', classes);
    var classes_names = Object.keys(classes);
    
    classes_names.sort();
    console.log('classes_names', classes_names);
    
    var names_classes = [];
    $.each(classes_names, 
        function(x, v) {
            names_classes[v] = x;
        }
    );
    console.log('names_classes', names_classes);
    
    $.each(rclasses, 
        function(x, v) {
            var $v   = $(v);
            var vals = $v.html();
            var html = [];
            //console.log('x',x,'v',v,'val',vals);
            $.each(vals.split("|"), 
                function(y, w) {
                    var span = $('<span>');
                    span.html(w);

                    if ( ! ( w in {"":0, "-":0, "*":0} ) ) {
                        classes[w] = classes[w] ? classes[w] + 1 : 1;
                        
                        if ( w in names_classes ) {
                            var cid = names_classes[w] + 2;
                            span.attr('class', 'class_' + cid);
                        
                        } else {
                            span.attr('class', 'class_1');
                        
                        }
                        
                    } else {
                        span.attr('class', 'class_0');
                    }
                    html.push(span);
                }
            );
            $v.html('');
            $v.append(html);
        }
    );
}

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
            var $els = $('th[name="'+x+'"]');
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