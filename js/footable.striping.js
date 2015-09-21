(function ($, w, undefined) {
  if (w.footable === undefined || w.foobox === null)
    throw new Error('Please check and make sure footable.js is included in the page and is loaded prior to this script.');

  var defaults = {
    striping: {
      enabled: true
    },
    classes: {
      striping: {
        odd: 'footable-odd',
        even: 'footable-even'
      }
    }
  };

  function Striping() {
    var p = this;
    p.name = 'Footable Striping';
    p.init = function (ft) {
      p.footable = ft;
      $(ft.table)
        .unbind('striping')
        .bind({
          'footable_initialized.striping footable_row_removed.striping footable_redrawn.striping footable_sorted.striping footable_filtered.striping': function () {
            
            if ($(this).data('striping') === false) return;

            p.setupStriping(ft);
          }
        });
    };

    p.setupStriping = function (ft) {
        $('tbody tr',ft.table).removeClass(ft.options.classes.striping.even).removeClass(ft.options.classes.striping.odd);
        $('tbody tr:visible:even',ft.table).addClass(ft.options.classes.striping.even)
        $('tbody tr:visible:odd',ft.table).addClass(ft.options.classes.striping.odd)
    };
  }

  w.footable.plugins.register(Striping, defaults);

})(jQuery, window);
