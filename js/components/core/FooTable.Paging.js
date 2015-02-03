(function($, FooTable){

	/**
	 * An object containing the paging options for the plugin. Added by the {@link FooTable.Paging} component.
	 * @type {object}
	 * @prop {boolean} enabled=false - Whether or not to allow paging on the table.
	 * @prop {number} current=1 - The page number to display.
	 * @prop {number} size=10 - The number of rows displayed per page.
	 * @prop {number} total=-1 - The total number of rows. This is only required if you are using Ajax to provide paging capabilities.
	 * @prop {object} strings - An object containing the strings used by the paging buttons.
	 * @prop {string} strings.first="&laquo;" - The string used for the 'first' button.
	 * @prop {string} strings.prev="&lsaquo;" - The string used for the 'previous' button.
	 * @prop {string} strings.next="&rsaquo;" - The string used for the 'next' button.
	 * @prop {string} strings.last="&raquo;" - The string used for the 'last' button.
	 * @prop {object} limit - An object containing the paging limit options.
	 * @prop {number} limit.size=5 - The maximum number of page links to display at once.
	 * @prop {string} limit.prev="..." - The string used for the 'previous X pages' button.
	 * @prop {string} limit.next="..." - The string used for the 'next X pages' button.
	 */
	FooTable.Defaults.prototype.paging = {
		enabled: false,
		current: 1,
		total: -1,
		size: 10,
		strings: {
			first: '&laquo;',
			prev: '&lsaquo;',
			next: '&rsaquo;',
			last: '&raquo;'
		},
		limit: {
			size: 5,
			prev: '...',
			next: '...'
		}
	};

	/**
	 * The page number to display.
	 * @type {number}
	 * @default 1
	 */
	FooTable.RequestData.prototype.currentPage = 1;

	/**
	 * The number of rows to display per page.
	 * @type {number}
	 * @default 10
	 */
	FooTable.RequestData.prototype.pageSize = 10;

	/**
	 * The total number of rows available.
	 * @type {number}
	 * @default NULL
	 */
	FooTable.ResponseData.prototype.totalRows = null;

	FooTable.Paging = FooTable.Component.extend(/** @lends FooTable.Paging */{
		/**
		 * The paging component adds a pagination control to the table allowing users to navigate table rows via pages.
		 * @constructs
		 * @extends FooTable.Component
		 * @param {FooTable.Instance} instance - The parent {@link FooTable.Instance} object for the component.
		 * @returns {FooTable.Filtering}
		 */
		ctor: function(instance){
			/**
			 * The jQuery object that contains the pagination control.
			 * @type {jQuery}
			 */
			this.$container = null;
			/**
			 * The jQuery object that contains the links for the pagination control.
			 * @type {jQuery}
			 */
			this.$pagination = null;
			/**
			 * The jQuery object that contains the row count.
			 * @type {jQuery}
			 */
			this.$count = null;
			/**
			 * A boolean used to indicate the direction of paging.
			 * @type {boolean}
			 * @private
			 */
			this._forward = false;
			// call the base constructor
			this._super(instance);
		},
		/**
		 * Initializes the paging component for the plugin using the supplied table and options.
		 * @instance
		 * @param {HTMLTableElement} table - The table element the plugin was initialized on.
		 * @param {object} options - The options the plugin was initialized with.
		 * @fires FooTable.Paging#paging_init
		 */
		init: function(table, options){
			if (this.instance.options.paging.enabled == false) return;
			this._generate(options);
			/**
			 * The paging_init event is raised after its UI is generated.
			 * @event FooTable.Paging#paging_init
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 */
			this.instance.raise('paging_init');
		},
		/**
		 * Reinitializes the paging component for the plugin using the supplied table and options.
		 * @instance
		 * @param {HTMLTableElement} table - The table element the plugin was initialized on.
		 * @param {object} options - The options the plugin was initialized with.
		 * @fires FooTable.Paging#paging_reinit
		 */
		reinit: function(table, options){
			this.destroy();
			if (this.instance.options.paging.enabled == false) return;
			this._generate(options);
			/**
			 * The paging_reinit event is raised after its UI is regenerated.
			 * @event FooTable.Paging#paging_reinit
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 */
			this.instance.raise('paging_reinit');
		},
		/**
		 * Destroys the paging component removing any UI generated from the table.
		 * @instance
		 */
		destroy: function () {
			if (this.instance.options.paging.enabled == false) return;
			var $tfoot = this.instance.$table.children('tfoot');
			$tfoot.children('.footable-paging').remove();
			if ($tfoot.children().length == 0) $tfoot.remove();
		},
		/**
		 * Appends or updates any filtering specific properties on the {@link FooTable.RequestData} object.
		 * @instance
		 * @param {FooTable.RequestData} data - The {@link FooTable.RequestData} object about to passed to the {@link FooTable.Defaults#ajax} method.
		 */
		preajax: function(data){
			if (this.instance.options.paging.enabled == false) return;
			data.currentPage = this.instance.options.paging.current;
			data.pageSize = this.instance.options.paging.size;
		},
		/**
		 * Parses the ajax response object and sets the current page, size and total if they exists.
		 * @instance
		 * @param {object} response - The response object that contains the paging options.
		 */
		postajax: function(response){
			if (this.instance.options.paging.enabled == false) return;
			this.instance.options.paging.total = typeof response.totalRows == 'number' ? response.totalRows : this.instance.options.paging.total;
		},
		/**
		 * Performs the actual paging against the {@link FooTable.Rows#array} removing all rows that are not on the current visible page.
		 * @instance
		 */
		predraw: function(){
			if (this.instance.options.paging.enabled == false || this.instance.options.ajaxEnabled == true) return;
			this.instance.options.paging.total = this.instance.rows.array.length == 0 ? 1 : this.instance.rows.array.length;
			this.instance.options.paging.current = this.instance.options.paging.current > this.instance.options.paging.total ? this.instance.options.paging.total : this.instance.options.paging.current;
			var start = (this.instance.options.paging.current - 1) * this.instance.options.paging.size;
			if (this.instance.options.paging.total > this.instance.options.paging.size) this.instance.rows.array = this.instance.rows.array.splice(start, this.instance.options.paging.size);
		},
		/**
		 * Updates the paging UI setting the state of the pagination control.
		 * @instance
		 */
		draw: function(){
			if (this.instance.options.paging.enabled == false) return;
			this.$container.children('td').attr('colspan', this.instance.columns.colspan());
			this._generateLinks();
		},
		/**
		 * Pages to the first page.
		 * @instance
		 */
		first: function(){
			this._set(1, false);
		},
		/**
		 * Pages to the previous page.
		 * @instance
		 */
		prev: function(){
			var page = this.instance.options.paging.current - 1 > 0 ? this.instance.options.paging.current - 1 : 1;
			this._set(page, false);
		},
		/**
		 * Pages to the next page.
		 * @instance
		 */
		next: function(){
			var total = Math.ceil(this.instance.options.paging.total / this.instance.options.paging.size),
				page = this.instance.options.paging.current + 1 < total ? this.instance.options.paging.current + 1 : total;
			this._set(page, true);
		},
		/**
		 * Pages to the last page.
		 * @instance
		 */
		last: function(){
			var page = Math.ceil(this.instance.options.paging.total / this.instance.options.paging.size);
			this._set(page, true);
		},
		/**
		 * Shows the previous X number of pages in the pagination control where X is the value set by the {@link FooTable.Defaults#paging} - limit.size option value.
		 */
		prevX: function(){
			var page = this.$pagination.children('li.footable-page.visible:first').data('page') - 1;
			this._setVisible(page, false, true);
			this._setNavigation(false);
		},
		/**
		 * Shows the next X number of pages in the pagination control where X is the value set by the {@link FooTable.Defaults#paging} - limit.size option value.
		 */
		nextX: function(){
			var page = this.$pagination.children('li.footable-page.visible:last').data('page') + 1;
			this._setVisible(page, false, false);
			this._setNavigation(false);
		},
		/**
		 * Used by the paging functions to set the actual page, direction and then trigger the {@link FooTable.Instance#update} method.
		 * @instance
		 * @param {number} page - The page to set.
		 * @param {boolean} forward - Whether or not the set direction is forward.
		 * @private
		 */
		_set: function(page, forward){
			if (this.instance.options.paging.current == page) return;
			this.instance.options.paging.current = page;
			this._forward = forward;
			this.instance.update();
		},
		/**
		 * Generates the paging UI from the supplied options.
		 * @instance
		 * @param {object} options - The options to use to generate the paging UI.
		 * @private
		 */
		_generate: function(options){
			options.paging.total = options.paging.total == -1
				? this.instance.rows.array.length
				: options.paging.total;

			if (this.instance.$table.children('tfoot').length == 0) this.instance.$table.append('<tfoot/>');
			var $cell = $('<td/>').attr('colspan', this.instance.columns.colspan());
			this.$pagination = $('<ul/>', { 'class': 'pagination' }).on('click.footable', 'a.footable-page-link', { self: this }, this._onPageClicked);
			this.$count = $('<span/>', { 'class': 'label label-default' });
			this._generateLinks();
			$cell.append(this.$pagination, $('<div/>', {'class': 'divider'}), this.$count);
			this.$container = $('<tr/>', { 'class': 'footable-paging' }).append($cell).appendTo(this.instance.$table.children('tfoot'));
		},
		/**
		 * Generates all page links for the pagination control.
		 * @instance
		 * @private
		 */
		_generateLinks: function(){
			var total = Math.ceil(this.instance.options.paging.total / this.instance.options.paging.size),
				multiple = total > 1,
				changed = this.$pagination.children('li.footable-page').length != total;
			if (total == 0){
				this.$pagination.empty();
				return;
			}
			if (!changed && this.$pagination.children('li.footable-page[data-page="'+this.instance.options.paging.current+'"]').hasClass('visible')){
				this._setNavigation(true);
				return;
			}
			this.$pagination.empty();
			if (multiple) this.$pagination.append(this._createLink('first', this.instance.options.paging.strings.first, 'footable-page-nav'));
			if (multiple) this.$pagination.append(this._createLink('prev', this.instance.options.paging.strings.prev, 'footable-page-nav'));
			if (multiple && this.instance.options.paging.limit.size > 0 && this.instance.options.paging.limit.size < total) this.$pagination.append(this._createLink('prev-limit', this.instance.options.paging.limit.prev, 'footable-page-nav'));

			for (var i = 0, $li; i < total; i++){
				$li = this._createLink(i + 1, i + 1, 'footable-page');
				this.$pagination.append($li);
			}

			if (multiple && this.instance.options.paging.limit.size > 0 && this.instance.options.paging.limit.size < total) this.$pagination.append(this._createLink('next-limit', this.instance.options.paging.limit.next, 'footable-page-nav'));
			if (multiple) this.$pagination.append(this._createLink('next', this.instance.options.paging.strings.next, 'footable-page-nav'));
			if (multiple) this.$pagination.append(this._createLink('last', this.instance.options.paging.strings.last, 'footable-page-nav'));

			this._setVisible((this.instance.options.paging.current = this.instance.options.paging.current > total ? (total == 0 ? 1 : total) : this.instance.options.paging.current), this._forward);
			this._setNavigation(true);
		},
		/**
		 * Generates an individual page link for the pagination control using the supplied parameters.
		 * @instance
		 * @param {string} attr - The value for the data-page attribute for the link.
		 * @param {string} html - The inner HTML for the link created.
		 * @param {string} klass - A CSS class or class names (space separated) to add to the link.
		 * @private
		 */
		_createLink: function(attr, html, klass){
			return $('<li/>', { 'class': klass }).attr('data-page', attr).append($('<a/>', { 'class': 'footable-page-link', href: '#' }).data('page', attr).html(html));
		},
		/**
		 * Sets the state for the navigation links of the pagination control and optionally sets the active class state on the individual page links.
		 * @instance
		 * @param {boolean} active - Whether or not to set the active class state on the individual page links.
		 * @private
		 */
		_setNavigation: function(active){
			var total = Math.ceil(this.instance.options.paging.total / this.instance.options.paging.size);

			this.$count.text(this.instance.options.paging.current + ' of ' + total);

			if (this.instance.options.paging.current == 1) this.$pagination.children('li[data-page="first"],li[data-page="prev"]').addClass('disabled');
			else this.$pagination.children('li[data-page="first"],li[data-page="prev"]').removeClass('disabled');

			if (this.instance.options.paging.current == total) this.$pagination.children('li[data-page="next"],li[data-page="last"]').addClass('disabled');
			else this.$pagination.children('li[data-page="next"],li[data-page="last"]').removeClass('disabled');

			if ((this.$pagination.children('li.footable-page.visible:first').data('page') || 1) == 1) this.$pagination.children('li[data-page="prev-limit"]').addClass('disabled');
			else this.$pagination.children('li[data-page="prev-limit"]').removeClass('disabled');

			if ((this.$pagination.children('li.footable-page.visible:last').data('page') || this.instance.options.paging.limit.size) == total) this.$pagination.children('li[data-page="next-limit"]').addClass('disabled');
			else this.$pagination.children('li[data-page="next-limit"]').removeClass('disabled');

			if (active) this.$pagination.children('li.footable-page').removeClass('active').filter('li[data-page="' + this.instance.options.paging.current + '"]').addClass('active');
		},
		/**
		 * Sets the visible page using the supplied parameters.
		 * @instance
		 * @param {number} page - The page to make visible.
		 * @param {boolean} forward - The direction the pagination control should scroll to make the page visible. If set to true the supplied page will be the right most visible pagination link.
		 * @param {boolean} [invert=false] - If invert is set to tru the supplied page will be the left most visible pagination link.
		 * @private
		 */
		_setVisible: function(page, forward, invert){
			if (this.$pagination.children('li.footable-page[data-page="'+page+'"]').hasClass('visible')) return;

			var total = Math.ceil(this.instance.options.paging.total / this.instance.options.paging.size);
			if (this.instance.options.paging.limit.size > 0 && total > this.instance.options.paging.limit.size){
				page -= 1;
				var start = 0, end = 0;
				if (forward == true || invert == true){
					end = page > total ? total : page;
					start = end - this.instance.options.paging.limit.size;
				} else {
					start = page < 0 ? 0 : page;
					end = start + this.instance.options.paging.limit.size;
				}
				if (start < 0){
					start = 0;
					end = this.instance.options.paging.limit.size > total ? total : this.instance.options.paging.limit.size;
				}
				if (end > total){
					end = total;
					start = total - this.instance.options.paging.limit.size < 0 ? 0 : total - this.instance.options.paging.limit.size;
				}
				if (forward == true){
					start++;
					end++;
				}
				this.$pagination.children('li.footable-page').removeClass('visible').slice(start, end).addClass('visible');
			} else {
				this.$pagination.children('li.footable-page').addClass('visible');
			}
		},
		/**
		 * Handles the click event for all links in the pagination control.
		 * @instance
		 * @param {jQuery.Event} e - The event object for the event.
		 * @private
		 */
		_onPageClicked: function(e){
			e.preventDefault();
			if ($(e.target).closest('li').is('.active,.disabled')) return;

			var self = e.data.self, page = $(this).data('page');
			switch(page){
				case 'first': self.first();
					return;
				case 'prev': self.prev();
					return;
				case 'next': self.next();
					return;
				case 'last': self.last();
					return;
				case 'prev-limit': self.prevX();
					return;
				case 'next-limit': self.nextX();
					return;
				default: self._set(page, false);
					return;
			}
		}
	});

})(jQuery, FooTable = window.FooTable || {});