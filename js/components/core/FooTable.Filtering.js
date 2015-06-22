(function ($, FooTable) {

	/**
	 * Whether or not the column can be used during filtering. Added by the {@link FooTable.Filtering} component.
	 * @type {boolean}
	 * @default true
	 */
	FooTable.Column.prototype.filterable = true;

	/**
	 * An object containing the filtering options for the plugin. Added by the {@link FooTable.Filtering} component.
	 * @type {object}
	 * @prop {boolean} enabled=false - Whether or not to allow filtering on the table.
	 * @prop {string} query=null - The query to filter the rows by. Rows that match this query are included in the result.
	 * @prop {(Array.<FooTable.Column>|Array.<string>|Array.<number>)} columns - The columns to apply the query to.
	 * @prop {number} delay=500 - The delay in milliseconds before the query is auto applied after a change.
	 * @prop {number} min=3 - The minimum number of characters allowed before a filter is auto applied.
	 * @prop {object} strings - An object containing the strings used by the filtering component.
	 * @prop {string} strings.placeholder="Search" - The string used as the placeholder for the filter input.
	 */
	FooTable.Defaults.prototype.filtering = {
		enabled: false,
		query: null,
		columns: [],
		delay: 500,
		min: 3,
		strings: {
			placeholder: 'Search'
		}
	};

	/**
	 * The query to filter the rows by. Rows that match this query are included in the result. Added by the {@link FooTable.Filtering} component.
	 * @type {string}
	 * @default NULL
	 */
	FooTable.RequestData.prototype.filterQuery = null;

	/**
	 * The columns to apply the {@link FooTable.RequestData#filterQuery} to. Added by the {@link FooTable.Filtering} component.
	 * @type {Array.<string>}
	 * @default []
	 */
	FooTable.RequestData.prototype.filterColumns = [];

	FooTable.Filtering = FooTable.Component.extend(/** @lends FooTable.Filtering */{
		/**
		 * The filtering component adds a search input and column selector dropdown to the table allowing users to filter the using space delimited queries.
		 * @constructs
		 * @extends FooTable.Component
		 * @param {FooTable.Instance} instance - The parent {@link FooTable.Instance} object for the component.
		 * @returns {FooTable.Filtering}
		 */
		ctor: function (instance) {

			/* PROTECTED */
			/**
			 * This provides a shortcut to the {@link FooTable.Instance#options}.[filtering]{@link FooTable.Defaults#filtering} object.
			 * @protected
			 * @type {object}
			 */
			this.o = instance.options.filtering;

			/* PUBLIC */
			/**
			 * The jQuery object that contains the search input and column selector.
			 * @type {jQuery}
			 */
			this.$container = null;
			/**
			 * The jQuery object that contains the column selector dropdown.
			 * @type {jQuery}
			 */
			this.$dropdown_container = null;
			/**
			 * The jQuery object of the column selector dropdown.
			 * @type {jQuery}
			 */
			this.$dropdown = null;
			/**
			 * The jQuery object of the search input.
			 * @type {jQuery}
			 */
			this.$search_input = null;
			/**
			 * The jQuery object of the search button.
			 * @type {jQuery}
			 */
			this.$search_button = null;

			/* PRIVATE */
			/**
			 * The timeout ID for the filter changed event.
			 * @private
			 * @type {?number}
			 */
			this._filterTimeout = null;
			/**
			 * Sets a flag indicating whether or not the filter has changed. When set to true the {@link FooTable.Filtering#filtering_changing} and {@link FooTable.Filtering#filtering_changed} events
			 * will be raised during the drawing operation.
			 * @private
			 * @type {boolean}
			 */
			this._changed = false;

			// call the constructor of the base class
			this._super(instance);
		},

		/* PROTECTED */
		/**
		 * Allows the filtering component to extend the {@link FooTable.Column} constructor.
		 * @instance
		 * @protected
		 * @param {FooTable.Column} column - The column being constructed.
		 * @param {object} definition - The definition to populate the column with.
		 */
		ctor_column: function(column, definition){
			column.filterable = FooTable.is.boolean(definition.filterable) ? definition.filterable : true;
		},
		/**
		 * Initializes the filtering component for the plugin using the supplied table and options.
		 * @instance
		 * @protected
		 * @param {HTMLTableElement} table - The table element the plugin was initialized on.
		 * @param {object} options - The options the plugin was initialized with.
		 * @fires FooTable.Filtering#filtering_init
		 */
		init: function (table, options) {
			if (options.filtering.enabled == false) return;
			this._generate(options);
			/**
			 * The filtering_init event is raised after its UI is generated.
			 * @event FooTable.Filtering#filtering_init
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 */
			this.ft.raise('filtering_init');
		},
		/**
		 * Reinitializes the filtering component for the plugin using the supplied options.
		 * @instance
		 * @protected
		 * @param {object} options - The options the plugin was reinitialized with.
		 * @fires FooTable.Filtering#filtering_reinit
		 */
		reinit: function (options) {
			this.destroy();
			if (options.filtering.enabled == false) return;
			this._generate(options);
			/**
			 * The filtering_reinit event is raised after its UI is regenerated.
			 * @event FooTable.Filtering#filtering_reinit
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 */
			this.ft.raise('filtering_reinit');
		},
		/**
		 * Destroys the filtering component removing any UI generated from the table.
		 * @instance
		 * @protected
		 */
		destroy: function () {
			if (this.o.enabled == false) return;
			var $thead = this.ft.$table.children('tfoot');
			$thead.children('.footable-filtering').remove();
			if ($thead.children().length == 0) $thead.remove();
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
			data.filterQuery = this.o.query;
			data.filterColumns = $.map(this.o.columns, function(col){
				return col.name;
			});
		},
		/**
		 * Performs the filtering of rows before they are appended to the page.
		 * @instance
		 * @protected
		 */
		predraw: function(){
			if (this.o.enabled == false
				|| this.ft.options.ajaxEnabled == true)
				return;

			var self = this;
			if (self._changed == true) self.raiseChanging();

			if (FooTable.strings.isNullOrEmpty(self.o.query)) return;

			var i, text, len = self.ft.rows.array.length, remove = [];
			for (i = 0; i < len; i++){
				text = '';
				for (var j = 0, column; j < self.o.columns.length; j++){
					column = self.o.columns[j];
					text += ' ' + self.ft.rows.array[i].cells[column.index].display;
				}
				if (self.isFiltered(self.o.query, text)){
					remove.push(i);
				}
			}
			remove.sort(function(a, b){ return a - b; });
			len = remove.length - 1;
			for (i = len; i >= 0; i--){
				self.ft.rows.array.splice(remove[i],1);
			}
		},
		/**
		 * As the rows are drawn by the {@link FooTable.Rows#draw} method this simply updates the colspan for the UI.
		 * @instance
		 * @protected
		 */
		draw: function(){
			if (this.o.enabled == false) return;
			var self = this;
			self.$container.children('td').first().attr('colspan', self.ft.columns.colspan());
			if (FooTable.strings.isNullOrEmpty(self.o.query)){
				self.$search_button.children('.glyphicon').removeClass('glyphicon-remove').addClass('glyphicon-search');
			} else {
				self.$search_button.children('.glyphicon').removeClass('glyphicon-search').addClass('glyphicon-remove');
			}
			self.$search_input.val(self.o.query);
		},
		/**
		 * Performs any post draw operations required for filtering.
		 * @instance
		 * @protected
		 */
		postdraw: function(){
			if (this.o.enabled == false) return;
			if (this._changed == true) this.raiseChanged();
			this._changed = false;
		},
		/**
		 * Checks if the supplied text is filtered by the query.
		 * @instance
		 * @protected
		 * @param {string} query - The query to filter by.
		 * @param {string} text - The text to check.
		 * @returns {boolean}
		 */
		isFiltered: function(query, text){
			var queries = query.split(' '), count = queries.length;
			for (var i = 0, len = queries.length; i < len; i++){
				if (text.toUpperCase().indexOf(queries[i].toUpperCase()) >= 0) count--;
			}
			return count > 0;
		},
		/**
		 * Raises the filtering_changing event using the current filter and columns to generate a {@link FooTable.Filter} object for the event and merges changes made by any listeners back into the current state.
		 * @instance
		 * @protected
		 * @fires FooTable.Filtering#filtering_changing
		 */
		raiseChanging: function(){
			var filter = new FooTable.Filter(this.o.query, this.o.columns);
			/**
			 * The filtering_changing event is raised before a filter is applied and allows listeners to modify the filter or cancel it completely by calling preventDefault on the jQuery.Event object.
			 * @event FooTable.Filtering#filtering_changing
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 * @param {FooTable.Filter} filter - The filter that is about to be applied.
			 */
			if (this.ft.raise('filtering_changing', [filter]).isDefaultPrevented()) return;
			this.o.query = filter.query;
			this.o.columns = FooTable.is.array(filter.columns) ? this.ft.columns.ensure(filter.columns) : this.columns();
		},
		/**
		 * Raises the filtering_changed event using the filter and columns to generate a {@link FooTable.Filter} object for the event.
		 * @instance
		 * @protected
		 * @fires FooTable.Filtering#filtering_changed
		 */
		raiseChanged: function(){
			/**
			 * The filtering_changed event is raised after a filter has been applied.
			 * @event FooTable.Filtering#filtering_changed
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 * @param {FooTable.Filter} filter - The filter that has been applied.
			 */
			this.ft.raise('filtering_changed', [new FooTable.Filter(this.o.query, this.o.columns)]);
		},

		/* PUBLIC */
		/**
		 * Sets the filtering options and calls the {@link FooTable.Instance#update} method to perform the actual filtering.
		 * @instance
		 * @param {string} query - The query to filter the rows by.
		 * @param {(Array.<string>|Array.<number>|Array.<FooTable.Column>)} [columns] - The columns to apply the filter to in each row.
		 * @returns {jQuery.Promise}
		 * @fires FooTable.Filtering#filtering_changing
		 * @fires FooTable.Filtering#filtering_changed
		 */
		filter: function(query, columns){
			this.o.query = query;
			this.o.columns = FooTable.is.array(columns) ? this.ft.columns.ensure(columns) : this.columns();
			this._changed = true;
			return this.ft.update();
		},
		/**
		 * Clears the current filter.
		 * @instance
		 * @returns {jQuery.Promise}
		 * @fires FooTable.Filtering#filtering_changing
		 * @fires FooTable.Filtering#filtering_changed
		 */
		clear: function(){
			return this.filter(null, []);
		},
		/**
		 * Gets an array of all selected {@link FooTable.Column}s to apply the filter to.
		 * @instance
		 * @param {boolean} [all=false] - Overrides returning only selected columns and instead returns all available filterable columns.
		 * @returns {Array.<FooTable.Column>}
		 */
		columns: function(all){
			var selector = 'input:checked';
			if (FooTable.is.defined(all) && all === true) selector = 'input[type=checkbox]';
			return this.$dropdown.find(selector).map(function(){
				return $(this).data('footable_column');
			}).get();
		},
		/**
		 * Gets the query entered into filter input.
		 * @instance
		 * @returns {string}
		 */
		query: function(){
			return $.trim(this.$search_input.val() || '');
		},

		/* PRIVATE */
		/**
		 * Generates the filtering UI from the supplied options.
		 * @instance
		 * @private
		 * @param {object} options - The options to use to generate the filtering UI.
		 */
		_generate: function (options) {
			var self = this;
			// parse the options into actual FooTable.Columns if they are names or indexes.
			options.filtering.columns = self.ft.columns.ensure(options.filtering.columns);
			// if no options for filterable columns exists generate a default array using the column.filterable property.
			if (options.filtering.columns.length == 0) {
				options.filtering.columns = self.ft.columns.map(function (col) {
					return col.filterable ? col : null;
				});
			}
			// add a header if none exists
			if (self.ft.$table.children('thead').length == 0) self.ft.$table.prepend('<thead/>');
			// generate the cell that actually contains all the UI.
			var $cell = $('<th/>').attr('colspan', self.ft.columns.colspan());
			// add it to a row and then populate it with the search input and column selector dropdown.
			self.$container = $('<tr/>', {'class': 'footable-filtering'}).append($cell).prependTo(self.ft.$table.children('thead'));
			$('<div/>', {'class': 'input-group'})
				.append(
				(self.$search_input = $('<input/>', {type: 'text', 'class': 'form-control', placeholder: options.filtering.strings.placeholder}).on('keyup', { self: self }, self._onFilterChanged)),
				(self.$dropdown_container = $('<div/>', {'class': 'input-group-btn'})
					.append(
					(self.$search_button = $('<button/>', {type: 'button', 'class': 'btn btn-primary'}).on('click', { self: self }, self._onFilterClicked)
						.append($('<span/>', {'class': 'glyphicon glyphicon-search'}))),
					$('<button/>', {type: 'button', 'class': 'btn btn-default dropdown-toggle'}).on('click', { self: self }, self._onDropdownClicked)
						.append($('<span/>', {'class': 'caret'})),
					(self.$dropdown = $('<ul/>', {'class': 'dropdown-menu dropdown-menu-right'})
						.append(
						self.ft.columns.map(function (col) {
							return col.filterable && col.visible ? $('<li/>').append(
								$('<label/>', {text: col.title}).prepend(
									$('<input/>', {type: 'checkbox', checked: $.inArray(options.filtering.columns, col)}).on('click', { self: self }, self._onColumnClicked).data('footable_column', col)
								)
							) : null;
						})
					))
				))
			).appendTo($cell);
		},
		/**
		 * Handles the change event for the {@link FooTable.Filtering#$search_input}.
		 * @instance
		 * @private
		 * @param {jQuery.Event} e - The event object for the event.
		 */
		_onFilterChanged: function (e) {
			e.preventDefault();
			var self = e.data.self;
			if (self._filterTimeout != null) clearTimeout(self._filterTimeout);

			var query = self.query(),
				alpha = String.fromCharCode(e.keyCode).match(/\w/),
				ctrl = (e.keyCode == 8 || e.keyCode == 46); // backspace & delete

			// if alphanumeric characters or specific control characters
			if(alpha || ctrl) {
				self._filterTimeout = setTimeout(function(){
					self._filterTimeout = null;
					if (query.length >= self.o.min) self.filter(query, self.columns());
					else if (FooTable.strings.isNullOrEmpty(query)) self.clear();
				}, self.o.delay);
			}
		},
		/**
		 * Handles the click event for the {@link FooTable.Filtering#$search_button}.
		 * @instance
		 * @private
		 * @param {jQuery.Event} e - The event object for the event.
		 */
		_onFilterClicked: function (e) {
			e.preventDefault();
			var self = e.data.self;
			if (self._filterTimeout != null) clearTimeout(self._filterTimeout);
			if (self.$search_button.children('.glyphicon').hasClass('glyphicon-search')) self.filter(self.query(), self.columns());
			else self.clear();
		},
		/**
		 * Handles the click event for the column checkboxes in the {@link FooTable.Filtering#$dropdown}.
		 * @instance
		 * @private
		 * @param {jQuery.Event} e - The event object for the event.
		 */
		_onColumnClicked: function (e) {
			var self = e.data.self;
			if (self._filterTimeout != null) clearTimeout(self._filterTimeout);
			self._filterTimeout = setTimeout(function(){
				self._filterTimeout = null;
				var $icon = self.$search_button.children('.glyphicon');
				if ($icon.hasClass('glyphicon-remove')){
					$icon.removeClass('glyphicon-remove').addClass('glyphicon-search');
					self.filter(self.query(), self.columns());
				}
			}, self.o.delay);
		},
		/**
		 * Handles the click event for the {@link FooTable.Filtering#$dropdown} toggle.
		 * @instance
		 * @private
		 * @param {jQuery.Event} e - The event object for the event.
		 */
		_onDropdownClicked: function (e) {
			e.preventDefault();
			e.stopPropagation();
			var self = e.data.self;
			self.$dropdown_container.toggleClass('open');
			if (self.$dropdown_container.hasClass('open')) $(document).on('click.footable', { self: self }, self._onDocumentClicked);
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
				self.$dropdown_container.removeClass('open');
				$(document).off('click.footable', self._onDocumentClicked);
			}
		}
	});

	// Below are methods exposed on the core FooTable.Instance object for easy access

	/**
	 * Filter the table using the supplied query and columns. Added by the {@link FooTable.Filtering} component.
	 * @instance
	 * @param {string} query - The query to filter the rows by.
	 * @param {(Array.<string>|Array.<number>|Array.<FooTable.Column>)} [columns] - The columns to apply the filter to in each row.
	 * @returns {jQuery.Promise}
	 * @fires FooTable.Filtering#filtering_changing
	 * @fires FooTable.Filtering#filtering_changed
	 * @see FooTable.Filtering#filter
	 */
	FooTable.Instance.prototype.applyFilter = function(query, columns){
		return this.use(FooTable.Filtering).filter(query, columns);
	};

	/**
	 * Clear the current filter from the table. Added by the {@link FooTable.Filtering} component.
	 * @instance
	 * @returns {jQuery.Promise}
	 * @fires FooTable.Filtering#filtering_changing
	 * @fires FooTable.Filtering#filtering_changed
	 * @see FooTable.Filtering#clear
	 */
	FooTable.Instance.prototype.clearFilter = function(){
		return this.use(FooTable.Filtering).clear();
	};

})(jQuery, FooTable = window.FooTable || {});