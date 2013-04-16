(function($, w, undefined) {
	if (w.footable == undefined || w.footable == null)
		throw new Error('Please check and make sure footable.js is included in the page and is loaded prior to this script.');

	var defaults = {
		paginate: true,
		increment: 10,
		navigation: '.footable-nav'
	}

	function Paginate() {
		var p = this;
		p.name = 'Footable Paginate';
		p.pages = [];
		p.currentPage = 0;
		p.countRows = 0;
		p.init = function(ft) {
			if(ft.options.paginate == true) {
				$(ft.table).bind({
          			'footable_initialized': function(e) {
          				var $table = $(e.ft.table), $tbody = $table.find('> tbody');
          				p.input = $table.data('nav') || e.ft.options.navigation;
						var pages = 1;
						var pageCount = pages * ft.options.increment;
						var page = [];
						var lastPage = [];
						$.each(p.rows(ft, $tbody), function(i, row) {
							page.push(row);
							if (i === pageCount - 1){
								p.pages.push(page);
								pages++;
								pageCount = pages * ft.options.increment;
								page = [];
							} else if ( i >= p.rows(ft, $tbody).length - (p.rows(ft, $tbody).length % ft.options.increment)) {
								lastPage.push(row);
							}
						});
						p.pages.push(lastPage);
						p.navigate(ft, $tbody);
						p.fillPage(ft, $tbody, 0);
						$('.footable-sortable').on('click', function(e){
							p.fillPage(ft, $tbody, p.currentPage);
						});
      				}
  				});
			}
		}

		p.rows = function(ft, tbody) {
			var rows = [];
			var i = 1;
			tbody.find('> tr').each(function() {
				rows.push(this);
				$(this).attr('data-order', i);
				i++;
			});
			return rows;
		};

		p.navigate = function(ft, tbody) {
			if (p.pages.length > 0) {
				var element = $(p.input);
				element.append('<li class="arrow"><a href="#prev">&laquo;</a></li>');
				$.each(p.pages, function(i, page){
					if (page.length > 0) {
						element.append('<li><a href="#" data-page=' + i + '>' + (i + 1) + '</a></li>');
					}
				});
				element.append('<li class="arrow"><a href="#next">&raquo;</a></li>');
			}
			$(p.input + ' a').on('click', function(e) {
				e.preventDefault();
				if ($(this).attr('href') == '#prev') {
					if (p.currentPage > 0){
						p.fillPage(ft, tbody, p.currentPage - 1);
					}
				} else if ($(this).attr('href') == '#next') {
					if (p.currentPage < p.pages.length - 2){
						p.fillPage(ft, tbody, p.currentPage + 1);

					}
				} else {
					if (p.currentPage != ($(this).html() - 1)) {
						p.fillPage(ft, tbody, $(this).html() - 1);
					}
				}
				$(p.input + ' li').removeClass('current');
				$(p.input + ' a[data-page="' + p.currentPage + '"]').closest('li').addClass('current');
			});
			$(p.input + ' a[data-page="' + p.currentPage + '"]').closest('li').addClass('current');
		};

		p.clear = function(ft, tbody) {
			tbody.find('> tr').each(function() {
				$(this).hide();
			});
		};

		p.fillPage = function(ft, tbody, pageNumber) {
			p.clear(ft, tbody);
			p.currentPage = pageNumber;
			$.each(p.pages[pageNumber], function(i, row) {
				tbody.find('> tr:nth-child(' + ( i + (ft.options.increment * pageNumber + 1) ) + ')').show();
			});
		};
	};

	w.footable.plugins.register(new Paginate(), defaults);

})(jQuery, window);