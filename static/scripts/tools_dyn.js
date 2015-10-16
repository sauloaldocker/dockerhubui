/* global gen_pre       */
/* global get_logs_raw  */
/* global marked        */
/* global CONTAINER     */
/* global FILTERS       */
/* global ROW_CLASS     */
/* global DOCKERHUB_URL */
/* global sanitize_name */

function show_description (el      ) { show_child_span_as_popup(el); }
function show_logs        (key, src) { request_data(key, src, show_log_data_success, show_log_data_failure); }
function show_dockerfile  (key, src) { request_data(key, src, show_log_data_success, show_log_data_failure); }
function show_failure     (key, src) { request_data(key, src, show_log_data_success, show_log_data_failure); }
function show_error       (key, src) { request_data(key, src, show_log_data_success, show_log_data_failure); }

function request_data(     key, src, clbk_success, clbk_failure) {
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

function recolor() {
    recolor_tags();
    recolor_software();
    recolor_provides();
    recolor_status();

    recolor_failure();
    recolor_error();

    rename_base_image();
    rename_website();
}

function recolor_tags() {
    recolor_and_index('Tags', 'repo_tags');
}

function recolor_software() {
    recolor_and_index('Software', 'repo_software', {  'default_color': 0 });
}

function recolor_provides() {
    recolor_and_index('Provides', 'repo_provides', { 'name_filter': function(w) { return w.split(' ')[0]; }, 'default_color': 0 } );
}

function recolor_status() {
    recolor_and_index('Status', 'repo_history_last_build_results_status_description');
}

function recolor_failure() {
    recolor_and_index('Failure', 'repo_history_last_build_results_failure', { 'element_parser': element_parser_button } );
}

function recolor_error() {
    recolor_and_index('Error', 'repo_history_last_build_results_error'    , { 'element_parser': element_parser_button } );
}

function rename_base_image() {
    //repo_base_image

    var rclasses = $(".repo_base_image");

    $.each(rclasses, 
        function(x, v) {
            var $v   = $(v);
            var vals = $v.html();
            var html = [];
            //console.log('x',x,'v',v,'val',vals);
            
            if ( vals == '*' ) {
                //console.log("eq");
                return true;
            }
            
            var cols      = vals.split('/');
            var namespace = null;
            var name      = null;
            var tag       = null;
            var url1      = null;
            var url2      = null;
            
            //<a href="{{conf.DOCKERHUB_URL}}u/{{repo.namespace}}/">{{ repo.namespace }}</a> / 
            //<a href="{{conf.DOCKERHUB_URL}}r/{{repo.namespace}}/{{repo.name}}/">{{ repo.name }}
            
            if ( cols.length == 2 ) {
                namespace = cols[0];
                name      = cols[1];
                url1      = DOCKERHUB_URL + 'u/' + namespace + '/';
                url2      = DOCKERHUB_URL + 'r/' + namespace + '/' + name + '/';
            } else {
                name      = cols[0];
                url2      = DOCKERHUB_URL + 'r/_/' + name + '/';
            }
            
            var parts = name.split(':');
            
            if ( parts.length == 2 ) {
                name = parts[0];
                tag  = parts[1];
                
                if ( namespace ) {
                    url1      = DOCKERHUB_URL + 'u/' + namespace + '/';
                    url2      = DOCKERHUB_URL + 'r/' + namespace + '/' + name + '/';
                } else {
                    url2      = DOCKERHUB_URL + 'r/_/' + name + '/';
                }
            }
            
            if ( namespace ) {
                var span1 = $('<a>');
                span1.attr('href', url1);
                span1.html(namespace);
                html.push(span1);

                var s = $('<span>');
                s.html(' / ')
                html.push(s);

            }
            
            var span2 = $('<a>');
            span2.attr('href', url2);
            span2.html(name);
            html.push(span2);

            if ( tag ) {
                var span3 = $('<span>');
                span3.html(':' + tag);
                html.push(span3);
            }

            $v.html('');
            $v.append(html);
        }
    );
}

function rename_website() {
    //repo_website
    
    var rclasses = $(".repo_website");

    $.each(rclasses, 
        function(x, v) {
            var $v   = $(v);
            var vals = $v.html();
            var html = [];
            
            //console.log('websites "' + vals + '" x', x);
            if ( vals == '*' ) {
                //console.log("eq");
                return true;
            //} else {
                //console.log("ne");
            }
            
            //console.log('x',x,'v',v,'val',vals);
            $.each(vals.split("|"), 
                function(y, w) {
                    if ( y != 0 ) {
                        var s = $('<span>');
                        s.html(' / ')
                        html.push(s);
                    }
                    
                    var span = $('<a>');
                    span.html('Src ' + y);
                    span.attr('href', w);
                    html.push(span);
                }
            );
            $v.html('');
            $v.append(html);
        }
    );
}

function element_parser_button(w) {
    //console.log('w', w);
    if ( w == "*" ) {
        return ["*", "*"];
    } else {
        var u = $(w).text();
        //console.log('u', u, 'w', w);
        u = u.replace('Show ', '');
        return [u, w];
    }
}



function recolor_and_index(name, class_name, config) {
    if ( ! config ) {
        config = {};
    }
    
    var name_filter    = config['name_filter'   ];
    var element_parser = config['element_parser'];
    var default_color  = config['default_color' ];
    
    console.log('class_name', class_name, 'name_filter', name_filter, 'element_parser', element_parser, 'default_color', default_color);
    
    //repo_history_last_build_results_status_description

    var rclasses = $("." + class_name);
    //console.log('rclasses', rclasses);
    var classes  = {};

    $.each(rclasses, 
        function(x, v) {
            var $v   = $(v);
            var vals = $v.html();
            //console.log('x',x,'v',v,'val',vals);
            
            if ( vals == "" ) {
                vals = "*";
                $v.html(vals);
            }
            
            $.each(vals.split("|"), 
                function(y, w) {
                    var u = w;
                    
                    if ( u == "" ) {
                        u = "*";
                    }

                    if ( ! ( u in {"":0, "-":0, "*":0} ) ) {
                        classes[u] = ( classes[u] ? classes[u] + 1 : 1 );
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
        function(x, u) {
            if ( ( default_color !== null ) && ( default_color !== undefined ) ) {
                names_classes[u] = default_color - 2;
            } else {
                names_classes[u] = x;
            }
        }
    );
    console.log('names_classes', names_classes);
    
    var db = {};
    $.each(rclasses, 
        function(x, v) {
            var $v   = $(v);
            var vals = $v.html();
            var $par = get_row_element($v);
            var els  = vals.split("|");
            var html = [];
            els.sort();
            //console.log('x',x,'v',v,'val',vals);

            $.each(els, 
                function(y, w) {
                    var t = null;
                    var u = null;
                    
                    if (element_parser) {
                        var r = element_parser(w);
                        //console.log('r', r);
                        t = r[0];
                        u = r[1];
                    } else {
                        t = w;
                        u = w;
                    }
                    
                    if ( t == "" ) {
                        t = "*";
                    }
                    
                    //console.log('parsed', 't', t, 'u', u);
                    
                    var span = $('<span>');
                    span.html(u);

                    if (!(u in db)) {
                        db[t] = [null, []];
                    }
                    
                    db[t][1].push( $par );
                    
                    if ( ( t in {"":0, "-":0, "*":0} ) ) {
                        span.attr('class', 'filter filter_'+class_name+' rounded tag_0');
                        db[t][0] = 'tag_0';
                        
                    } else {
                        if ( u in names_classes ) {
                            var cid = names_classes[u] + 2;
                            span.attr('class', 'filter filter_'+class_name+' rounded tag_' + cid);
                            db[t][0] = 'tag_' + cid;
                        
                        } else {
                            span.attr('class', 'filter filter_'+class_name+' rounded tag_1');
                            db[t][0] = 'tag_1';
                        
                        }
                    }
                    
                    html.push(span);
                }
            );
            $v.html('');
            $v.append(html);
        }
    );
    
    console.log('db', db);
    add_filter(name, db, 'filter_'+class_name, name_filter);
}

function add_filter(name, db, class_name, name_filter) {
    var $table  = $('#'+FILTERS);

    var $tr     = $('<tr>');
    $tr.attr('name', 'filter_div_'+class_name);

    var $td1    = $('<td>');
    $td1.html(name + ':');
    $tr.append($td1);

    var $td2    = $('<td>');
    $tr.append($td2);

    $table.append($tr);

    var dbk = Object.keys(db);
    dbk.sort();
    
    $.each(dbk, 
        function (kn,k) {
            var v     = db[k];
            var color = v[0];
            var rows  = v[1];
            
            var l = k;
            if ( name_filter ) {
                l = name_filter(l);
            }
            
            var kid   = 'filter_button_' + class_name + '_' + sanitize_name(l);
            
            if ( l == '*' ) {
                kid   = 'filter_button_' + class_name + '_NONE_';
            }
            
            var span  = $('<span>');
            
            //console.log('filter DIV', class_name, k, color, rows);
            
            span.html(l);
            span.attr('class', 'filter_button rounded ' + color);
            span.attr('id'   , kid);
            
            span.click(
                function(ev) {
                    //console.log('k',k,'color',color,'ev',ev,'rows',rows);
                    fm.toggle(kid, rows);
                    $('#'+kid).toggleClass('invert');
                    console.log('toggling class', kid);
                }
            );
            
            $td2.append( span );
        }
    );
}






function get_row_element($el, clbk) {
    var pars = $el.parents()
    var $par = null;
    $.each(pars, 
        function(y,x) {
            var $x = $(x);
            if ( $x.prop("tagName") == 'TR' ) {
                $par = $x;
                return false;
            }
        }
    );
    return $par;
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





var filter_manager = function() {
    this.data = {};
};

filter_manager.prototype.toggle = function(kid, rows) {
    console.log('filter_manager', kid, rows);
    
    if ( kid in this.data ) {
        delete this.data[kid];
    } else {
        this.data[kid] = rows;
    }
    
    if ( Object.keys(this.data).length > 0 ) {
        this.compile();
    } else {
        this.reset();
    }
}

filter_manager.prototype.compile = function() {
    var selected = {};
    
    $.each(this.data,
        function(k,rows) {
            $.each(rows,
                function (rn, row) {
                    var rid = row.attr('id');
                    selected[rid] = 1;
                }
            );
        }
    );

    console.log('selected', selected);
    
    this.reset(selected);
}

filter_manager.prototype.reset = function(selected) {
    $.each( $('.'+ROW_CLASS), 
        function (k, v) {
            var $v = $(v);
            if ( selected ) {
                var rid = $v.attr('id');
                
                if ( rid in selected ) {
                    $v.show();
                } else {
                    $v.hide();
                }
            } else {
                $v.show();
            }
        }
    );
}

var fm    = new filter_manager();

