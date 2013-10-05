$(function () {
    $('table').footable().bind({
        'footable_filtering': function (e) {
            var selected = $('.filter-status').find(':selected').text();
            if (selected && selected.length > 0) {
                e.filter += (e.filter && e.filter.length > 0) ? ' ' + selected : selected;
                e.clear = !e.filter;
            }
        },
        'footable_filtered': function() {
            var count = $('table.demo tbody tr:not(.footable-filtered)').length;
            $('.row-count').html(count + ' rows found');
        }
    });

    $('.clear-filter').click(function (e) {
        e.preventDefault();
        $('.filter-status').val('');
        $('table.demo').trigger('footable_clear_filter');
        $('.row-count').html('');
    });

    $('.filter-status-active').click(function (e) {
        e.preventDefault();
        console.dir(e)
        $('table.demo').data('footable-filter').filter('active');
    });

    $('.filter-status-disabled').click(function (e) {
        e.preventDefault();
        console.dir(e)
        $('table.demo').data('footable-filter').filter('disabled');
    });

    $('.filter-status-suspended').click(function (e) {
        e.preventDefault();
        console.dir(e)
        $('table.demo').data('footable-filter').filter('suspended');
    });

});
