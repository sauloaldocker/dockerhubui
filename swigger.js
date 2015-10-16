var swig    = require( 'swig'        ),
    logger  = require( './logger.js' )
    ;	
	
function init(app) {
    app.mods.swig             = swig;

    // This is where all the magic happens!
    app.engine('html', swig.renderFile);
    
    app.set( 'view engine', 'html'                        );
    app.set( 'views'      , app.conf.swig.template_folder );
    app.set( 'view cache' , app.conf.swig.view_cache      );

    swig.setDefaults({ cache: app.conf.swig.cache });
    
    swig.setFilter( 'sanitize'                                , sanitize                                 );
    swig.setFilter( 'parse_date'                              , parse_date                               );
    swig.setFilter( 'status_colorer'                          , status_colorer                           );
    swig.setFilter( 'automated_colorer'                       , automated_colorer                        );
    swig.setFilter( 'strip_leading_slash'                     , strip_leading_slash                      );
    swig.setFilter( 'strip_trailing_slash'                    , strip_trailing_slash                     );
    swig.setFilter( 'strip_terminal_slashes'                  , strip_terminal_slashes                   );
    swig.setFilter( 'extract_from_dockerfile_tags'            , extract_from_dockerfile_tags             );
    swig.setFilter( 'extract_from_dockerfile_run_command'     , extract_from_dockerfile_run_command      );
    swig.setFilter( 'extract_from_dockerfile_provides'        , extract_from_dockerfile_provides         );

    swig.setFilter( 'extract_from_dockerfile_version'         , extract_from_dockerfile_version          );
    swig.setFilter( 'extract_from_dockerfile_software'        , extract_from_dockerfile_software         );
    swig.setFilter( 'extract_from_dockerfile_software_version', extract_from_dockerfile_software_version );
    swig.setFilter( 'extract_from_dockerfile_description'     , extract_from_dockerfile_description      );
    swig.setFilter( 'extract_from_dockerfile_website'         , extract_from_dockerfile_website          );
    swig.setFilter( 'extract_from_dockerfile_tags'            , extract_from_dockerfile_tags             );
    swig.setFilter( 'extract_from_dockerfile_provides'        , extract_from_dockerfile_provides         );
    swig.setFilter( 'extract_from_dockerfile_base_image'      , extract_from_dockerfile_base_image       );
    swig.setFilter( 'extract_from_dockerfile_build_command'   , extract_from_dockerfile_build_command    );
    swig.setFilter( 'extract_from_dockerfile_pull_command'    , extract_from_dockerfile_pull_command     );
    swig.setFilter( 'extract_from_dockerfile_run_command'     , extract_from_dockerfile_run_command      );
    swig.setFilter( 'extract_from_dockerfile_extra'           , extract_from_dockerfile_extra            );
}

function sanitize(n) {
    return n.replace('.', '_').replace('+', '_').replace('/', '_').replace('\\', '_');
}


function parse_date         (z) { return format_date(new Date(z)); }
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

    //logger(str);
    
    return str;
}



function status_colorer     (z) { var zz = sanitize_status(z); return '<span class="status '+zz+'">'+z+'</span>'; }


function automated_colorer  (z) { var zz = z ? 'automated' : 'manual'; return '<span class="automation '+zz+'">'+z+'</span>'; }


function sanitize_status(n) {
    return n.replace('.', '_').replace('+', '_').replace('/', '_').replace('\\', '_').replace(' ', '_').replace('__', '_').replace('__', '_').toLowerCase();
}

function strip_leading_slash(s){
    return s.replace(/^\//,'')
}

function strip_trailing_slash(s){
    return s.replace(/\/$/,'')
}

function strip_terminal_slashes(s){
    return strip_leading_slash(strip_trailing_slash(s));
}



function extract_from_dockerfile(s, t) {
    var rex = new RegExp('\n# '+t+':(.*)\n',"gm");
    var res = rex.exec(s) || ["-", "*"];
    return res[1].trim();
}

function extract_from_dockerfile_version(          s ) { return extract_from_dockerfile(s, 'Version'         ); }
function extract_from_dockerfile_software(         s ) { return extract_from_dockerfile(s, 'Software'        ); }
function extract_from_dockerfile_software_version( s ) { return extract_from_dockerfile(s, 'Software Version'); }
function extract_from_dockerfile_description(      s ) { return extract_from_dockerfile(s, 'Description'     ); }
function extract_from_dockerfile_website(          s ) { return extract_from_dockerfile(s, 'Website'         ); }
function extract_from_dockerfile_tags(             s ) { return extract_from_dockerfile(s, 'Tags'            ); }
function extract_from_dockerfile_provides(         s ) { return extract_from_dockerfile(s, 'Provides'        ); }
function extract_from_dockerfile_base_image(       s ) { return extract_from_dockerfile(s, 'Base Image'      ); }
function extract_from_dockerfile_build_command(    s ) { return extract_from_dockerfile(s, 'Build Cmd'       ); }
function extract_from_dockerfile_pull_command(     s ) { return extract_from_dockerfile(s, 'Pull Cmd'        ); }
function extract_from_dockerfile_run_command(      s ) { return extract_from_dockerfile(s, 'Run Cmd'         ); }
function extract_from_dockerfile_extra(            s ) { return extract_from_dockerfile(s, 'Extra'           ); }


/*
# Version:          1
# Software:         NCBI BLAST+
# Software Version: 2.2.28-2
# Description:      basic local alignment search tool
# Website:          http://blast.ncbi.nlm.nih.gov/Blast.cgi?PAGE_TYPE=BlastDocs&DOC_TYPE=Download
# Tags:             Genomics|Proteomics|Transcriptomics|General
# Provides:         blast 2.2.28-2
# Base Image:       biodckr/biodocker:latest
# Build Cmd:        docker build --rm -t biodckr/ncbi-blast 2.2.28-2/.
# Pull Cmd:         docker pull biodckr/ncbi-blast
# Run Cmd:          docker run --rm biodckr/ncbi-blast <options> <files>
*/
exports.init   = init;
