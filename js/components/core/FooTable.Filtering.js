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
	 * @prop {(Array.<FooTable.Column>|Array.<string>|Array.<number>)} columns=[] - The columns to apply the query to.
	 * @prop {string} delay=500 - The delay in milliseconds before the query is auto applied after a change.
	 */
	FooTable.Defaults.prototype.filtering = {
		enabled: false,
		query: null,
		columns: [],
		delay: 500
	};

	/**
	 * An object containing the filtering options for the request. Added by the {@link FooTable.Filtering} component.
	 * @type {object}
	 * @prop {string} query=null - The query to filter the rows by. Rows that match this query are included in the result.
	 * @prop {(Array.<string>|Array.<FooTable.Column>)} columns=[\] - The columns to apply the query to.
	 */
	FooTable.RequestData.prototype.filtering = {
		query: null,
		columns: []
	};

	FooTable.Filtering = FooTable.Component.extend(/** @lends FooTable.Filtering */{
		/**
		 * The filtering component adds a search input and column selector dropdown to the table allowing users to filter the using space delimited queries.
		 * @constructs
		 * @extends FooTable.Component
		 * @param {FooTable.Instance} instance - The parent {@link FooTable.Instance} object for the component.
		 * @returns {FooTable.Filtering}
		 */
		ctor: function (instance) {
			/**
			 * The timeout ID for the filter changed event.
			 * @instance
			 * @type {?number}
			 * @private
			 */
			this._filterTimeout = null;
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
			 * The jQuery object that of the column selector dropdown.
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
			// call the constructor of the base class
			this._super(instance);
		},
		/**
		 * Allows the filtering component to extend the {@link FooTable.Column} constructor.
		 * @instance
		 * @param {FooTable.Column} column - The column being constructed.
		 * @param {object} definition - The definition to populate the column with.
		 */
		ctor_column: function(column, definition){
			column.filterable = typeof definition.filterable == 'boolean' ? definition.filterable : true;
		},
		/**
		 * Initializes the filtering component for the plugin using the supplied table and options.
		 * @instance
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
			this.instance.raise('filtering_init');
		},
		/**
		 * Reinitializes the filtering component for the plugin using the supplied options.
		 * @instance
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
			this.instance.raise('filtering_reinit');
		},
		/**
		 * Destroys the filtering component removing any UI generated from the table.
		 * @instance
		 */
		destroy: function () {
			if (this.instance.options.filtering.enabled == false) return;
			var $thead = this.instance.$table.children('tfoot');
			$thead.children('.footable-filtering').remove();
			if ($thead.children().length == 0) $thead.remove();
		},
		/**
		 * Appends or updates any filtering specific properties on the {@link FooTable.RequestData} object.
		 * @instance
		 * @param {FooTable.RequestData} data - The {@link FooTable.RequestData} object about to passed to the {@link FooTable.Defaults#ajax} method.
		 */
		preajax: function(data){
			if (this.instance.options.filtering.enabled == false) return;
			data.filtering.query = this.instance.options.filtering.query;
			data.filtering.columns = this.instance.options.filtering.columns;
		},
		/**
		 * Performs the filtering of rows before they are appended to the page.
		 * @instance
		 */
		predraw: function(){
			if (this.instance.options.filtering.enabled == false || this.instance.options.ajaxEnabled == true
				|| this.instance.options.filtering.query == null || this.instance.options.filtering.query.length == 0)
				return;

			var self = this, i, text, len = self.instance.rows.array.length, remove = [];
			for (i = 0; i < len; i++){
				text = '';
				for (var j = 0, column; j < self.instance.options.filtering.columns.length; j++){
					column = self.instance.options.filtering.columns[j];
					text += ' ' + self.instance.rows.array[i].cells[column.index].display;
				}
				if (self._filtered(self.instance.options.filtering.query, text)){
					remove.push(i);
				}
			}
			remove.sort(function(a, b){ return a - b; });
			len = remove.length - 1;
			for (i = len; i >= 0; i--){
				self.instance.rows.array.splice(remove[i],1);
			}
		},
		/**
		 * As the rows are drawn by the {@link FooTable.Rows#draw} method this simply updates the colspan for the UI.
		 * @instance
		 */
		draw: function(){
			if (this.instance.options.filtering.enabled == false) return;
			this.$container.children().first().attr('colspan', this.instance.columns.colspan());
		},
		/**
		 * Sets the filtering options and calls the {@link FooTable.Instance#update} method to perform the actual filtering.
		 * @instance
		 */
		filter: function(){
			var self = this, $icon = self.$search_button.children('.glyphicon'), query = (self.$search_input.val() || '').replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
			if ($icon.hasClass('glyphicon-search')){
				$icon.removeClass('glyphicon-search').addClass('glyphicon-remove');
				self.instance.options.filtering.query = query;
				self.instance.options.filtering.columns = self.$dropdown.find('input:checked').map(function(){
					return $(this).data('footable_column');
				});
			} else {
				$icon.removeClass('glyphicon-remove').addClass('glyphicon-search');
				self.instance.options.filtering.query = null;
				self.instance.options.filtering.columns = [];
				self.$search_input.val(self.instance.options.filtering.query);
			}
			self.instance.update();
		},
		/**
		 * Generates the filtering UI from the supplied options.
		 * @instance
		 * @param {object} options - The options to use to generate the filtering UI.
		 * @private
		 */
		_generate: function (options) {
			var self = this;
			// parse the options into actual FooTable.Columns if they are names or indexes.
			for (var column, i = options.filtering.columns.length - 1; i > 0; i--) {
				column = self.instance.columns.getColumn(options.filtering.columns[i]);
				if (column != null) options.filtering.columns[i] = column;
				else options.filtering.columns.splice(i);
			}
			// if no options for filterable columns exists generate a default array using the column.filterable property.
			if (options.filtering.columns.length == 0) {
				options.filtering.columns = self.instance.columns.map(function (col) {
					return col.filterable ? col : null;
				});
			}
			// a a header if none exists
			if (self.instance.$table.children('thead').length == 0) self.instance.$table.prepend('<thead/>');
			// generate the cell that actually contains all the UI.
			var $cell = $('<th/>').attr('colspan', self.instance.columns.colspan());
			// add it to a row and then populate it with the search input and column selector dropdown.
			self.$container = $('<tr/>', {'class': 'footable-filtering'}).append($cell).prependTo(self.instance.$table.children('thead'));
			$('<div/>', {'class': 'input-group'})
				.append(
				(self.$search_input = $('<input/>', {type: 'text', 'class': 'form-control', placeholder: 'Search'}).on('keyup', { self: self }, self._onFilterChanged)),
				(self.$dropdown_container = $('<div/>', {'class': 'input-group-btn'})
					.append(
					(self.$search_button = $('<button/>', {type: 'button', 'class': 'btn btn-primary'}).on('click', { self: self }, self._onFilterClicked)
						.append($('<span/>', {'class': 'glyphicon glyphicon-search'}))),
					$('<button/>', {type: 'button', 'class': 'btn btn-default dropdown-toggle'}).on('click', { self: self }, self._onDropdownClicked)
						.append($('<span/>', {'class': 'caret'})),
					(self.$dropdown = $('<ul/>', {'class': 'dropdown-menu dropdown-menu-right'})
						.append(
						self.instance.columns.map(function (col) {
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
		 * Checks if the supplied text is filtered by the query.
		 * @instance
		 * @param {string} query - The query to filter by.
		 * @param {string} text - The text to check.
		 * @returns {boolean}
		 * @private
		 */
		_filtered: function(query, text){
			var queries = query.split(' '), count = queries.length;
			for (var i = 0, len = queries.length; i < len; i++){
				if (text.toUpperCase().indexOf(queries[i].toUpperCase()) >= 0) count--;
			}
			return count > 0;
		},
		/**
		 * Handles the change event for the {@link FooTable.Filtering#$search_input}.
		 * @instance
		 * @param {jQuery.Event} e - The event object for the event.
		 * @private
		 */
		_onFilterChanged: function (e) {
			e.preventDefault();
			var self = e.data.self;
			if (self._filterTimeout != null) clearTimeout(self._filterTimeout);
			self._filterTimeout = setTimeout(function(){
				self._filterTimeout = null;
				var $icon = self.$search_button.children('.glyphicon');
				if (e.which == 27){
					$icon.removeClass('glyphicon-search glyphicon-remove').addClass('glyphicon-remove');
				} else if ($icon.hasClass('glyphicon-remove')){
					$icon.removeClass('glyphicon-remove').addClass('glyphicon-search');
				}
				self.filter();
			}, self.instance.options.filtering.delay);
		},
		/**
		 * Handles the click event for the {@link FooTable.Filtering#$search_button}.
		 * @instance
		 * @param {jQuery.Event} e - The event object for the event.
		 * @private
		 */
		_onFilterClicked: function (e) {
			e.preventDefault();
			var self = e.data.self;
			if (self._filterTimeout != null) clearTimeout(self._filterTimeout);
			self.filter();
		},
		/**
		 * Handles the click event for the column checkboxes in the {@link FooTable.Filtering#$dropdown}.
		 * @instance
		 * @param {jQuery.Event} e - The event object for the event.
		 * @private
		 */
		_onColumnClicked: function (e) {
			var self = e.data.self;
			if (self._filterTimeout != null) clearTimeout(self._filterTimeout);
			self._filterTimeout = setTimeout(function(){
				self._filterTimeout = null;
				var $icon = self.$search_button.children('.glyphicon');
				if ($icon.hasClass('glyphicon-remove')){
					$icon.removeClass('glyphicon-remove').addClass('glyphicon-search');
					self.filter();
				}
			}, self.instance.options.filtering.delay);
		},
		/**
		 * Handles the click event for the {@link FooTable.Filtering#$dropdown} toggle.
		 * @instance
		 * @param {jQuery.Event} e - The event object for the event.
		 * @private
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
		 * @param {jQuery.Event} e - The event object for the event.
		 * @private
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

})(jQuery, FooTable = window.FooTable || {});