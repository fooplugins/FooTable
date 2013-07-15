/**
 * Common stuff used on all FooTable demos
 */

$(function () {

    //setup tabs for the demo
    $('.nav-tabs a').click(function (e) {

        //show the tab!
        $(this).tab('show');

    }).on('shown', function (e) {

        //make sure that any footable in the visible tab is resized
        $('.tab-pane.active .footable').trigger('footable_resize');

    });

    //if there is a hash, then show the tab
    if (window.location.hash.length > 0) {
        $('.nav-tabs a[href="' + window.location.hash + '"]').tab('show');
    }

});
