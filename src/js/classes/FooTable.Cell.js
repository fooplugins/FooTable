(function($, F){

	F.Cell = F.Class.extend(/** @lends FooTable.Cell */{
		/**
		 * The cell class containing all the properties for cells.
		 * @constructs
		 * @extends FooTable.Class
		 * @param {FooTable.Table} table -  The root {@link FooTable.Table} this cell belongs to.
		 * @param {FooTable.Row} row - The parent {@link FooTable.Row} this cell belongs to.
		 * @param {FooTable.Column} column - The {@link FooTable.Column} this cell falls under.
		 * @param {(*|HTMLElement|jQuery)} valueOrElement - Either the value or the element for the cell.
		 * @returns {FooTable.Cell}
		 * @this FooTable.Cell
		 */
		construct: function (table, row, column, valueOrElement) {
			/**
			 * The root {@link FooTable.Table} for the cell.
			 * @instance
			 * @readonly
			 * @type {FooTable.Table}
			 */
			this.ft = table;
			/**
			 * The parent {@link FooTable.Row} for the cell.
			 * @instance
			 * @readonly
			 * @type {FooTable.Row}
			 */
			this.row = row;
			/**
			 * The {@link FooTable.Column} this cell falls under.
			 * @instance
			 * @readonly
			 * @type {FooTable.Column}
			 */
			this.column = column;
			this.created = false;
			this.define(valueOrElement);
		},
		/**
		 * This is supplied either the value or the cell element/jQuery object if it exists.
		 * If supplied the element we need set the $el property and parse the value from it.
		 * @instance
		 * @protected
		 * @param {(*|jQuery)} valueOrElement - The value or element to define the cell.
		 * @this FooTable.Cell
		 */
		define: function(valueOrElement){
			/**
			 * The jQuery table cell object this instance wraps.
			 * @instance
			 * @type {jQuery}
			 */
			this.$el = F.is.element(valueOrElement) || F.is.jq(valueOrElement) ? $(valueOrElement) : null;
			/**
			 * The jQuery row object that represents this cell in the details table.
			 * @type {jQuery}
			 */
			this.$detail = null;

			var hasOptions = F.is.hash(valueOrElement) && F.is.hash(valueOrElement.options) && F.is.defined(valueOrElement.value);

			/**
			 * The value of the cell.
			 * @instance
			 * @type {*}
			 */
			this.value = this.column.parser.call(this.column, F.is.jq(this.$el) ? this.$el : (hasOptions ? valueOrElement.value : valueOrElement), this.ft.o);

			/**
			 * Contains any options for the cell. These are the options supplied through the plugin constructor as part of the row object itself.
			 * @type {object}
			 */
			this.o = $.extend(true, {
				classes: null,
				style: null
			}, hasOptions ? valueOrElement.options : {});
			/**
			 * An array of CSS classes for the cell.
			 * @instance
			 * @protected
			 * @type {Array.<string>}
			 */
			this.classes = F.is.jq(this.$el) && this.$el.attr('class') ? this.$el.attr('class').match(/\S+/g) : (F.is.array(this.o.classes) ? this.o.classes : (F.is.string(this.o.classes) ? this.o.classes.match(/\S+/g) : []));
			/**
			 * The inline styles for the cell.
			 * @instance
			 * @protected
			 * @type {object}
			 */
			this.style = F.is.jq(this.$el) && this.$el.attr('style') ? F.css2json(this.$el.attr('style')) : (F.is.hash(this.o.style) ? this.o.style : (F.is.string(this.o.style) ? F.css2json(this.o.style) : {}));
		},
		/**
		 * After the cell has been defined this ensures that the $el and #detail properties are jQuery objects by either creating or updating them.
		 * @instance
		 * @protected
		 * @this FooTable.Cell
		 */
		$create: function(){
			if (this.created) return;
			(this.$el = F.is.jq(this.$el) ? this.$el : $('<td/>'))
				.data('value', this.value)
				.contents().detach().end()
				.append(this.format(this.value));

			this._setClasses(this.$el);
			this._setStyle(this.$el);

			this.$detail = $('<tr/>').addClass(this.row.classes.join(' '))
				.data('__FooTableCell__', this)
				.append($('<th/>'))
				.append($('<td/>'));

			this.created = true;
		},
		/**
		 * Collapses this cell and displays it in the details row.
		 * @instance
		 * @protected
		 */
		collapse: function(){
			if (!this.created) return;
			this.$detail.children('th').html(this.column.title);
			this.$el.clone()
				.attr('id', this.$el.attr('id') ? this.$el.attr('id') + '-detail' : undefined)
				.css('display', 'table-cell')
				.html('')
				.append(this.$el.contents().detach())
				.replaceAll(this.$detail.children('td').first());

			if (!F.is.jq(this.$detail.parent()))
				this.$detail.appendTo(this.row.$details.find('.footable-details > tbody'));
		},
		/**
		 * Restores this cell from a detail row back into the normal row.
		 * @instance
		 * @protected
		 */
		restore: function(){
			if (!this.created) return;
			if (F.is.jq(this.$detail.parent())){
				var $cell = this.$detail.children('td').first();
				this.$el
					.attr('class', $cell.attr('class'))
					.attr('style', $cell.attr('style'))
					.css('display', (this.column.hidden || !this.column.visible) ? 'none' : 'table-cell')
					.append($cell.contents().detach());
			}
			this.$detail.detach();
		},
		/**
		 * Helper method to call this cell's column parser function supplying the required parameters.
		 * @instance
		 * @protected
		 * @returns {*}
		 * @see FooTable.Column#parser
		 * @this FooTable.Cell
		 */
		parse: function(){
			return this.column.parser.call(this.column, this.$el, this.ft.o);
		},
		/**
		 * Helper method to call this cell's column formatter function using the supplied value and any additional required parameters.
		 * @instance
		 * @protected
		 * @param {*} value - The value to format.
		 * @returns {(string|HTMLElement|jQuery)}
		 * @see FooTable.Column#formatter
		 * @this FooTable.Cell
		 */
		format: function(value){
			return this.column.formatter.call(this.column, value, this.ft.o);
		},
		/**
		 * Allows easy access to getting or setting the cell's value. If the value is set all associated properties are also updated along with the actual element.
		 * Using this method also allows us to supply an object containing options and the value for the cell.
		 * @instance
		 * @param {*} [value] - The value to set for the cell. If not supplied the current value of the cell is returned.
		 * @param {boolean} [redraw=true] - Whether or not to redraw the row once the value has been set.
		 * @returns {(*|undefined)}
		 * @this FooTable.Cell
		 */
		val: function(value, redraw){
			if (F.is.undef(value)){
				// get
				return this.value;
			}
			// set
			var self = this, hasOptions = F.is.hash(value) && F.is.hash(value.options) && F.is.defined(value.value);
			this.o = $.extend(true, {
				classes: self.classes,
				style: self.style
			}, hasOptions ? value.options : {});

			this.value = hasOptions ? value.value : value;
			this.classes = F.is.array(this.o.classes) ? this.o.classes : (F.is.string(this.o.classes) ? this.o.classes.match(/\S+/g) : []);
			this.style = F.is.hash(this.o.style) ? this.o.style : (F.is.string(this.o.style) ? F.css2json(this.o.style) : {});

			if (this.created){
				this.$el.data('value', this.value).empty();

				var $detail = this.$detail.children('td').first().empty(),
					$target = F.is.jq(this.$detail.parent()) ? $detail : this.$el;

				$target.append(this.format(this.value));

				this._setClasses($target);
				this._setStyle($target);

				if (F.is.boolean(redraw) ? redraw : true) this.row.draw();
			}
		},
		_setClasses: function($el){
			var hasColClasses = !F.is.emptyArray(this.column.classes),
				hasClasses = !F.is.emptyArray(this.classes),
				classes = null;
			$el.removeAttr('class');
			if (!hasColClasses && !hasClasses) return;
			if (hasColClasses && hasClasses){
				classes = this.classes.concat(this.column.classes).join(' ');
			} else if (hasColClasses) {
				classes = this.column.classes.join(' ');
			} else if (hasClasses){
				classes = this.classes.join(' ');
			}
			if (!F.is.emptyString(classes)){
				$el.addClass(classes);
			}
		},
		_setStyle: function($el){
			var hasColStyle = !F.is.emptyObject(this.column.style),
				hasStyle = !F.is.emptyObject(this.style),
				style = null;
			$el.removeAttr('style');
			if (!hasColStyle && !hasStyle) return;
			if (hasColStyle && hasStyle){
				style = $.extend({}, this.column.style, this.style);
			} else if (hasColStyle) {
				style = this.column.style;
			} else if (hasStyle){
				style = this.style;
			}
			if (F.is.hash(style)){
				$el.css(style);
			}
		}
	});

})(jQuery, FooTable);