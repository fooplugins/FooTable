(function ($, w, undefined) {
  if (w.footable == undefined || w.footable == null)
    throw new Error('Please check and make sure footable.js is included in the page and is loaded prior to this script.');

  var jQversion = w.footable.version.parse($.fn.jquery);
  if (jQversion.major == 1 && jQversion.minor < 8) { // For older versions of jQuery, anything below 1.8
    $.expr[':'].ftcontains = function (a, i, m) {
      return $(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
    };
  } else { // For jQuery 1.8 and above
    $.expr[':'].ftcontains = $.expr.createPseudo(function (arg) {
      return function (elem) {
	  var text = $(elem).find('td').text();
	  var data = $(elem).find('td[data-value]').each(function() {
		text += $(this).data('value');
	  });
        return text.toUpperCase().indexOf(arg.toUpperCase()) >= 0;
      };
    });
  }

  var defaults = {
    filter: {
      enabled: true,
      input: '.footable-filter',
      timeout: 300,
      minimum: 2,
      disableEnter: false
    }
  };

  function Filter() {
    var p = this;
    p.name = 'Footable Filter';
    p.init = function (ft) {
      if (ft.options.filter.enabled == true) {
        ft.timers.register('filter');
        $(ft.table).bind({
          'footable_initialized': function (e) {
            var $table = $(e.ft.table);
            var data = {
              'input': $table.data('filter') || e.ft.options.filter.input,
              'timeout': $table.data('filter-timeout') || e.ft.options.filter.timeout,
              'minimum': $table.data('filter-minimum') || e.ft.options.filter.minimum,
              'disableEnter': $table.data('filter-disable-enter') || e.ft.options.filter.disableEnter
            };
            if (data.disableEnter) {
              $(data.input).keypress(function (event) {
                if (window.event)
                  return (window.event.keyCode != 13);
                else
                  return (event.which != 13);
              });
            }
            $table.bind('footable_clear_filter', function () {
              $(data.input).val('');
              p.clearFilter(e.ft);
            });
            $table.bind('footable_filter', function (event, args) {
				p.filter(e.ft, args.filter);
            });
            $(data.input).keyup(function (eve) {
              e.ft.timers.filter.stop();
              if (eve.which == 27) { $(data.input).val(''); }
              e.ft.timers.filter.start(function () {
                e.ft.raise('footable_filtering');
                var val = $(data.input).val() || '';
                p.filter(e.ft, val);
              }, data.timeout);
            });
          }
        });
      }
    };
	
	p.filter = function(ft, filterString) {
		var $table = $(ft.table);
		var minimum = $table.data('filter-minimum') || ft.options.filter.minimum;
		if (!filterString || filterString.length < minimum) {
			p.clearFilter(ft);
		} else {
			var filters = filterString.split(' ');
			$table.find('> tbody > tr').hide().addClass('footable-filtered');
			var rows = $table.find('> tbody > tr:not(.footable-row-detail)');
			$.each(filters, function (i, f) {
				if (f && f.length)
					rows = rows.filter('*:ftcontains("' + f + '")');
			});
			rows.each(function () {
				p.showRow(this, ft);
				$(this).removeClass('footable-filtered');
			});
			ft.raise('footable_filtered', { filter : filterString });
		}		
	};

    p.clearFilter = function (ft) {
      $(ft.table).find('> tbody > tr:not(.footable-row-detail)').removeClass('footable-filtered').each(function () {
        p.showRow(this, ft);
      });
      ft.raise('footable_filtered', { cleared : true });
    };

    p.showRow = function (row, ft) {
      var $row = $(row), $next = $row.next(), $table = $(ft.table);
      if ($row.is(':visible')) return; //already visible - do nothing
      if ($table.hasClass('breakpoint') && $row.hasClass('footable-detail-show') && $next.hasClass('footable-row-detail')) {
        $row.add($next).show();
        ft.createOrUpdateDetailRow(row);
      }
      else $row.show();
    };
  };

  w.footable.plugins.register(new Filter(), defaults);

})(jQuery, window);
