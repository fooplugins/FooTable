(function ($, w, undefined) {

    if (w.footable === undefined || w.foobox === null) {
        throw new Error('Please check and make sure footable.js is included in the page and is loaded prior to this script.');
    }

    if ($.cookie === undefined ) {
        throw new Error('Footable Memory requires jQuery $.cookie, https://github.com/carhartl/jquery-cookie');
    }

    function Memory() {
        var p = this;
        p.name = 'Footable Memory';
        p.init = function(ft) {

        };
    }

    w.footable.plugins.register(Memory, defaults);

})(jQuery, window);
