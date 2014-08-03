(function ($, w, undefined) {

    if (w.footable === undefined || w.foobox === null) {
        throw new Error('Please check and make sure footable.js is included in the page and is loaded prior to this script.');
    }

    if ($.cookie === undefined ) {
        throw new Error('Footable Memory requires jQuery $.cookie, https://github.com/carhartl/jquery-cookie');
    }

    var defaults = {
        memory: {
            enabled: false
        }
    };

    var storage = {
        get: function(index){

        },
        set: function(index, item){

        }
    };

    var state = {
        get: function(ft){

        },
        set: function(ft, data){

        }
    };

    var is_enabled = function(ft){
        return ft.options.memory.enabled
    };

    var update = function(ft, event) {
        var index = ft.id,
            data = state.get(ft);

        storage.set(index, data);
    };

    var load = function(ft){
        var index = ft.id,
            data = storage.get(index);

        state.set(ft, data);
        ft.memory_plugin_loaded = true;
    };

    function Memory() {
        var p = this;
        p.name = 'Footable Memory';
        p.init = function(ft) {
            if (is_enabled(ft)) {
                $(ft.table).bind({
                    'footable_initialized': function(){
                        load(ft);
                    },
                    'footable_page_filled footable_redrawn footable_filtered footable_sorted footable_row_expanded footable_row_collapsed': function(e) {
                        if (ft.memory_plugin_loaded) {
                            update(ft, e);
                        }
                    }
                });
            }
        };
    }

    w.footable.plugins.register(Memory, defaults);

})(jQuery, window);
