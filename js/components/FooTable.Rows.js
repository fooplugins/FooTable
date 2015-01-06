(function ($, FooTable) {

	/**
	 * An array of JSON objects containing the row data.
	 * @type {Array.<object>}
	 * @default []
	 */
	FooTable.Defaults.prototype.rows = [];

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
			if (self.instance.$table.children('tbody').length == 0) self.instance.$table.append('<tbody/>');
			self.instance.$table.on('click.footable', '> tbody > tr:has(td > span.footable-toggle)', { self: self }, self._onToggleClicked);
			self._array = (self.instance.options.ajaxEnabled == false && self.instance.options.rows.length == 0)
				? self.fromDOM(self.instance.$table.children('tbody').get(0).rows)
				: self.fromJSON(options.rows);
			/**
			 * The rows_init event is raised after the body rows are parsed for rows data.
			 * @event FooTable.Columns#rows_init
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 * @param {Array.<FooTable.Row>} rows - The array of {@link FooTable.Row} objects parsed from the options and/or DOM.
			 */
			self.instance.raise('rows_init', [self._array]);
		},
		/**
		 * Reinitializes the rows class using the supplied options.
		 * @instance
		 * @param {object} options - The options the plugin was reinitialized with.
		 * @fires FooTable.Columns#rows_reinit
		 */
		reinit: function (options) {
			var self = this;
			if (self.instance.$table.children('tbody').length == 0) self.instance.$table.append('<tbody/>');
			self.instance.$table.off('click.footable', '> tbody > tr:has(td > span.footable-toggle)', self._onToggleClicked)
				.on('click.footable', '> tbody > tr:has(td > span.footable-toggle)', { self: self }, self._onToggleClicked);
			self._array = (self.instance.options.ajaxEnabled == false && self.instance.options.rows.length == 0)
				? self.fromDOM(self.instance.$table.children('tbody').get(0).rows)
				: self.fromJSON(options.rows);
			/**
			 * The rows_init event is raised after the body rows are parsed for rows data.
			 * @event FooTable.Columns#rows_init
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 * @param {Array.<FooTable.Row>} rows - The array of {@link FooTable.Row} objects parsed from the options and/or DOM.
			 */
			self.instance.raise('rows_init', [self._array]);
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
				row = new FooTable.Row(self.instance, rows[i], self.instance.columns.array);
				for (var j = 0, len2 = row.columns.length; j < len2; j++) {
					column = row.columns[j];
					cell = new FooTable.Cell(self.instance, row, rows[i].cells[column.index], column, column.parser(rows[i].cells[column.index]));
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
				row = new FooTable.Row(self.instance, document.createElement('tr'), self.instance.columns.array);
				for (var j = 0, len2 = row.columns.length; j < len2; j++) {
					column = row.columns[j];
					cell = new FooTable.Cell(self.instance, row, document.createElement('td'), column, rows[i][column.name]);
					row.cells.push(cell);
					row.$row.append(cell.$cell);
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
			this.restoreDetails();
			this.array = this._array.slice(0);
		},
		/**
		 * Performs the actual drawing of the table rows.
		 * @instance
		 */
		draw: function(){
			var self = this, $tbody = self.instance.$table.children('tbody');
			$tbody.find('> tr > td > span.footable-toggle').remove();
			// use detach to remove the rows to preserve jQuery data and any events.
			$tbody.children('tr').detach();

			// loop through the table and append the main rows
			for (var i = 0, len = self.array.length; i < len; i++){
				$tbody.append(self.array[i].$row);
			}

			if (!self.instance.columns.hasHidden()) return;

			// update or create details for any rows with the footable-detail-show class
			self.updateAllDetails();
			// add the row toggle to the first visible column
			var index = (self.instance.columns.first(function (col) { return !col.hidden; }) || {}).index;
			if (typeof index !== 'number') return;
			$tbody.find('> tr > td:nth-child(' + (index + 1) + '):not(tr.footable-detail-row > td, tr.footable-loader > td)').prepend($('<span/>', {'class': 'footable-toggle glyphicon glyphicon-plus'}));
		},
		/**
		 * Gets the detail row for the supplied row if one exists.
		 * @instance
		 * @param {HTMLTableRowElement} row - The row to retrieve the details for.
		 * @returns {(jQuery|null)}
		 */
		getDetail: function(row){
			var $row = $(row), $next;
			if ($row.hasClass('footable-detail-show')){
				$next = $row.next();
				if ($next.is('.footable-detail-row')) return $next;
			}
			return null;
		},
		/**
		 * Creates a new detail row for the supplied row.
		 * @instance
		 * @param {HTMLTableRowElement} row - The row to create the details for.
		 */
		createDetail: function(row){
			var self = this,
				data = $(row).get(0).__FooTable_Row__,
				hidden = $.map(data.cells, function(cell){
					return cell.column.hidden && cell.column.visible ? cell : null;
				}),
				colspan = self.instance.columns.colspan();

			if (hidden.length > 0 && !self.instance.raise('details_create', [ row, hidden, colspan ]).isDefaultPrevented()){
				var i, len, $tr, $th, $td,
					$cell = $('<td/>', { colspan: colspan }),
					$table = $('<table/>', { 'class': 'footable-details table table-bordered table-condensed table-hover' }).appendTo($cell),
					$tbody = $('<tbody/>').appendTo($table);

				for (i = 0, len = hidden.length; i < len; i++){
					$tr = $('<tr/>').data('footable_detail', hidden[i]).appendTo($tbody);
					$th = $('<th/>', { text: hidden[i].column.title }).appendTo($tr);
					$td = $('<td/>').appendTo($tr).append(hidden[i].$cell.contents());
				}
				data.$row.addClass('footable-detail-show').find('td > span.footable-toggle').removeClass('glyphicon-plus').addClass('glyphicon-minus');
				$('<tr/>', { 'class': 'footable-detail-row' }).append($cell).insertAfter(data.$row);
			}
		},
		/**
		 * Removes the details row from the supplied row if one exists.
		 * @instance
		 * @param {HTMLTableRowElement} row - The row to remove the details from.
		 */
		removeDetail: function(row){
			var self = this,
				data = $(row).get(0).__FooTable_Row__,
				$details = self.getDetail(data.$row.get(0)),
				$el;

			if ($details != null && !self.instance.raise('details_remove', [ row, $details.get(0) ]).isDefaultPrevented()){
				data.$row.removeClass('footable-detail-show').find('td > span.footable-toggle').removeClass('glyphicon-minus').addClass('glyphicon-plus');
				$details.children('td').first()
					.find('.footable-details > tbody > tr').each(function(i, el){
						$el = $(el);
						$el.data('footable_detail').$cell.append($el.children('td').first().contents());
					});
				$details.remove();
			}
		},
		/**
		 * Updates the detail row for the supplied row by removing and then recreating it.
		 * @instance
		 * @param {HTMLTableRowElement} row - The row to remove the details from.
		 */
		updateDetail: function(row){
			this.removeDetail(row);
			this.createDetail(row);
		},
		/**
		 * Updates all visible detail rows in the table.
		 * @instance
		 */
		updateAllDetails: function(){
			var self = this;
			self.instance.$table.children('tbody').children('tr.footable-detail-show').each(function(i, row){
				self.updateDetail(row);
			});
		},
		/**
		 * This method restores the detail row cells to there original row position but does not remove the expanded class.
		 * @instance
		 */
		restoreDetails: function(){
			var self = this, $detail, $el;
			self.instance.$table.children('tbody').children('tr.footable-detail-show').each(function () {
				$detail = $(this).next('tr.footable-detail-row');
				$detail.children('td').first()
					.find('.footable-details > tbody > tr').each(function (i, el) {
						$el = $(el);
						$el.data('footable_detail').$cell.append($el.children('td').first().contents());
					});
				$detail.remove();
			});
		},
		/**
		 * Handles the toggle click event for rows.
		 * @instance
		 * @param {jQuery.Event} e - The jQuery.Event object for the click event.
		 * @private
		 */
		_onToggleClicked: function (e) {
			var self = e.data.self;
			if (self.instance.columns.hasHidden() && $(e.target).is('tr,td')){ // only execute the toggle code if the event.target matches our check selector
				var row = $(this), hasDetail = row.hasClass('footable-detail-show');
				if (!self.instance.raise('rows_toggle_clicked', [ row, hasDetail ]).isDefaultPrevented()){
					if (hasDetail) self.removeDetail(row.get(0));
					else self.createDetail(row.get(0));
				}
			}
		}
	});

})(jQuery, FooTable = window.FooTable || {});