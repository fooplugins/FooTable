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
	 * The total number of rows available. Added by the {@link FooTable.Paging} component.
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
			 * A boolean indicating the direction of paging, TRUE = forward, FALSE = back.
			 * @private
			 * @type {boolean}
			 */
			this._forward = false;

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
			if (this._changed == true) this.raiseChanging();
			data.currentPage = this.o.current;
			data.pageSize = this.o.size;
		},
		/**
		 * Parses the ajax response object and sets the current page, size and total if they exists.
		 * @instance
		 * @protected
		 * @param {object} response - The response object that contains the paging options.
		 */
		postajax: function(response){
			if (this.o.enabled == false) return;
			this.o.total = FooTable.is.type(response.totalRows, 'number') ? response.totalRows : this.o.total;
			this.o.current = this.current();
		},
		/**
		 * Performs the actual paging against the {@link FooTable.Rows#array} removing all rows that are not on the current visible page.
		 * @instance
		 * @protected
		 */
		predraw: function(){
			if (this.o.enabled == false || this.ft.options.ajaxEnabled == true) return;

			var self = this;
			if (self._changed == true) self.raiseChanging();

			self.o.total = self.ft.rows.array.length == 0 ? 1 : self.ft.rows.array.length;
			self.o.current = self.current();
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
			this._generateLinks();
		},
		/**
		 * Performs any post draw operations required for paging.
		 * @instance
		 * @protected
		 */
		postdraw: function(){
			if (this.o.enabled == false) return;
			if (this._changed == true) this.raiseChanged();
			this._changed = false;
		},
		/**
		 * Raises the paging_changing event using the page number and direction to generate a {@link FooTable.Pager} object for the event and merges changes made by any listeners back into the current state.
		 * @instance
		 * @protected
		 * @fires FooTable.Paging#paging_changing
		 */
		raiseChanging: function(){
			var pager = new FooTable.Pager(this.current(), this._forward);
			/**
			 * The paging_changing event is raised before a sort is applied and allows listeners to modify the sorter or cancel it completely by calling preventDefault on the jQuery.Event object.
			 * @event FooTable.Paging#paging_changing
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 * @param {FooTable.Pager} pager - The pager that is about to be applied.
			 */
			if (this._changed == true && this.ft.raise('paging_changing', [pager]).isDefaultPrevented()) return $.when();
			this.o.current = pager.page;
			this._forward = pager.forward;
		},
		/**
		 * Raises the paging_changed event using the page number and direction to generate a {@link FooTable.Pager} object for the event.
		 * @instance
		 * @protected
		 * @fires FooTable.Paging#paging_changed
		 */
		raiseChanged: function(){
			/**
			 * The paging_changed event is raised after a pager has been applied.
			 * @event FooTable.Paging#paging_changed
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 * @param {FooTable.Pager} pager - The pager that has been applied.
			 */
			this.ft.raise('paging_changed', [new FooTable.Pager(this.current(), this._forward)]);
		},

		/* PUBLIC */
		/**
		 * Returns the maximum number of pages taking into account the total number of rows and the page size.
		 * @instance
		 * @returns {number}
		 */
		total: function(){
			return Math.ceil(this.o.total / this.o.size);
		},
		/**
		 * Returns the current page number taking into account the total number of rows and page size to ensure a valid number.
		 * @instance
		 * @returns {number}
		 */
		current: function(){
			var current = this.o.current * this.o.size > this.o.total
				? this.total()
				: this.o.current;
			return current < 1 ? 1 : current;
		},
		/**
		 * Pages to the first page.
		 * @instance
		 * @returns {jQuery.Promise}
		 * @fires FooTable.Paging#paging_changing
		 * @fires FooTable.Paging#paging_changed
		 */
		first: function(){
			return this._set(1, false);
		},
		/**
		 * Pages to the previous page.
		 * @instance
		 * @returns {jQuery.Promise}
		 * @fires FooTable.Paging#paging_changing
		 * @fires FooTable.Paging#paging_changed
		 */
		prev: function(){
			var page = this.o.current - 1 > 0 ? this.o.current - 1 : 1;
			return this._set(page, false);
		},
		/**
		 * Pages to the next page.
		 * @instance
		 * @returns {jQuery.Promise}
		 * @fires FooTable.Paging#paging_changing
		 * @fires FooTable.Paging#paging_changed
		 */
		next: function(){
			var total = this.total(),
				page = this.o.current + 1 < total ? this.o.current + 1 : total;
			return this._set(page, true);
		},
		/**
		 * Pages to the last page.
		 * @instance
		 * @returns {jQuery.Promise}
		 * @fires FooTable.Paging#paging_changing
		 * @fires FooTable.Paging#paging_changed
		 */
		last: function(){
			return this._set(this.total(), true);
		},
		/**
		 * Pages to the specified page.
		 * @instance
		 * @param {number} page - The page number to go to.
		 * @returns {jQuery.Promise}
		 * @fires FooTable.Paging#paging_changing
		 * @fires FooTable.Paging#paging_changed
		 */
		goto: function(page){
			var total = this.total();
			page = page > total ? total : page;
			if (this.o.current == page) return $.when();
			var forward = page > this.o.current;
			return this._set(page, forward);
		},
		/**
		 * Shows the previous X number of pages in the pagination control where X is the value set by the {@link FooTable.Defaults#paging} - limit.size option value.
		 * @instance
		 */
		prevX: function(){
			var page = this.$pagination.children('li.footable-page.visible:first').data('page') - 1;
			this._setVisible(page, false, true);
			this._setNavigation(false);
		},
		/**
		 * Shows the next X number of pages in the pagination control where X is the value set by the {@link FooTable.Defaults#paging} - limit.size option value.
		 * @instance
		 */
		nextX: function(){
			var page = this.$pagination.children('li.footable-page.visible:last').data('page') + 1;
			this._setVisible(page, false, false);
			this._setNavigation(false);
		},

		/* PRIVATE */
		/**
		 * Used by the paging functions to set the actual page, direction and then trigger the {@link FooTable.Instance#update} method.
		 * @instance
		 * @private
		 * @param {number} page - The page to set.
		 * @param {boolean} forward - Whether or not to set the direction as forward.
		 * @returns {jQuery.Promise}
		 * @fires FooTable.Paging#paging_changing
		 * @fires FooTable.Paging#paging_changed
		 */
		_set: function(page, forward){
			if (this.o.current == page) return;
			this.o.current = page;
			this._forward = forward;
			this._changed = true;
			return this.ft.update();
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

			if (this.ft.$table.children('tfoot').length == 0) this.ft.$table.append('<tfoot/>');
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
			var total = this.total(),
				multiple = total > 1,
				changed = this.$pagination.children('li.footable-page').length != total;
			if (total == 0 || total == 1){
				this.$pagination.empty();
				this.$count.text(total + ' of ' + total);
				return;
			}
			if (!changed && this.$pagination.children('li.footable-page[data-page="'+this.o.current+'"]').hasClass('visible')){
				this._setNavigation(true);
				return;
			}
			this.$pagination.empty();
			if (multiple) this.$pagination.append(this._createLink('first', this.o.strings.first, 'footable-page-nav'));
			if (multiple) this.$pagination.append(this._createLink('prev', this.o.strings.prev, 'footable-page-nav'));
			if (multiple && this.o.limit.size > 0 && this.o.limit.size < total) this.$pagination.append(this._createLink('prev-limit', this.o.limit.prev, 'footable-page-nav'));

			for (var i = 0, $li; i < total; i++){
				$li = this._createLink(i + 1, i + 1, 'footable-page');
				this.$pagination.append($li);
			}

			if (multiple && this.o.limit.size > 0 && this.o.limit.size < total) this.$pagination.append(this._createLink('next-limit', this.o.limit.next, 'footable-page-nav'));
			if (multiple) this.$pagination.append(this._createLink('next', this.o.strings.next, 'footable-page-nav'));
			if (multiple) this.$pagination.append(this._createLink('last', this.o.strings.last, 'footable-page-nav'));

			this._setVisible((this.o.current = this.o.current > total ? (total == 0 ? 1 : total) : this.o.current), this._forward);
			this._setNavigation(true);
		},
		/**
		 * Generates an individual page link for the pagination control using the supplied parameters.
		 * @instance
		 * @private
		 * @param {string} attr - The value for the data-page attribute for the link.
		 * @param {string} html - The inner HTML for the link created.
		 * @param {string} klass - A CSS class or class names (space separated) to add to the link.
		 */
		_createLink: function(attr, html, klass){
			return $('<li/>', { 'class': klass }).attr('data-page', attr).append($('<a/>', { 'class': 'footable-page-link', href: '#' }).data('page', attr).html(html));
		},
		/**
		 * Sets the state for the navigation links of the pagination control and optionally sets the active class state on the individual page links.
		 * @instance
		 * @private
		 * @param {boolean} active - Whether or not to set the active class state on the individual page links.
		 */
		_setNavigation: function(active){
			var total = this.total();

			this.$count.text(this.o.current + ' of ' + total);

			if (this.o.current == 1) this.$pagination.children('li[data-page="first"],li[data-page="prev"]').addClass('disabled');
			else this.$pagination.children('li[data-page="first"],li[data-page="prev"]').removeClass('disabled');

			if (this.o.current == total) this.$pagination.children('li[data-page="next"],li[data-page="last"]').addClass('disabled');
			else this.$pagination.children('li[data-page="next"],li[data-page="last"]').removeClass('disabled');

			if ((this.$pagination.children('li.footable-page.visible:first').data('page') || 1) == 1) this.$pagination.children('li[data-page="prev-limit"]').addClass('disabled');
			else this.$pagination.children('li[data-page="prev-limit"]').removeClass('disabled');

			if ((this.$pagination.children('li.footable-page.visible:last').data('page') || this.o.limit.size) == total) this.$pagination.children('li[data-page="next-limit"]').addClass('disabled');
			else this.$pagination.children('li[data-page="next-limit"]').removeClass('disabled');

			if (active) this.$pagination.children('li.footable-page').removeClass('active').filter('li[data-page="' + this.o.current + '"]').addClass('active');
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

			var total = this.total();
			if (this.o.limit.size > 0 && total > this.o.limit.size){
				page -= 1;
				var start = 0, end = 0;
				if (forward == true || invert == true){
					end = page > total ? total : page;
					start = end - this.o.limit.size;
				} else {
					start = page < 0 ? 0 : page;
					end = start + this.o.limit.size;
				}
				if (start < 0){
					start = 0;
					end = this.o.limit.size > total ? total : this.o.limit.size;
				}
				if (end > total){
					end = total;
					start = total - this.o.limit.size < 0 ? 0 : total - this.o.limit.size;
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
				case 'prev-limit': self.prevX();
					return;
				case 'next-limit': self.nextX();
					return;
				default: self._set(page, false);
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
	 * @see FooTable.Paging#nextX
	 */
	FooTable.Instance.prototype.nextPages = function(){
		return this.use(FooTable.Paging).nextX();
	};

	/**
	 * Shows the previous X number of pages in the pagination control where X is the value set by the {@link FooTable.Defaults#paging} - limit.size option value. Added by the {@link FooTable.Paging} component.
	 * @instance
	 * @see FooTable.Paging#prevX
	 */
	FooTable.Instance.prototype.prevPages = function(){
		return this.use(FooTable.Paging).prevX();
	};

	/**
	 * Gets the current page number. Added by the {@link FooTable.Paging} component.
	 * @instance
	 * @returns {number}
	 * @see FooTable.Paging#current
	 */
	FooTable.Instance.prototype.currentPage = function(){
		return this.use(FooTable.Paging).current();
	};

	/**
	 * Gets the total number of pages. Added by the {@link FooTable.Paging} component.
	 * @instance
	 * @returns {number}
	 * @see FooTable.Paging#total
	 */
	FooTable.Instance.prototype.totalPages = function(){
		return this.use(FooTable.Paging).total();
	};

})(jQuery, FooTable = window.FooTable || {});