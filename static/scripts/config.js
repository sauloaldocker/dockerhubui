var CONTAINER     = "mainContent";
var HOVER         = "hoverer";
var DOCKERHUB_URL = 'https://hub.docker.com/';
var GIT_URL       = 'https://github.com/';
//var DOCKER_DATA   = { "biodckr": {}, "biodckrdev": {} }; // default username to show
var DOCKER_DATA   = { }; // default username to show
var DEBUG         = false;
//var DEBUG         = true;

console.log("DOCKER_DATA"  , DOCKER_DATA  );
console.log("DOCKERHUB_URL", DOCKERHUB_URL);
console.log("GIT_URL"      , GIT_URL      );
console.log("DOCKER_DATA"  , DOCKER_DATA  );

/* global url */
// get extra repos from the URL bar
/*
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
*/