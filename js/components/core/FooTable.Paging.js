(function($, FooTable){

	/**
	 * An object containing the paging options for the plugin. Added by the {@link FooTable.Paging} component.
	 * @type {object}
	 * @prop {boolean} enabled=false - Whether or not to allow paging on the table.
	 * @prop {number} current=1 - The page number to display.
	 * @prop {number} size=10 - The number of rows displayed per page.
	 * @prop {number} total=-1 - The total number of pages. This is only required if you are using Ajax to provide paging capabilities.
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
	 * The page number to display. Added by the {@link FooTable.Paging} component.
	 * @type {number}
	 * @default 1
	 */
	FooTable.RequestData.prototype.currentPage = 1;

	/**
	 * The number of rows to display per page. Added by the {@link FooTable.Paging} component.
	 * @type {number}
	 * @default 10
	 */
	FooTable.RequestData.prototype.pageSize = 10;

	/**
	 * The total number of pages available. Added by the {@link FooTable.Paging} component.
	 * @type {number}
	 * @default -1
	 */
	FooTable.RequestData.prototype.pageCount = -1;

	/**
	 * The page number to display. Added by the {@link FooTable.Paging} component.
	 * @type {number}
	 * @default 1
	 */
	FooTable.ResponseData.prototype.currentPage = 1;

	/**
	 * The number of rows to display per page. Added by the {@link FooTable.Paging} component.
	 * @type {number}
	 * @default 10
	 */
	FooTable.ResponseData.prototype.pageSize = 10;

	/**
	 * The total number of pages available. Added by the {@link FooTable.Paging} component.
	 * @type {number}
	 * @default -1
	 */
	FooTable.ResponseData.prototype.pageCount = -1;

	FooTable.Paging = FooTable.Component.extend(/** @lends FooTable.Paging */{
		/**
		 * The paging component adds a pagination control to the table allowing users to navigate table rows via pages.
		 * @constructs
		 * @extends FooTable.Component
		 * @param {FooTable.Instance} instance - The parent {@link FooTable.Instance} object for the component.
		 * @returns {FooTable.Filtering}
		 */
		ctor: function(instance){

			/* PROTECTED */
			/**
			 * This provides a shortcut to the {@link FooTable.Instance#options}.[paging]{@link FooTable.Defaults#paging} object.
			 * @protected
			 * @type {object}
			 */
			this.o = instance.options.paging;

			/* PUBLIC */
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

			/* PRIVATE */
			/**
			 * A number indicating the previous page displayed.
			 * @private
			 * @type {number}
			 */
			this._previous = 1;
			/**
			 * The total number of pages used to generated the pagination links. Used in the draw method to determine if the total has changed and the links should be regenerated.
			 * @type {number}
			 * @private
			 */
			this._generated = 0;

			// call the base constructor
			this._super(instance);
		},

		/* PROTECTED */
		/**
		 * Initializes the paging component for the plugin using the supplied table and options.
		 * @instance
		 * @protected
		 * @param {HTMLTableElement} table - The table element the plugin was initialized on.
		 * @param {object} options - The options the plugin was initialized with.
		 * @fires FooTable.Paging#paging_init
		 */
		init: function(table, options){
			if (this.o.enabled == false) return;
			this._generate(options);
			/**
			 * The paging_init event is raised after its UI is generated.
			 * @event FooTable.Paging#paging_init
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 */
			this.ft.raise('paging_init');
		},
		/**
		 * Reinitializes the paging component for the plugin using the supplied table and options.
		 * @instance
		 * @protected
		 * @param {HTMLTableElement} table - The table element the plugin was initialized on.
		 * @param {object} options - The options the plugin was initialized with.
		 * @fires FooTable.Paging#paging_reinit
		 */
		reinit: function(table, options){
			this.destroy();
			if (this.o.enabled == false) return;
			this._generate(options);
			/**
			 * The paging_reinit event is raised after its UI is regenerated.
			 * @event FooTable.Paging#paging_reinit
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 */
			this.ft.raise('paging_reinit');
		},
		/**
		 * Destroys the paging component removing any UI generated from the table.
		 * @instance
		 * @protected
		 */
		destroy: function () {
			if (this.o.enabled == false) return;
			var $tfoot = this.ft.$table.children('tfoot');
			$tfoot.children('.footable-paging').remove();
			if ($tfoot.children().length == 0) $tfoot.remove();
		},
		/**
		 * Appends or updates any filtering specific properties on the {@link FooTable.RequestData} object.
		 * @instance
		 * @protected
		 * @param {FooTable.RequestData} data - The {@link FooTable.RequestData} object about to passed to the {@link FooTable.Defaults#ajax} method.
		 */
		preajax: function(data){
			if (this.o.enabled == false) return;
			data.currentPage = this.o.current;
			data.pageSize = this.o.size;
			data.pageCount = this.o.total;
		},
		/**
		 * Parses the ajax response object and sets the current page, size and total if they exists.
		 * @instance
		 * @protected
		 * @param {object} response - The response object that contains the paging options.
		 */
		postajax: function(response){
			if (this.o.enabled == false) return;
			this.o.size = FooTable.is.type(response.pageSize, 'number') ? response.pageSize : this.o.size;
			this.o.total = FooTable.is.type(response.pageCount, 'number') ? response.pageCount : this.o.total;
			this.o.current = FooTable.is.type(response.currentPage, 'number') ? response.currentPage : this.o.current;
		},
		/**
		 * Performs the actual paging against the {@link FooTable.Rows#array} removing all rows that are not on the current visible page.
		 * @instance
		 * @protected
		 */
		predraw: function(){
			if (this.o.enabled == false || this.ft.options.ajaxEnabled == true) return;
			var self = this;
			self.o.total = self.ft.rows.array.length == 0 ? 1 : Math.ceil(self.ft.rows.array.length / self.o.size);
			self.o.current = self.o.current > self.o.total ? self.o.total : (self.o.current < 1 ? 1 : self.o.current);
			var start = (self.o.current - 1) * self.o.size;
			if (self.o.total > self.o.size) self.ft.rows.array = self.ft.rows.array.splice(start, self.o.size);
		},
		/**
		 * Updates the paging UI setting the state of the pagination control.
		 * @instance
		 * @protected
		 */
		draw: function(){
			if (this.o.enabled == false) return;
			this.$container.children('td').first().attr('colspan', this.ft.columns.colspan());
			if (this._generated !== this.o.total){
				this._generateLinks();
			}
			this._setVisible(this.o.current, this.o.current > this._previous);
			this._setNavigation(true);
		},

		/* PUBLIC */
		/**
		 * Pages to the first page.
		 * @instance
		 * @returns {jQuery.Promise}
		 * @fires FooTable.Paging#"change.ft.paging"
		 * @fires FooTable.Paging#"changed.ft.paging"
		 */
		first: function(){
			return this._set(1, true);
		},
		/**
		 * Pages to the previous page.
		 * @instance
		 * @returns {jQuery.Promise}
		 * @fires FooTable.Paging#"change.ft.paging"
		 * @fires FooTable.Paging#"changed.ft.paging"
		 */
		prev: function(){
			return this._set(this.o.current - 1 > 0 ? this.o.current - 1 : 1, true);
		},
		/**
		 * Pages to the next page.
		 * @instance
		 * @returns {jQuery.Promise}
		 * @fires FooTable.Paging#"change.ft.paging"
		 * @fires FooTable.Paging#"changed.ft.paging"
		 */
		next: function(){
			return this._set(this.o.current + 1 < this.o.total ? this.o.current + 1 : this.o.total, true);
		},
		/**
		 * Pages to the last page.
		 * @instance
		 * @returns {jQuery.Promise}
		 * @fires FooTable.Paging#"change.ft.paging"
		 * @fires FooTable.Paging#"changed.ft.paging"
		 */
		last: function(){
			return this._set(this.o.total, true);
		},
		/**
		 * Pages to the specified page.
		 * @instance
		 * @param {number} page - The page number to go to.
		 * @returns {jQuery.Promise}
		 * @fires FooTable.Paging#"change.ft.paging"
		 * @fires FooTable.Paging#"changed.ft.paging"
		 */
		goto: function(page){
			return this._set(page > this.o.total ? this.o.total : (page < 1 ? 1 : page), true);
		},
		/**
		 * Shows the previous X number of pages in the pagination control where X is the value set by the {@link FooTable.Defaults#paging} - limit.size option value.
		 * @instance
		 */
		prevPages: function(){
			var page = this.$pagination.children('li.footable-page.visible:first').data('page') - 1;
			this._setVisible(page, false, true);
			this._setNavigation(false);
		},
		/**
		 * Shows the next X number of pages in the pagination control where X is the value set by the {@link FooTable.Defaults#paging} - limit.size option value.
		 * @instance
		 */
		nextPages: function(){
			var page = this.$pagination.children('li.footable-page.visible:last').data('page') + 1;
			this._setVisible(page, false, false);
			this._setNavigation(false);
		},

		/* PRIVATE */
		/**
		 * Performs the required steps to handle paging including the raising of the {@link FooTable.Paging#"change.ft.paging"} and {@link FooTable.Paging#"changed.ft.paging"} events.
		 * @instance
		 * @private
		 * @param {number} page - The page to set.
		 * @param {boolean} redraw - Whether or not this operation requires a redraw of the table.
		 * @returns {jQuery.Promise}
		 * @fires FooTable.Paging#"change.ft.paging"
		 * @fires FooTable.Paging#"changed.ft.paging"
		 */
		_set: function(page, redraw){
			var self = this,
				pager = new FooTable.Pager(self.o.total, self.o.current, self.o.size, page, page > self.o.current);
			/**
			 * The change.ft.paging event is raised before a sort is applied and allows listeners to modify the pager or cancel it completely by calling preventDefault on the jQuery.Event object.
			 * @event FooTable.Paging#"change.ft.paging"
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 * @param {FooTable.Pager} pager - The pager that is about to be applied.
			 */
			if (self.ft.raise('change.ft.paging', [pager]).isDefaultPrevented()) return $.when();
			pager.page = pager.page > pager.total ? pager.total	: pager.page;
			pager.page = pager.page < 1 ? 1 : pager.page;
			if (self.o.current == page) return $.when();
			self._previous = self.o.current;
			self.o.current = pager.page;
			return (redraw ? self.ft.update() : $.when()).then(function(){
				/**
				 * The changed.ft.paging event is raised after a pager has been applied.
				 * @event FooTable.Paging#"changed.ft.paging"
				 * @param {jQuery.Event} e - The jQuery.Event object for the event.
				 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
				 * @param {FooTable.Pager} pager - The pager that has been applied.
				 */
				self.ft.raise('changed.ft.paging', [pager]);
			});
		},
		/**
		 * Generates the paging UI from the supplied options.
		 * @instance
		 * @private
		 * @param {object} options - The options to use to generate the paging UI.
		 */
		_generate: function(options){
			options.paging.total = options.paging.total == -1
				? this.ft.rows.array.length
				: options.paging.total;

			if (this.ft.$table.addClass('footable-paging').children('tfoot').length == 0) this.ft.$table.append('<tfoot/>');
			var $cell = $('<td/>').attr('colspan', this.ft.columns.colspan());
			this.$pagination = $('<ul/>', { 'class': 'pagination' }).on('click.footable', 'a.footable-page-link', { self: this }, this._onPageClicked);
			this.$count = $('<span/>', { 'class': 'label label-default' });
			this._generateLinks();
			$cell.append(this.$pagination, $('<div/>', {'class': 'divider'}), this.$count);
			this.$container = $('<tr/>', { 'class': 'footable-paging' }).append($cell).appendTo(this.ft.$table.children('tfoot'));
		},
		/**
		 * Generates all page links for the pagination control.
		 * @instance
		 * @private
		 */
		_generateLinks: function(){
			var self = this,
				multiple = self.o.total > 1,
				link = function(attr, html, klass){
					return $('<li/>', {
						'class': klass
					}).attr('data-page', attr)
						.append($('<a/>', {
							'class': 'footable-page-link',
							href: '#'
						}).data('page', attr).html(html));
				};
			if (self.o.total == 0 || self.o.total == 1){
				self.$pagination.empty();
				self.$count.text(self.o.total + ' of ' + self.o.total);
				self._generated = self.o.total;
				return;
			}
			self.$pagination.empty();
			if (multiple) {
				self.$pagination.append(link('first', self.o.strings.first, 'footable-page-nav'));
				self.$pagination.append(link('prev', self.o.strings.prev, 'footable-page-nav'));
				if (self.o.limit.size > 0 && self.o.limit.size < self.o.total){
					self.$pagination.append(link('prev-limit', self.o.limit.prev, 'footable-page-nav'));
				}
			}
			for (var i = 0, $li; i < self.o.total; i++){
				$li = link(i + 1, i + 1, 'footable-page');
				self.$pagination.append($li);
			}
			if (multiple){
				if (self.o.limit.size > 0 && self.o.limit.size < self.o.total){
					self.$pagination.append(link('next-limit', self.o.limit.next, 'footable-page-nav'));
				}
				self.$pagination.append(link('next', self.o.strings.next, 'footable-page-nav'));
				self.$pagination.append(link('last', self.o.strings.last, 'footable-page-nav'));
			}
			self._generated = self.o.total;
		},
		/**
		 * Sets the state for the navigation links of the pagination control and optionally sets the active class state on the current page link.
		 * @instance
		 * @private
		 * @param {boolean} active - Whether or not to set the active class state on the individual page links.
		 */
		_setNavigation: function(active){
			this.$count.text(this.o.current + ' of ' + this.o.total);

			if (this.o.current == 1) {
				this.$pagination.children('li[data-page="first"],li[data-page="prev"]').addClass('disabled');
			} else {
				this.$pagination.children('li[data-page="first"],li[data-page="prev"]').removeClass('disabled');
			}

			if (this.o.current == this.o.total) {
				this.$pagination.children('li[data-page="next"],li[data-page="last"]').addClass('disabled');
			} else {
				this.$pagination.children('li[data-page="next"],li[data-page="last"]').removeClass('disabled');
			}

			if ((this.$pagination.children('li.footable-page.visible:first').data('page') || 1) == 1) {
				this.$pagination.children('li[data-page="prev-limit"]').addClass('disabled');
			} else {
				this.$pagination.children('li[data-page="prev-limit"]').removeClass('disabled');
			}

			if ((this.$pagination.children('li.footable-page.visible:last').data('page') || this.o.limit.size) == this.o.total) {
				this.$pagination.children('li[data-page="next-limit"]').addClass('disabled');
			} else {
				this.$pagination.children('li[data-page="next-limit"]').removeClass('disabled');
			}

			if (active){
				this.$pagination.children('li.footable-page').removeClass('active').filter('li[data-page="' + this.o.current + '"]').addClass('active');
			}
		},
		/**
		 * Sets the visible page using the supplied parameters.
		 * @instance
		 * @private
		 * @param {number} page - The page to make visible.
		 * @param {boolean} forward - The direction the pagination control should scroll to make the page visible. If set to true the supplied page will be the right most visible pagination link.
		 * @param {boolean} [invert=false] - If invert is set to tru the supplied page will be the left most visible pagination link.
		 */
		_setVisible: function(page, forward, invert){
			if (this.$pagination.children('li.footable-page[data-page="'+page+'"]').hasClass('visible')) return;
			if (this.o.limit.size > 0 && this.o.total > this.o.limit.size){
				page -= 1;
				var start = 0, end = 0;
				if (forward == true || invert == true){
					end = page > this.o.total ? this.o.total : page;
					start = end - this.o.limit.size;
				} else {
					start = page < 0 ? 0 : page;
					end = start + this.o.limit.size;
				}
				if (start < 0){
					start = 0;
					end = this.o.limit.size > this.o.total ? this.o.total : this.o.limit.size;
				}
				if (end > this.o.total){
					end = this.o.total;
					start = this.o.total - this.o.limit.size < 0 ? 0 : this.o.total - this.o.limit.size;
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
		 * @private
		 * @param {jQuery.Event} e - The event object for the event.
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
				case 'prev-limit': self.prevPages();
					return;
				case 'next-limit': self.nextPages();
					return;
				default: self._set(page, true);
					return;
			}
		}
	});

	// Below are methods exposed on the core FooTable.Instance object for easy access

	/**
	 * Navigates to the specified page number. Added by the {@link FooTable.Paging} component.
	 * @instance
	 * @param {number} num - The page number to go to.
	 * @returns {jQuery.Promise}
	 * @fires FooTable.Paging#paging_changing
	 * @fires FooTable.Paging#paging_changed
	 * @see FooTable.Paging#goto
	 */
	FooTable.Instance.prototype.gotoPage = function(num){
		return this.use(FooTable.Paging).goto(num);
	};

	/**
	 * Navigates to the next page. Added by the {@link FooTable.Paging} component.
	 * @instance
	 * @returns {jQuery.Promise}
	 * @fires FooTable.Paging#paging_changing
	 * @fires FooTable.Paging#paging_changed
	 * @see FooTable.Paging#next
	 */
	FooTable.Instance.prototype.nextPage = function(){
		return this.use(FooTable.Paging).next();
	};

	/**
	 * Navigates to the previous page. Added by the {@link FooTable.Paging} component.
	 * @instance
	 * @returns {jQuery.Promise}
	 * @fires FooTable.Paging#paging_changing
	 * @fires FooTable.Paging#paging_changed
	 * @see FooTable.Paging#prev
	 */
	FooTable.Instance.prototype.prevPage = function(){
		return this.use(FooTable.Paging).prev();
	};

	/**
	 * Navigates to the first page. Added by the {@link FooTable.Paging} component.
	 * @instance
	 * @returns {jQuery.Promise}
	 * @fires FooTable.Paging#paging_changing
	 * @fires FooTable.Paging#paging_changed
	 * @see FooTable.Paging#first
	 */
	FooTable.Instance.prototype.firstPage = function(){
		return this.use(FooTable.Paging).first();
	};

	/**
	 * Navigates to the last page. Added by the {@link FooTable.Paging} component.
	 * @instance
	 * @returns {jQuery.Promise}
	 * @fires FooTable.Paging#paging_changing
	 * @fires FooTable.Paging#paging_changed
	 * @see FooTable.Paging#last
	 */
	FooTable.Instance.prototype.lastPage = function(){
		return this.use(FooTable.Paging).last();
	};

	/**
	 * Shows the next X number of pages in the pagination control where X is the value set by the {@link FooTable.Defaults#paging} - limit.size option value. Added by the {@link FooTable.Paging} component.
	 * @instance
	 * @see FooTable.Paging#nextPages
	 */
	FooTable.Instance.prototype.nextPages = function(){
		return this.use(FooTable.Paging).nextPages();
	};

	/**
	 * Shows the previous X number of pages in the pagination control where X is the value set by the {@link FooTable.Defaults#paging} - limit.size option value. Added by the {@link FooTable.Paging} component.
	 * @instance
	 * @see FooTable.Paging#prevPages
	 */
	FooTable.Instance.prototype.prevPages = function(){
		return this.use(FooTable.Paging).prevPages();
	};

})(jQuery, FooTable = window.FooTable || {});