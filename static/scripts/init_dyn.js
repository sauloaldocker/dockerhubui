/* global gen_pre      */

$(document).ready(function(){
    console.log('document is ready');
    
    /*
    console.log('adding click');
    $("#reload").click(
        function() {
            $.getJSON( "/update/", function(data){
                console.log("updated");
                $("#reload_label").html("reloaded");
                $("#reload_label").delay(1000).fadeOut('normal', function() {
                    $(this).html('');
                    $(this).fadeIn('fast');
                    //var $container = $("#mainContent");
                    //$container.html('');
                    //init();
                    location.reload();
                });
            });
        }
    );
    */

    $(".tablesorter").each(
        function(e, el) {
            console.log("initing table sorter on", e, el);
            $('#'+el.getAttribute('id')).tablesorter();
            console.log("table sorter initialized on", e, el);
        }
    );
});


