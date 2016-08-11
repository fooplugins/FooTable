(function ($, F) {
	F.Filtering = F.Component.extend(/** @lends FooTable.Filtering */{
		/**
		 * The filtering component adds a search input and column selector dropdown to the table allowing users to filter the using space delimited queries.
		 * @constructs
		 * @extends FooTable.Component
		 * @param {FooTable.Table} table - The parent {@link FooTable.Table} object for the component.
		 * @returns {FooTable.Filtering}
		 */
		construct: function (table) {
			// call the constructor of the base class
			this._super(table, table.o.filtering.enabled);

			/* PUBLIC */
			/**
			 * The filters to apply to the current {@link FooTable.Rows#array}.
			 * @instance
			 * @type {Array.<FooTable.Filter>}
			 */
			this.filters = table.o.filtering.filters;
			/**
			 * The delay in milliseconds before the query is auto applied after a change.
			 * @instance
			 * @type {number}
			 */
			this.delay = table.o.filtering.delay;
			/**
			 * The minimum number of characters allowed in the search input before it is auto applied.
			 * @instance
			 * @type {number}
			 */
			this.min = table.o.filtering.min;
			/**
			 * Specifies how whitespace in a filter query is handled.
			 * @instance
			 * @type {string}
			 */
			this.space = table.o.filtering.space;
			/**
			 * Whether or not to replace phrase connectors (+.-_) with spaces before executing the query.
			 * @instance
			 * @type {boolean}
			 */
			this.connectors = table.o.filtering.connectors;
			/**
			 * Whether or not ignore case when matching.
			 * @instance
			 * @type {boolean}
			 */
			this.ignoreCase = table.o.filtering.ignoreCase;
			/**
			 * The placeholder text to display within the search $input.
			 * @instance
			 * @type {string}
			 */
			this.placeholder = table.o.filtering.placeholder;
			/**
			 * The position of the $search input within the filtering rows cell.
			 * @type {string}
			 */
			this.position = table.o.filtering.position;
			/**
			 * The jQuery row object that contains all the filtering specific elements.
			 * @instance
			 * @type {jQuery}
			 */
			this.$row = null;
			/**
			 * The jQuery cell object that contains the search input and column selector.
			 * @instance
			 * @type {jQuery}
			 */
			this.$cell = null;
			/**
			 * The jQuery object of the column selector dropdown.
			 * @instance
			 * @type {jQuery}
			 */
			this.$dropdown = null;
			/**
			 * The jQuery object of the search input.
			 * @instance
			 * @type {jQuery}
			 */
			this.$input = null;
			/**
			 * The jQuery object of the search button.
			 * @instance
			 * @type {jQuery}
			 */
			this.$button = null;

			/* PRIVATE */
			/**
			 * The timeout ID for the filter changed event.
			 * @instance
			 * @private
			 * @type {?number}
			 */
			this._filterTimeout = null;
		},

		/* PROTECTED */
		/**
		 * Checks the supplied data and options for the filtering component.
		 * @instance
		 * @protected
		 * @param {object} data - The jQuery data object from the parent table.
		 * @fires FooTable.Filtering#"preinit.ft.filtering"
		 */
		preinit: function(data){
			var self = this;
			/**
			 * The preinit.ft.filtering event is raised before the UI is created and provides the tables jQuery data object for additional options parsing.
			 * Calling preventDefault on this event will disable the component.
			 * @event FooTable.Filtering#"preinit.ft.filtering"
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Table} ft - The instance of the plugin raising the event.
			 * @param {object} data - The jQuery data object of the table raising the event.
			 */
			this.ft.raise('preinit.ft.filtering').then(function(){
				// first check if filtering is enabled via the class being applied
				if (self.ft.$el.hasClass('footable-filtering'))
					self.enabled = true;
				// then check if the data-filtering-enabled attribute has been set
				self.enabled = F.is.boolean(data.filtering)
					? data.filtering
					: self.enabled;

				// if filtering is not enabled exit early as we don't need to do anything else
				if (!self.enabled) return;

				self.space = F.is.string(data.filterSpace)
					? data.filterSpace
					: self.space;

				self.min = F.is.number(data.filterMin)
					? data.filterMin
					: self.min;

				self.connectors = F.is.boolean(data.filterConnectors)
					? data.filterConnectors
					: self.connectors;

				self.ignoreCase = F.is.boolean(data.filterIgnoreCase)
					? data.filterIgnoreCase
					: self.ignoreCase;

				self.delay = F.is.number(data.filterDelay)
					? data.filterDelay
					: self.delay;

				self.placeholder = F.is.string(data.filterPlaceholder)
					? data.filterPlaceholder
					: self.placeholder;

				self.filters = F.is.array(data.filterFilters)
					? self.ensure(data.filterFilters)
					: self.ensure(self.filters);

				if (self.ft.$el.hasClass('footable-filtering-left'))
					self.position = 'left';
				if (self.ft.$el.hasClass('footable-filtering-center'))
					self.position = 'center';
				if (self.ft.$el.hasClass('footable-filtering-right'))
					self.position = 'right';

				self.position = F.is.string(data.filterPosition)
					? data.filterPosition
					: self.position;
			},function(){
				self.enabled = false;
			});
		},
		/**
		 * Initializes the filtering component for the plugin.
		 * @instance
		 * @protected
		 * @fires FooTable.Filtering#"init.ft.filtering"
		 */
		init: function () {
			var self = this;
			/**
			 * The init.ft.filtering event is raised before its UI is generated.
			 * Calling preventDefault on this event will disable the component.
			 * @event FooTable.Filtering#"init.ft.filtering"
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Table} ft - The instance of the plugin raising the event.
			 */
			this.ft.raise('init.ft.filtering').then(function(){
				self.$create();
			}, function(){
				self.enabled = false;
			});
		},
		/**
		 * Destroys the filtering component removing any UI from the table.
		 * @instance
		 * @protected
		 * @fires FooTable.Filtering#"destroy.ft.filtering"
		 */
		destroy: function () {
			/**
			 * The destroy.ft.filtering event is raised before its UI is removed.
			 * Calling preventDefault on this event will prevent the component from being destroyed.
			 * @event FooTable.Filtering#"destroy.ft.filtering"
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Table} ft - The instance of the plugin raising the event.
			 */
			var self = this;
			this.ft.raise('destroy.ft.filtering').then(function(){
				self.ft.$el.removeClass('footable-filtering')
					.find('thead > tr.footable-filtering').remove();
			});
		},
		/**
		 * Creates the filtering UI from the current options setting the various jQuery properties of this component.
		 * @instance
		 * @protected
		 * @this FooTable.Filtering
		 */
		$create: function () {
			var self = this;
			// generate the cell that actually contains all the UI.
			var $form_grp = $('<div/>', {'class': 'form-group'})
					.append($('<label/>', {'class': 'sr-only', text: 'Search'})),
				$input_grp = $('<div/>', {'class': 'input-group'}).appendTo($form_grp),
				$input_grp_btn = $('<div/>', {'class': 'input-group-btn'}),
				$dropdown_toggle = $('<button/>', {type: 'button', 'class': 'btn btn-default dropdown-toggle'})
					.on('click', { self: self }, self._onDropdownToggleClicked)
					.append($('<span/>', {'class': 'caret'})),
				position;

			switch (self.position){
				case 'left': position = 'footable-filtering-left'; break;
				case 'center': position = 'footable-filtering-center'; break;
				default: position = 'footable-filtering-right'; break;
			}
			self.ft.$el.addClass('footable-filtering').addClass(position);

			// add it to a row and then populate it with the search input and column selector dropdown.
			self.$row = $('<tr/>', {'class': 'footable-filtering'}).prependTo(self.ft.$el.children('thead'));
			self.$cell = $('<th/>').attr('colspan', self.ft.columns.visibleColspan).appendTo(self.$row);
			self.$form = $('<form/>', {'class': 'form-inline'}).append($form_grp).appendTo(self.$cell);

			self.$input = $('<input/>', {type: 'text', 'class': 'form-control', placeholder: self.placeholder});

			self.$button = $('<button/>', {type: 'button', 'class': 'btn btn-primary'})
				.on('click', { self: self }, self._onSearchButtonClicked)
				.append($('<span/>', {'class': 'fooicon fooicon-search'}));

			self.$dropdown = $('<ul/>', {'class': 'dropdown-menu dropdown-menu-right'}).append(
				F.arr.map(self.ft.columns.array, function (col) {
					return col.filterable ? $('<li/>').append(
						$('<a/>', {'class': 'checkbox'}).append(
							$('<label/>', {text: col.title}).prepend(
								$('<input/>', {type: 'checkbox', checked: true}).data('__FooTableColumn__', col)
							)
						)
					) : null;
				})
			);

			if (self.delay > 0){
				self.$input.on('keypress keyup', { self: self }, self._onSearchInputChanged);
				self.$dropdown.on('click', 'input[type="checkbox"]', {self: self}, self._onSearchColumnClicked);
			}

			$input_grp_btn.append(self.$button, $dropdown_toggle, self.$dropdown);
			$input_grp.append(self.$input, $input_grp_btn);
		},
		/**
		 * Performs the filtering of rows before they are appended to the page.
		 * @instance
		 * @protected
		 */
		predraw: function(){
			if (F.is.emptyArray(this.filters))
				return;

			var self = this;
			self.ft.rows.array = $.grep(self.ft.rows.array, function(r){
				return r.filtered(self.filters);
			});
		},
		/**
		 * As the rows are drawn by the {@link FooTable.Rows#draw} method this simply updates the colspan for the UI.
		 * @instance
		 * @protected
		 */
		draw: function(){
			this.$cell.attr('colspan', this.ft.columns.visibleColspan);
		},

		/* PUBLIC */
		/**
		 * Adds or updates the filter using the supplied name, query and columns.
		 * @param {string} name - The name for the filter.
		 * @param {(string|FooTable.Query)} query - The query for the filter.
		 * @param {(Array.<number>|Array.<string>|Array.<FooTable.Column>)} columns - The columns to apply the filter to.
		 */
		addFilter: function(name, query, columns){
			var f = F.arr.first(this.filters, function(f){ return f.name == name; });
			if (f instanceof F.Filter){
				f.name = name;
				f.query = query;
				f.columns = columns;
			} else {
				this.filters.push({name: name, query: query, columns: columns});
			}
		},
		/**
		 * Removes the filter using the supplied name if it exists.
		 * @param {string} name - The name of the filter to remove.
		 */
		removeFilter: function(name){
			F.arr.remove(this.filters, function(f){ return f.name == name; });
		},
		/**
		 * Creates a new search filter from the supplied parameters and applies it to the rows. If no parameters are supplied the current search input value
		 * and selected columns are used to create or update the search filter. If there is no search input value then the search filter is removed.
		 * @instance
		 * @param {string} [query] - The query to filter the rows by.
		 * @param {(Array.<string>|Array.<number>|Array.<FooTable.Column>)} [columns] - The columns to apply the filter to in each row.
		 * @returns {jQuery.Promise}
		 * @fires FooTable.Filtering#"before.ft.filtering"
		 * @fires FooTable.Filtering#"after.ft.filtering"
		 */
		filter: function(query, columns){
			if (F.is.undef(query)){
				query = $.trim(this.$input.val() || '');
			} else {
				this.$input.val(query);
			}
			if (!F.is.emptyString(query)) {
				this.addFilter('search', query, columns);
			} else {
				this.removeFilter('search');
			}
			this.$button.children('.fooicon').removeClass('fooicon-search').addClass('fooicon-remove');
			return this._filter();
		},
		/**
		 * Removes the current search filter.
		 * @instance
		 * @returns {jQuery.Promise}
		 * @fires FooTable.Filtering#"before.ft.filtering"
		 * @fires FooTable.Filtering#"after.ft.filtering"
		 */
		clear: function(){
			this.$button.children('.fooicon').removeClass('fooicon-remove').addClass('fooicon-search');
			this.$input.val(null);
			this.removeFilter('search');
			return this._filter();
		},
		/**
		 * Gets an array of {@link FooTable.Column} to apply the search filter to. This also doubles as the default columns for filters which do not specify any columns.
		 * @instance
		 * @returns {Array.<FooTable.Column>}
		 */
		columns: function(){
			if (F.is.jq(this.$dropdown)){
				// if we have a dropdown containing the column names get the selected columns from there
				return this.$dropdown.find('input:checked').map(function(){
					return $(this).data('__FooTableColumn__');
				}).get();
			} else {
				// otherwise find all columns that are set to be filterable.
				return this.ft.columns.get(function(c){ return c.filterable; });
			}
		},
		/**
		 * Takes an array of plain objects containing the filter values or actual {@link FooTable.Filter} objects and ensures that an array of only {@link FooTable.Filter} is returned.
		 * If supplied a plain object that object must contain a name, query and columns properties which are used to create a new {@link FooTable.Filter}.
		 * @instance
		 * @param {({name: string, query: (string|FooTable.Query), columns: (Array.<string>|Array.<number>|Array.<FooTable.Column>)}|Array.<FooTable.Filter>)} filters - The array of filters to check.
		 * @returns {Array.<FooTable.Filter>}
		 */
		ensure: function(filters){
			var self = this, parsed = [], filterable = self.columns();
			if (!F.is.emptyArray(filters)){
				F.arr.each(filters, function(f){
					if (F.is.object(f) && (!F.is.emptyString(f.query) || f.query instanceof F.Query)) {
						f.name = F.is.emptyString(f.name) ? 'anon' : f.name;
						f.columns = F.is.emptyArray(f.columns) ? filterable : self.ft.columns.ensure(f.columns);
						parsed.push(f instanceof F.Filter ? f : new F.Filter(f.name, f.query, f.columns, self.space, self.connectors, self.ignoreCase));
					}
				});
			}
			return parsed;
		},

		/* PRIVATE */
		/**
		 * Performs the required steps to handle filtering including the raising of the {@link FooTable.Filtering#"before.ft.filtering"} and {@link FooTable.Filtering#"after.ft.filtering"} events.
		 * @instance
		 * @private
		 * @returns {jQuery.Promise}
		 * @fires FooTable.Filtering#"before.ft.filtering"
		 * @fires FooTable.Filtering#"after.ft.filtering"
		 */
		_filter: function(){
			var self = this;
			self.filters = self.ensure(self.filters);
			/**
			 * The before.ft.filtering event is raised before a filter is applied and allows listeners to modify the filter or cancel it completely by calling preventDefault on the jQuery.Event object.
			 * @event FooTable.Filtering#"before.ft.filtering"
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Table} ft - The instance of the plugin raising the event.
			 * @param {Array.<FooTable.Filter>} filters - The filters that are about to be applied.
			 */
			return self.ft.raise('before.ft.filtering', [self.filters]).then(function(){
				self.filters = self.ensure(self.filters);
				return self.ft.draw().then(function(){
					/**
					 * The after.ft.filtering event is raised after a filter has been applied.
					 * @event FooTable.Filtering#"after.ft.filtering"
					 * @param {jQuery.Event} e - The jQuery.Event object for the event.
					 * @param {FooTable.Table} ft - The instance of the plugin raising the event.
					 * @param {FooTable.Filter} filter - The filters that were applied.
					 */
					self.ft.raise('after.ft.filtering', [self.filters]);
				});
			});
		},
		/**
		 * Handles the change event for the {@link FooTable.Filtering#$input}.
		 * @instance
		 * @private
		 * @param {jQuery.Event} e - The event object for the event.
		 */
		_onSearchInputChanged: function (e) {
			var self = e.data.self;
			var alpha = e.type == 'keypress' && !F.is.emptyString(String.fromCharCode(e.charCode)),
				ctrl = e.type == 'keyup' && (e.which == 8 || e.which == 46); // backspace & delete

			// if alphanumeric characters or specific control characters
			if(alpha || ctrl) {
				if (e.which == 13) e.preventDefault();
				if (self._filterTimeout != null) clearTimeout(self._filterTimeout);
				self._filterTimeout = setTimeout(function(){
					self._filterTimeout = null;
					self.filter();
				}, self.delay);
			}
		},
		/**
		 * Handles the click event for the {@link FooTable.Filtering#$button}.
		 * @instance
		 * @private
		 * @param {jQuery.Event} e - The event object for the event.
		 */
		_onSearchButtonClicked: function (e) {
			e.preventDefault();
			var self = e.data.self;
			if (self._filterTimeout != null) clearTimeout(self._filterTimeout);
			var $icon = self.$button.children('.fooicon');
			if ($icon.hasClass('fooicon-remove')) self.clear();
			else self.filter();
		},
		/**
		 * Handles the click event for the column checkboxes in the {@link FooTable.Filtering#$dropdown}.
		 * @instance
		 * @private
		 * @param {jQuery.Event} e - The event object for the event.
		 */
		_onSearchColumnClicked: function (e) {
			var self = e.data.self;
			if (self._filterTimeout != null) clearTimeout(self._filterTimeout);
			self._filterTimeout = setTimeout(function(){
				self._filterTimeout = null;
				var $icon = self.$button.children('.fooicon');
				if ($icon.hasClass('fooicon-remove')){
					$icon.removeClass('fooicon-remove').addClass('fooicon-search');
					self.filter();
				}
			}, self.delay);
		},
		/**
		 * Handles the click event for the {@link FooTable.Filtering#$dropdown} toggle.
		 * @instance
		 * @private
		 * @param {jQuery.Event} e - The event object for the event.
		 */
		_onDropdownToggleClicked: function (e) {
			e.preventDefault();
			e.stopPropagation();
			var self = e.data.self;
			self.$dropdown.parent().toggleClass('open');
			if (self.$dropdown.parent().hasClass('open')) $(document).on('click.footable', { self: self }, self._onDocumentClicked);
			else $(document).off('click.footable', self._onDocumentClicked);
		},
		/**
		 * Checks all click events when the dropdown is visible and closes the menu if the target is not the dropdown.
		 * @instance
		 * @private
		 * @param {jQuery.Event} e - The event object for the event.
		 */
		_onDocumentClicked: function(e){
			if ($(e.target).closest('.dropdown-menu').length == 0){
				e.preventDefault();
				var self = e.data.self;
				self.$dropdown.parent().removeClass('open');
				$(document).off('click.footable', self._onDocumentClicked);
			}
		}
	});

	F.components.core.register('filtering', F.Filtering, 10);

})(jQuery, FooTable);