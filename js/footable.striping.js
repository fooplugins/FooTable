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
    },
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
            p.setupStriping();
          }
        });
    };

    p.setupStriping = function () {
      alert('Strip');
    };
  }

  w.footable.plugins.register(Striping, defaults);

})(jQuery, window);