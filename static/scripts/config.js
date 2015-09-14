// JavaScript File
var CONTAINER     = "mainContent";
var HOVER         = "hoverer";
var DOCKERHUB_URL = 'https://hub.docker.com/';
var GIT_URL       = 'https://github.com/';
var DOCKER_DATA   = { "biodckr": {} }; // default username to show
var DEBUG         = false;
//var DEBUG         = true;

console.log("DOCKER_DATA"  , DOCKER_DATA  );
console.log("DOCKERHUB_URL", DOCKERHUB_URL);
console.log("GIT_URL"      , GIT_URL      );
console.log("DOCKER_DATA"  , DOCKER_DATA  );

// get extra repos from the URL bar
var url_repo = url('?repos');
console.log("url_repos", url_repo);

if ( url_repo) {
    var url_repos = url_repo.split(",");
    for ( var u in url_repos ) {
        var repo = url_repos[u];
        console.log("u",u,"repo",repo);
        DOCKER_DATA[repo] = {};
    }
}


// collumns to show
var COL_NAMES = [
    ["info", "Repository Information",
        [
//            ["user"            , "User"            ], 
//            ["name"            , "Name"            ],
//            ["namespace"       , "Namespace"       ],
//            ["status"          , "Status"          ],
            ["description"     , "Description"     ],
//            ["is_private"      , "Is Private"      ],
            ["is_automated"    , "Is Automated"    , automated_colorer],
//            ["can_edit"        , "Can Edit"        ],
            ["star_count"      , "# Stars"      ],
            ["pull_count"      , "# Pulls"      ],
//            ["last_updated"    , "Last  Updated"   ],
//            ["has_starred"     , "Has Starred"     ],
//            ["full_description", "Full Description"]
        ],
    ],
    ["hist", "Repository History",
        [
            ["count"       , "# Builds"       ],
            ["build_code"  , "Build Code"  , gen_link_buildcode],
            ["created_date", "Created Date", parse_date        ],
            ["last_updated", "Last Updated", parse_date        ],
//            ["status"      , "Status"      ]
        ]
    ],
    ["logs", "Build Logs",
        [
            ["source_url"         , "Source Url"        , gen_link_source_url],
//            ["build_path"         , "Build Path"        ],
            ["source_branch"      , "Source Branch"     ],
            ["status_description" , "Status Description", status_colorer],
            ["source_type"        , "Source Type"       ],
            ["dockerfile_contents", "Dockerfile"        , popup],
            ["logs"               , "Logs"              , popup],
            ["failure"            , "Failure"           ],
            ["error"              , "Error"             ],
        ]
    ]
];


// parsers to values (data, var_name, col_title, value)
function default_function   (d, v, t, u) { return u; }
function gen_link_buildcode (d, v, t, w) { var p = DOCKERHUB_URL + 'r/' + d.repo_full_name + '/builds/' + w + '/';                                   return '<span class="fixed_width"><a href="'+p+'">'+w+'</a></span>'; }
function gen_link_source_url(d, v, t, x) { var x = x.replace('.git', '').replace(GIT_URL,''); var p = x + '/tree/' + d.source_branch + d.build_path; return '<a href="'+GIT_URL+p+'">'+x+'</a>'; }
function make_pre           (d, v, t, y) {                                                                                                           return "<pre>"+y+"</pre>"; }
function parse_date         (d, v, t, z) { return format_date(new Date(z)); }
function status_colorer     (d, v, t, z) { var zz = sanitize_status(z); return '<span class="status '+zz+'">'+z+'</span>'; }
function automated_colorer  (d, v, t, z) { var zz = z ? 'automated' : 'manual'; return '<span class="automation '+zz+'">'+z+'</span>'; }

function popup              (d, v, t, p) {
    return '<button class="button" onclick="show_popup(this)" username="'+d.username+'" repo_full_name="'+d.repo_full_name+'" build_code="'+d.build_code+'" type_name="'+d.type_name+'" var_name="'+v+'" var_title="'+t+'">Show '+ t + '</button>';
}

function show_popup(el) {
    var username       = el.getAttribute('username');
    var repo_full_name = el.getAttribute('repo_full_name');
    var build_code     = el.getAttribute('build_code');
    var type_name      = el.getAttribute('type_name');
    var var_name       = el.getAttribute('var_name');
    var var_title      = el.getAttribute('var_title');
    var val            = DOCKER_DATA[username][repo_full_name][type_name][var_name];
    
    //console.log("popping", username, repo_full_name, build_code, type_name, var_name, var_title, val);
    console.log("popping", username, repo_full_name, build_code, type_name, var_name, var_title);
    
    var $hover = $('#'+HOVER);
    $hover.addClass('visible');

    var $hoverin = $('#'+HOVER+'_inner');
    $hoverin.html(make_pre(null, null, null, val));
}

function close_popup(){
    var $hover = $('#'+HOVER);
    $hover.removeClass('visible');
}

function format_date(d) {
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


// summary of columns available
var COL_TYPES = {};
for ( var t = 0; t < COL_NAMES.length; t++ ) {
    var type      = COL_NAMES[t];
    var type_name = type[0];
    var type_cols = type[2];

    COL_TYPES[type_name] = t;

    for ( var c = 0; c < type_cols.length; c++ ) {
        var col_data = type_cols[c];
        var col_var  = col_data[0];
        var col_name = col_data[1];
        var col_proc = col_data[2];
        
        if (!col_proc) {
            col_data[2] = default_function;
        }
    }
}



console.log("COL_TYPES", COL_TYPES);
console.log("COL_NAMES", COL_NAMES);

function sanitize_status(n) {
    return n.replace('.', '_').replace('+', '_').replace('/', '_').replace('\\', '_').replace(' ', '_').replace('__', '_').replace('__', '_').toLowerCase();
}