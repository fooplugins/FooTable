$(function () {

    marked.setOptions({
        gfm: true,
    });

    $.get('README.md', function(res) {
        $('#content').html(marked(res));
    });

    $('#documentation, #demos').on('click', function (e) {
        e.preventDefault();
        $.get(e.target.pathname||'README.md', function(res) {
            if ('md' == e.target.pathname.split('.').pop()) {
                $('#content').html(marked(res));
/*
// this is trying to add a click event just to the content area only but
// clashes with the demos

                $('#content').click(function (e2)
                      e2.preventDefault();
                    $.get(e2.target.pathname, function(res) {
                        if ('md' == e2.target.pathname.split('.').pop())
                            res = marked(res);
                        $('#content').html(res);
                    });
                });
*/
            } else {
                $('#content').html(res);
            }
        });
    });

});
