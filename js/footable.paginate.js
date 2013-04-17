(function ($, w, undefined) {
  if (w.footable == undefined || w.footable == null)
    throw new Error('Please check and make sure footable.js is included in the page and is loaded prior to this script.');

  var defaults = {
    paginate: true,
    increment: 10,
    navigation: '.footable-nav'
  };

  function Paginate() {
    var p = this;
    p.name = 'Footable Paginate';
    p.pages = [];
    p.currentPage = 0;
    
    p.init = function (ft) {
      if (ft.options.paginate == true) {
        $(ft.table).bind({
          'footable_initialized': function (e) {
            var $table = $(e.ft.table), $tbody = $table.find('> tbody');
            p.input = $table.data('nav') || e.ft.options.navigation;
            p.createPages(ft, $tbody);
            p.navigate(ft, $tbody);
            p.fillPage(ft, $tbody, 0);
          },
          'footable_sorted': function (e) {
            var $table = $(e.ft.table), $tbody = $table.find('> tbody');
            p.createPages(ft, $tbody);
            p.fillPage(ft, $tbody, p.currentPage);
          },
          'footable_filtered' : function(e) {
            var $table = $(e.ft.table), $tbody = $table.find('> tbody');
            p.createPages(ft, $tbody);
            p.fillPage(ft, $tbody, p.currentPage);
          }
        });
      }
    };
    
    p.createPages = function (ft, tbody) {
      var pages = 1;
      var pageCount = pages * ft.options.increment;
      var page = [];
      var lastPage = [];
      p.pages = [];
      var rows = tbody.find('> tr:not(.footable-filtered)');
      rows.each(function (i, row) {
        page.push(row);
        if (i === pageCount - 1) {
          p.pages.push(page);
          pages++;
          pageCount = pages * ft.options.increment;
          page = [];
        } else if (i >= rows.length - (rows.length % ft.options.increment)) {
          lastPage.push(row);
        }
      });
      p.pages.push(lastPage);
    };

    p.navigate = function (ft, tbody) {
      if (p.pages.length > 0) {
        var element = $(p.input);
        element.append('<li class="arrow"><a href="#prev">&laquo;</a></li>');
        $.each(p.pages, function (i, page) {
          if (page.length > 0) {
            element.append('<li class="page"><a href="#">' + (i + 1) + '</a></li>');
          }
        });
        element.append('<li class="arrow"><a href="#next">&raquo;</a></li>');
      }
      $(p.input + ' a').on('click', function (e) {
        e.preventDefault();
        if ($(this).attr('href') == '#prev') {
          if (p.currentPage > 0) {
            p.fillPage(ft, tbody, p.currentPage - 1);
          }
        } else if ($(this).attr('href') == '#next') {
          if (p.currentPage < p.pages.length - 2) {
            p.fillPage(ft, tbody, p.currentPage + 1);

          }
        } else {
          if (p.currentPage != ($(this).html() - 1)) {
            p.fillPage(ft, tbody, $(this).html() - 1);
          }
        }
        $(p.input + ' li').removeClass('current');
        $(p.input + ' li.page:eq(' + p.currentPage + ')').addClass('current');
      });
      $(p.input + ' li.page:eq(' + p.currentPage + ')').addClass('current');
    };

    p.fillPage = function (ft, tbody, pageNumber) {
      p.currentPage = pageNumber;

      tbody.find('> tr:visible').hide();
      $(p.pages[pageNumber]).show().each(function () {
        var $next = $(this).next();
        if ($next.hasClass('footable-row-detail')) {
          $next.show();
          ft.createOrUpdateDetailRow(this);
        }
      });
    };
  };

  w.footable.plugins.register(new Paginate(), defaults);

})(jQuery, window);