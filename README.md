# DockerHub UI

## Node requirements
dockerhub.js:
 - request
 - time

index.js:
 - body-parser
 - compression
 - errorhandler
 - express
 - method-override
 - request
 - serve-static
 - serve-favicon
 - checksum

session_counter.js:
 - cookie-parser
 - cookie-session
 - node-persist
 - time

## Enviroment variables
var ip            = process.env.IP            || "0.0.0.0";
var port          = process.env.PORT          || 8080;
var CACHE_TIMEOUT = process.env.CACHE_TIMEOUT || 600;

## Endpoints
 - /repos/:username/                       - List of repositories
 - /info/:username/:reponame/              - Repository information
 - /history/:username/:reponame/           - Repository building history
 - /logs/:username/:reponame/:build_code/  - Build logs
 - /usage/                                 - Server statistics

## DockerHub Endpoints used
 - https://hub.docker.com/v2/repositories/<username>/
 - https://hub.docker.com/v2/repositories/<username>/<repository>/
 - https://hub.docker.com/v2/repositories/<username>/<repository>/buildhistory/
 - https://hub.docker.com/v2/repositories/<username>/<repository>/buildhistory/<build id>/

