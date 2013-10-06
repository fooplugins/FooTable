# FooTable API

You can access most of the FooTable functions very easily. First, get the
FooTable object from your table, which is stored in the data:

    var footable = $('.footable').data('footable');

And then call a function inside the FooTable object:

    //force FooTable to redraw itself
    footable.redraw();
    //
    //delete a row
    footable.removeRow(row_to_delete);

Some functions you may want to call include `resize, redraw, toggleDetail, removeRow, appendRow, createOrUpdateDetailRow, raise`

### Example code from demo

    $('.row_actions a').click(function(e) {
        e.preventDefault();

        //get the FooTable object from the table
        var footable = $(this).parents('table:first').data('footable');

        //get the row we clicked on
        var $row = $(this).parents('tr:first');

        //determine the action we want to perform
        if ($(this).text() == 'delete') {
            if (confirm('are you sure?')) {
                footable.removeRow($row);
            }
        } else {
            footable.toggleDetail($row);
        }
    });
