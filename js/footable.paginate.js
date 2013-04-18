/// <reference path="../demo-group-headers.htm" />
(function ($, w, undefined) {
  if (w.footable == undefined || w.footable == null)
    throw new Error('Please check and make sure footable.js is included in the page and is loaded prior to this script.');

  var defaults = {
    paginate: true,
    pageSize: 10,
    pageNavigation: '.footable-nav'
  };

  function Paginate() {
    var p = this;
    p.name = 'Footable Paginate';
    p.pages = [];
    p.currentPage = 0;
    p.pageSize = 0;
    
    p.init = function (ft) {
      if (ft.options.paginate == true) {
        var $table = $(ft.table), $tbody = $table.find('> tbody');
        $table.bind({
          'footable_initialized': function (e) {
            p.input = $table.data('page-navigation') || e.ft.options.pageNavigation;
            p.pageSize = $table.data('page-size') || e.ft.options.pageSize;
            p.createPages(ft, $tbody);
            p.createNavigation(ft, $tbody);
            p.fillPage(ft, $tbody, 0);
          },
          'footable_sorted': function (e) {
            p.createPages(ft, $tbody);
            p.fillPage(ft, $tbody, p.currentPage);
          },
          'footable_filtered' : function(e) {
            p.createPages(ft, $tbody);
            p.createNavigation(ft, $tbody);
            p.fillPage(ft, $tbody, p.currentPage);
          }
        });
      }
    };
    
    p.createPages = function (ft, tbody) {
      var pages = 1;
      var pageCount = pages * p.pageSize;
      var page = [];
      var lastPage = [];
      p.pages = [];
      var rows = tbody.find('> tr:not(.footable-filtered)');
      rows.each(function (i, row) {
        page.push(row);
        if (i === pageCount - 1) {
          p.pages.push(page);
          pages++;
          pageCount = pages * p.pageSize;
          page = [];
        } else if (i >= rows.length - (rows.length % p.pageSize)) {
          lastPage.push(row);
        }
      });
      if (lastPage.length>0) p.pages.push(lastPage);
    };

    p.createNavigation = function (ft, tbody) {
      var $nav = $(p.input);
      if ($nav.length == 0) return;
      $nav.find('li').remove();
      if (p.pages.length > 0) {
        
        $nav.append('<li class="footable-page-arrow"><a href="#prev">&laquo;</a></li>');
        $.each(p.pages, function (i, page) {
          if (page.length > 0) {
            $nav.append('<li class="footable-page"><a href="#">' + (i + 1) + '</a></li>');
          }
        });
        $nav.append('<li class="footable-page-arrow"><a href="#next">&raquo;</a></li>');
      }
      $nav.find('a').click(function (e) {
        e.preventDefault();
        if ($(this).attr('href') == '#prev') {
          if (p.currentPage > 0) {
            p.fillPage(ft, tbody, p.currentPage - 1);
          }
        } else if ($(this).attr('href') == '#next') {
          if (p.currentPage < p.pages.length - 1) {
            p.fillPage(ft, tbody, p.currentPage + 1);
          }
        } else {
          if (p.currentPage != ($(this).html() - 1)) {
            p.fillPage(ft, tbody, $(this).html() - 1);
          }
        }
        $nav.find('li').removeClass('footable-page-current');
        $nav.find('li.footable-page:eq(' + p.currentPage + ')').addClass('footable-page-current');
      });
      $nav.find('li.footable-page:eq(' + p.currentPage + ')').addClass('footable-page-current');
    };

    p.fillPage = function (ft, tbody, pageNumber) {
      p.currentPage = pageNumber;

      tbody.find('> tr:visible').hide();
      $(p.pages[pageNumber]).show().each(function () {
        p.showRow(this, ft);
      });
    };
    
    p.showRow = function (row, ft) {
      var $row = $(row), $next = $row.next(), $table = $(ft.table);
      if ($table.hasClass('breakpoint') && $row.hasClass('footable-detail-show') && $next.hasClass('footable-row-detail')) {
        $row.add($next).show();
        ft.createOrUpdateDetailRow(row);
      }
      else $row.show();
    };
  };

  w.footable.plugins.register(new Paginate(), defaults);

})(jQuery, window);