(function($, F){

	F.Editing = F.Component.extend(/** @lends FooTable.Editing */{
		/**
		 * The editing component adds a column with edit and delete buttons to each row as well as a single add row button in the footer.
		 * @constructs
		 * @extends FooTable.Component
		 * @param {FooTable.Table} table - The parent {@link FooTable.Table} object for the component.
		 * @returns {FooTable.Editing}
		 */
		construct: function(table){
			// call the base constructor
			this._super(table, table.o.editing.enabled);

			/**
			 * Whether or not to automatically page to a new row when it is added to the table.
			 * @type {boolean}
			 */
			this.pageToNew = table.o.editing.pageToNew;

			/**
			 * Whether or not the editing column and add row button are always visible.
			 * @type {boolean}
			 */
			this.alwaysShow = table.o.editing.alwaysShow;

			/**
			 * The options for the editing column. @see {@link FooTable.EditingColumn} for more info.
			 * @type {object}
			 * @prop {string} classes="footable-editing" - A space separated string of class names to apply to all cells in the column.
			 * @prop {string} name="editing" - The name of the column.
			 * @prop {string} title="" - The title displayed in the header row of the table for the column.
			 * @prop {boolean} filterable=false - Whether or not the column should be filterable when using the filtering component.
			 * @prop {boolean} sortable=false - Whether or not the column should be sortable when using the sorting component.
			 */
			this.column = $.extend(true, {}, table.o.editing.column, {visible: this.alwaysShow});

			/**
			 * The position of the editing column in the table as well as the alignment of the buttons.
			 * @type {string}
			 */
			this.position = table.o.editing.position;


			/**
			 * The text that appears in the show button. This can contain HTML.
			 * @type {string}
			 */
			this.showText = table.o.editing.showText;

			/**
			 * The text that appears in the hide button. This can contain HTML.
			 * @type {string}
			 */
			this.hideText = table.o.editing.hideText;

			/**
			 * The text that appears in the add button. This can contain HTML.
			 * @type {string}
			 */
			this.addText = table.o.editing.addText;

			/**
			 * The text that appears in the edit button. This can contain HTML.
			 * @type {string}
			 */
			this.editText = table.o.editing.editText;

			/**
			 * The text that appears in the delete button. This can contain HTML.
			 * @type {string}
			 */
			this.deleteText = table.o.editing.deleteText;

			/**
			 * This object is used to contain the callbacks for the add, edit and delete row buttons.
			 * @type {object}
			 * @prop {function} addRow
			 * @prop {function} editRow
			 * @prop {function} deleteRow
			 */
			this.callbacks = {
				addRow: F.checkFnValue(this, table.o.editing.addRow),
				editRow: F.checkFnValue(this, table.o.editing.editRow),
				deleteRow: F.checkFnValue(this, table.o.editing.deleteRow)
			};
		},
		/* PROTECTED */
		/**
		 * Checks the supplied data and options for the editing component.
		 * @instance
		 * @protected
		 * @param {object} data - The jQuery data object from the parent table.
		 * @fires FooTable.Editing#"preinit.ft.editing"
		 */
		preinit: function(data){
			var self = this;
			/**
			 * The preinit.ft.editing event is raised before the UI is created and provides the tables jQuery data object for additional options parsing.
			 * Calling preventDefault on this event will disable the component.
			 * @event FooTable.Editing#"preinit.ft.editing"
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Table} ft - The instance of the plugin raising the event.
			 * @param {object} data - The jQuery data object of the table raising the event.
			 */
			this.ft.raise('preinit.ft.editing', [data]).then(function(){
				if (self.ft.$el.hasClass('footable-editing'))
					self.enabled = true;

				self.enabled = F.is.boolean(data.editing)
					? data.editing
					: self.enabled;

				if (!self.enabled) return;

				self.pageToNew = F.is.boolean(data.editingPageToNew) ? data.editingPageToNew : self.pageToNew;

				self.alwaysShow = F.is.boolean(data.editingAlwaysShow) ? data.editingAlwaysShow : self.alwaysShow;

				self.position = F.is.string(data.editingPosition) ? data.editingPosition : self.position;

				self.showText = F.is.string(data.editingShowText) ? data.editingShowText : self.showText;

				self.hideText = F.is.string(data.editingHideText) ? data.editingHideText : self.hideText;

				self.addText = F.is.string(data.editingAddText) ? data.editingAddText : self.addText;

				self.editText = F.is.string(data.editingEditText) ? data.editingEditText : self.editText;

				self.deleteText = F.is.string(data.editingDeleteText) ? data.editingDeleteText : self.deleteText;

				self.column = new F.EditingColumn(self.ft, self, $.extend(true, {}, self.column, data.editingColumn, {visible: self.alwaysShow}));

				if (self.ft.$el.hasClass('footable-editing-left'))
					self.position = 'left';

				if (self.ft.$el.hasClass('footable-editing-right'))
					self.position = 'right';

				if (self.position === 'right'){
					self.column.index = self.ft.columns.array.length;
				} else {
					self.column.index = 0;
					for (var i = 0, len = self.ft.columns.array.length; i < len; i++){
						self.ft.columns.array[i].index += 1;
					}
				}
				self.ft.columns.array.push(self.column);
				self.ft.columns.array.sort(function(a, b){ return a.index - b.index; });

				self.callbacks.addRow = F.checkFnValue(self, data.editingAddRow, self.callbacks.addRow);
				self.callbacks.editRow = F.checkFnValue(self, data.editingEditRow, self.callbacks.editRow);
				self.callbacks.deleteRow = F.checkFnValue(self, data.editingDeleteRow, self.callbacks.deleteRow);
			}, function(){
				self.enabled = false;
			});
		},
		/**
		 * Initializes the editing component for the plugin using the supplied table and options.
		 * @instance
		 * @protected
		 * @fires FooTable.Editing#"init.ft.editing"
		 */
		init: function(){
			/**
			 * The init.ft.editing event is raised before its UI is generated.
			 * Calling preventDefault on this event will disable the component.
			 * @event FooTable.Editing#"init.ft.editing"
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Table} ft - The instance of the plugin raising the event.
			 */
			var self = this;
			this.ft.raise('init.ft.editing').then(function(){
				self.$create();
			}, function(){
				self.enabled = false;
			});
		},
		/**
		 * Destroys the editing component removing any UI generated from the table.
		 * @instance
		 * @protected
		 * @fires FooTable.Editing#"destroy.ft.editing"
		 */
		destroy: function () {
			/**
			 * The destroy.ft.editing event is raised before its UI is removed.
			 * Calling preventDefault on this event will prevent the component from being destroyed.
			 * @event FooTable.Editing#"destroy.ft.editing"
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Table} ft - The instance of the plugin raising the event.
			 */
			var self = this;
			this.ft.raise('destroy.ft.editing').then(function(){
				self.ft.$el.removeClass('footable-editing').off('click.ft.editing')
					.find('tfoot > tr.footable-editing').remove();
			});
		},
		/**
		 * Creates the editing UI from the current options setting the various jQuery properties of this component.
		 * @instance
		 * @protected
		 */
		$create: function(){
			var self = this, position = self.position === 'right' ? 'footable-editing-right' : 'footable-editing-left';
			self.ft.$el.addClass('footable-editing').addClass(position)
				.on('click.ft.editing', '.footable-show', {self: self}, self._onShowClick)
				.on('click.ft.editing', '.footable-hide', {self: self}, self._onHideClick)
				.on('click.ft.editing', '.footable-edit', {self: self}, self._onEditClick)
				.on('click.ft.editing', '.footable-delete', {self: self}, self._onDeleteClick)
				.on('click.ft.editing', '.footable-add', {self: self}, self._onAddClick);

			self.$cell = $('<td/>').attr('colspan', self.ft.columns.visibleColspan)
				.append(self.$buttonShow())
				.append(self.$buttonAdd())
				.append(self.$buttonHide());

			if (self.alwaysShow){
				self.ft.$el.addClass('footable-editing-always-show');
			}

			var $tfoot = self.ft.$el.children('tfoot');
			if ($tfoot.length == 0){
				$tfoot = $('<tfoot/>');
				self.ft.$el.append($tfoot);
			}
			self.$row = $('<tr/>', { 'class': 'footable-editing' }).append(self.$cell).appendTo($tfoot);
		},
		/**
		 * Creates the show button for the editing component.
		 * @instance
		 * @protected
		 * @returns {(string|HTMLElement|jQuery)}
		 */
		$buttonShow: function(){
			return '<button type="button" class="btn btn-primary footable-show">' + this.showText + '</button>';
		},
		/**
		 * Creates the hide button for the editing component.
		 * @instance
		 * @protected
		 * @returns {(string|HTMLElement|jQuery)}
		 */
		$buttonHide: function(){
			return '<button type="button" class="btn btn-default footable-hide">' + this.hideText + '</button>';
		},
		/**
		 * Creates the add button for the editing component.
		 * @instance
		 * @protected
		 * @returns {(string|HTMLElement|jQuery)}
		 */
		$buttonAdd: function(){
			return '<button type="button" class="btn btn-primary footable-add">' + this.addText + '</button> ';
		},
		/**
		 * Creates the edit button for the editing component.
		 * @instance
		 * @protected
		 * @returns {(string|HTMLElement|jQuery)}
		 */
		$buttonEdit: function(){
			return '<button type="button" class="btn btn-default footable-edit">' + this.editText + '</button> ';
		},
		/**
		 * Creates the delete button for the editing component.
		 * @instance
		 * @protected
		 * @returns {(string|HTMLElement|jQuery)}
		 */
		$buttonDelete: function(){
			return '<button type="button" class="btn btn-default footable-delete">' + this.deleteText + '</button>';
		},
		/**
		 * Creates the button group for the row buttons.
		 * @instance
		 * @protected
		 * @returns {(string|HTMLElement|jQuery)}
		 */
		$rowButtons: function(){
			return $('<div class="btn-group btn-group-xs" role="group"></div>')
				.append(this.$buttonEdit())
				.append(this.$buttonDelete());
		},
		/**
		 * Performs the drawing of the component.
		 */
		draw: function(){
			this.$cell.attr('colspan', this.ft.columns.visibleColspan);
		},
		/**
		 * Handles the edit button click event.
		 * @instance
		 * @private
		 * @param {jQuery.Event} e - The jQuery.Event object for the event.
		 * @fires FooTable.Editing#"edit.ft.editing"
		 */
		_onEditClick: function(e){
			e.preventDefault();
			var self = e.data.self, row = $(this).closest('tr').data('__FooTableRow__');
			if (row instanceof F.Row){
				/**
				 * The edit.ft.editing event is raised before its callback is executed.
				 * Calling preventDefault on this event will prevent the callback from being executed.
				 * @event FooTable.Editing#"edit.ft.editing"
				 * @param {jQuery.Event} e - The jQuery.Event object for the event.
				 * @param {FooTable.Table} ft - The instance of the plugin raising the event.
				 * @param {FooTable.Row} row - The row to be edited.
				 */
				self.ft.raise('edit.ft.editing', [row]).then(function(){
					self.callbacks.editRow.call(self.ft, row);
				});
			}
		},
		/**
		 * Handles the delete button click event.
		 * @instance
		 * @private
		 * @param {jQuery.Event} e - The jQuery.Event object for the event.
		 * @fires FooTable.Editing#"delete.ft.editing"
		 */
		_onDeleteClick: function(e){
			e.preventDefault();
			var self = e.data.self, row = $(this).closest('tr').data('__FooTableRow__');
			if (row instanceof F.Row){
				/**
				 * The delete.ft.editing event is raised before its callback is executed.
				 * Calling preventDefault on this event will prevent the callback from being executed.
				 * @event FooTable.Editing#"delete.ft.editing"
				 * @param {jQuery.Event} e - The jQuery.Event object for the event.
				 * @param {FooTable.Table} ft - The instance of the plugin raising the event.
				 * @param {FooTable.Row} row - The row to be deleted.
				 */
				self.ft.raise('delete.ft.editing', [row]).then(function(){
					self.callbacks.deleteRow.call(self.ft, row);
				});
			}
		},
		/**
		 * Handles the add button click event.
		 * @instance
		 * @private
		 * @param {jQuery.Event} e - The jQuery.Event object for the event.
		 * @fires FooTable.Editing#"add.ft.editing"
		 */
		_onAddClick: function(e){
			e.preventDefault();
			var self = e.data.self;
			/**
			 * The add.ft.editing event is raised before its callback is executed.
			 * Calling preventDefault on this event will prevent the callback from being executed.
			 * @event FooTable.Editing#"add.ft.editing"
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Table} ft - The instance of the plugin raising the event.
			 */
			self.ft.raise('add.ft.editing').then(function(){
				self.callbacks.addRow.call(self.ft);
			});
		},
		/**
		 * Handles the show button click event.
		 * @instance
		 * @private
		 * @param {jQuery.Event} e - The jQuery.Event object for the event.
		 * @fires FooTable.Editing#"show.ft.editing"
		 */
		_onShowClick: function(e){
			e.preventDefault();
			var self = e.data.self;
			/**
			 * The show.ft.editing event is raised before its callback is executed.
			 * Calling preventDefault on this event will prevent the callback from being executed.
			 * @event FooTable.Editing#"show.ft.editing"
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Table} ft - The instance of the plugin raising the event.
			 */
			self.ft.raise('show.ft.editing').then(function(){
				self.ft.$el.addClass('footable-editing-show');
				self.column.visible = true;
				self.ft.draw();
			});
		},
		/**
		 * Handles the hide button click event.
		 * @instance
		 * @private
		 * @param {jQuery.Event} e - The jQuery.Event object for the event.
		 * @fires FooTable.Editing#"show.ft.editing"
		 */
		_onHideClick: function(e){
			e.preventDefault();
			var self = e.data.self;
			/**
			 * The hide.ft.editing event is raised before its callback is executed.
			 * Calling preventDefault on this event will prevent the callback from being executed.
			 * @event FooTable.Editing#"hide.ft.editing"
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Table} ft - The instance of the plugin raising the event.
			 */
			self.ft.raise('hide.ft.editing').then(function(){
				self.ft.$el.removeClass('footable-editing-show');
				self.column.visible = false;
				self.ft.draw();
			});
		}
	});

	F.components.internal.register('editing', F.Editing, 4);

})(jQuery, FooTable);