(function ($, FooTable) {

	/**
	 * An array of JSON objects containing the row data.
	 * @type {Array.<object>}
	 * @default []
	 */
	FooTable.Defaults.prototype.rows = [];

	/**
	 * A string to display when there are no rows in the table.
	 * @type {string}
	 * @default "No results"
	 */
	FooTable.Defaults.prototype.empty = 'No results';

	/**
	 * An array of JSON objects containing the row data.
	 * @type {Array.<object>}
	 * @default []
	 */
	FooTable.ResponseData.prototype.rows = [];

	FooTable.Rows = FooTable.Component.extend(/** @lends FooTable.Rows */{
		/**
		 * The rows class contains all the logic for handling rows.
		 * @constructs
		 * @extends FooTable.Component
		 * @param {FooTable.Instance} instance -  The parent {@link FooTable.Instance} this component belongs to.
		 * @returns {FooTable.Rows}
		 */
		ctor: function (instance) {
			/**
			 * This provides a shortcut to the {@link FooTable.Instance#options} object.
			 * @protected
			 * @type {FooTable.Instance#options}
			 */
			this.o = instance.options;
			/**
			 * An array of {@link FooTable.Row} objects created from parsing the options and/or DOM.
			 * @type {Array.<FooTable.Row>}
			 * @default []
			 */
			this.array = [];
			/**
			 * The {@link FooTable.Rows#array} member is populated with a shallow clone of this array prior to the predraw operation.
			 * @type {Array.<FooTable.Row>}
			 * @default []
			 * @private
			 */
			this._array = [];

			/**
			 * The jQuery object that contains the empty row control.
			 * @type {jQuery}
			 */
			this.$empty = null;

			// call the base class constructor
			this._super(instance);
		},
		/**
		 * Initializes the rows class using the supplied table and options.
		 * @instance
		 * @param {HTMLTableElement} table - The table element the plugin was initialized on.
		 * @param {object} options - The options the plugin was initialized with.
		 * @fires FooTable.Columns#rows_init
		 */
		init: function (table, options) {
			var self = this;
			self.$empty = $('<tr/>', { 'class': 'footable-empty' }).append($('<td/>').text(options.empty));
			if (self.ft.$table.children('tbody').length == 0) self.ft.$table.append('<tbody/>');
			self.ft.$table.on('click.footable', '> tbody > tr:has(td > span.footable-toggle)', { self: self }, self._onToggleClicked);
			self._array = (self.o.ajaxEnabled == false && self.o.rows.length == 0)
				? self.fromDOM(self.ft.$table.children('tbody').get(0).rows)
				: self.fromJSON(options.rows);
			/**
			 * The rows_init event is raised after the the rows are parsed from either the DOM or the options.
			 * @event FooTable.Columns#rows_init
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 * @param {Array.<FooTable.Row>} rows - The array of {@link FooTable.Row} objects parsed from the DOM or the options.
			 */
			self.ft.raise('rows_init', [self._array]);
		},
		/**
		 * Reinitializes the rows class using the supplied options.
		 * @instance
		 * @param {object} options - The options the plugin was reinitialized with.
		 * @fires FooTable.Columns#rows_reinit
		 */
		reinit: function (options) {
			var self = this;
			self.$empty = $('<tr/>', { 'class': 'footable-empty' }).append($('<td/>').text(options.empty));
			if (self.ft.$table.children('tbody').length == 0) self.ft.$table.append('<tbody/>');
			self.ft.$table.off('click.footable', '> tbody > tr:has(td > span.footable-toggle)', self._onToggleClicked)
				.on('click.footable', '> tbody > tr:has(td > span.footable-toggle)', { self: self }, self._onToggleClicked);
			self._array = (self.o.ajaxEnabled == false && self.o.rows.length == 0)
				? self.fromDOM(self.ft.$table.children('tbody').get(0).rows)
				: self.fromJSON(options.rows);
			/**
			 * The rows_reinit event is raised after the the rows are parsed from either the DOM or the options.
			 * @event FooTable.Columns#rows_reinit
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 * @param {Array.<FooTable.Row>} rows - The array of {@link FooTable.Row} objects parsed from the DOM or the options.
			 */
			self.ft.raise('rows_reinit', [self._array]);
		},
		/**
		 * Parses the supplied rows to produce an array of {@link FooTable.Row}s.
		 * @instance
		 * @param {Array.<HTMLTableRowElement>} rows - The rows of the table.
		 * @returns {Array.<FooTable.Row>}
		 */
		fromDOM: function (rows) {
			var self = this, _rows = [], row, cell, column;
			if (!rows) return _rows;
			for (var i = 0, len = rows.length; i < len; i++) {
				row = new FooTable.Row(self.ft, rows[i], self.ft.columns.array);
				for (var j = 0, len2 = row.columns.length; j < len2; j++) {
					column = row.columns[j];
					cell = new FooTable.Cell(self.ft, row, rows[i].cells[column.index], column, column.parser(rows[i].cells[column.index]));
					row.cells.push(cell);
				}
				_rows.push(row);
			}
			return _rows;
		},
		/**
		 * Parses the supplied JSON array of row objects to produce an array of {@link FooTable.Row}s.
		 * @instance
		 * @param {Array.<object>} rows - The JSON array of row objects for the table.
		 * @returns {Array.<FooTable.Row>}
		 */
		fromJSON: function (rows) {
			var self = this, _rows = [], row, cell, column;
			if (!rows) return _rows;
			for (var i = 0, len = rows.length; i < len; i++) {
				row = new FooTable.Row(self.ft, document.createElement('tr'), self.ft.columns.array);
				for (var j = 0, len2 = row.columns.length; j < len2; j++) {
					column = row.columns[j];
					cell = new FooTable.Cell(self.ft, row, document.createElement('td'), column, rows[i][column.name]);
					row.cells.push(cell);
					row.$el.append(cell.$el);
				}
				_rows.push(row);
			}
			return _rows;
		},
		/**
		 * Performs post ajax operations on the response object checking for rows to parse.
		 * @instance
		 * @param {object} response - The response object from the Ajax request.
		 */
		postajax: function (response) {
			this._array = this.fromJSON(response.rows);
		},
		/**
		 * Performs the predraw operations that are required including creating the shallow clone of the {@link FooTable.Rows#array} to work with.
		 * @instance
		 */
		predraw: function(){
			this.restore();
			this.array = this._array.slice(0);
		},
		/**
		 * Performs the actual drawing of the table rows.
		 * @instance
		 */
		draw: function(){
			var self = this, $tbody = self.ft.$table.children('tbody');
			self.$empty.detach();
			$tbody.find('> tr > td > span.footable-toggle').remove();
			// use detach to remove the rows to preserve jQuery data and any events.
			$tbody.children('tr').detach();

			// loop through the table and append the main rows
			for (var i = 0, len = self.array.length; i < len; i++){
				$tbody.append(self.array[i].$el);
			}
			if (self.array.length == 0){
				self.$empty.children('td').attr('colspan', self.ft.columns.colspan());
				$tbody.append(self.$empty);
			}

			if (!self.ft.columns.any(function(c){ return c.hidden && c.visible; })) return;

			// update or create details for any rows with the footable-detail-show class
			self.refresh();
			// add the row toggle to the first visible column
			var index = (self.ft.columns.first(function (c) { return !c.hidden && c.visible; }) || {}).index;
			if (typeof index !== 'number') return;
			$tbody.find('> tr > td:nth-child(' + (index + 1) + '):not(tr.footable-detail-row > td, tr.footable-loader > td)').prepend($('<span/>', {'class': 'footable-toggle glyphicon glyphicon-plus'}));
		},
		/**
		 * This method restores the detail row cells to there original row position but does not remove the expanded class.
		 * @instance
		 * @protected
		 */
		restore: function(){
			var self = this, $detail, $el;
			self.ft.$table.children('tbody').children('tr.footable-detail-row').each(function () {
				$detail = $(this);
				$detail.children('td').first()
					.find('.footable-details > tbody > tr').each(function (i, el) {
						$el = $(el);
						$el.data('footable_detail').$el.append($el.children('td').first().contents());
					});
				$detail.remove();
			});
		},
		/**
		 * Gets the detail row for the supplied row if one exists.
		 * @instance
		 * @param {HTMLTableRowElement} row - The row to retrieve the details for.
		 * @returns {(jQuery|null)}
		 */
		details: function(row){
			var $row = $(row), $next;
			if ($row.hasClass('footable-detail-show')){
				$next = $row.next();
				if ($next.is('.footable-detail-row')) return $next;
			}
			return null;
		},
		/**
		 * Displays the details for the supplied row.
		 * @instance
		 * @param {HTMLTableRowElement} row - The row to display the details for.
		 */
		expand: function(row){
			var self = this,
				data = $(row).data('__FooTableRow__'),
				hidden = $.map(data.cells, function(cell){
					return cell.column.hidden && cell.column.visible ? cell : null;
				});

			if (hidden.length > 0){
				var i, len, $tr, $th, $td,
					$cell = $('<td/>', { colspan: self.ft.columns.colspan() }),
					$table = $('<table/>', { 'class': 'footable-details table table-bordered table-condensed table-hover' }).appendTo($cell),
					$tbody = $('<tbody/>').appendTo($table);

				for (i = 0, len = hidden.length; i < len; i++){
					$tr = $('<tr/>').data('footable_detail', hidden[i]).appendTo($tbody);
					$th = $('<th/>', { text: hidden[i].column.title }).appendTo($tr);
					$td = $('<td/>').appendTo($tr).append(hidden[i].$el.contents());
				}
				data.$el.addClass('footable-detail-show').find('td > span.footable-toggle').removeClass('glyphicon-plus').addClass('glyphicon-minus');
				$('<tr/>', { 'class': 'footable-detail-row' }).append($cell).insertAfter(data.$el);
			}
		},
		/**
		 * Hides the details for the supplied row.
		 * @instance
		 * @param {HTMLTableRowElement} row - The row to hide the details on.
		 */
		collapse: function(row){
			var self = this,
				data = $(row).data('__FooTableRow__'),
				$details = self.details(data.$el.get(0)),
				$el;

			if ($details != null){
				data.$el.removeClass('footable-detail-show').find('td > span.footable-toggle').removeClass('glyphicon-minus').addClass('glyphicon-plus');
				$details.children('td').first()
					.find('.footable-details > tbody > tr').each(function(i, el){
						$el = $(el);
						$el.data('footable_detail').$el.append($el.children('td').first().contents());
					});
				$details.remove();
			}
		},
		/**
		 * Refresh the details for all active rows or for a single specified row.
		 * @instance
		 * @param {HTMLTableRowElement} [row] - A specific row to refresh the details for.
		 */
		refresh: function(row){
			var self = this;
			if (FooTable.is.undef(row)){
				self.ft.$table.children('tbody').children('tr.footable-detail-show').each(function(i, row){
					self.collapse(row);
					self.expand(row);
				});
			} else {
				self.collapse(row);
				self.expand(row);
			}
		},
		/**
		 * Handles the toggle click event for rows.
		 * @instance
		 * @param {jQuery.Event} e - The jQuery.Event object for the click event.
		 * @private
		 */
		_onToggleClicked: function (e) {
			var self = e.data.self;
			if (self.ft.columns.any(function(c){ return c.hidden && c.visible; }) && $(e.target).is('tr,td,span.footable-toggle')){ // only execute the toggle code if the event.target matches our check selector
				var $row = $(this), exists = $row.hasClass('footable-detail-show');
				if (exists) self.collapse($row.get(0));
				else self.expand($row.get(0));
			}
		}
	});

})(jQuery, FooTable = window.FooTable || {});