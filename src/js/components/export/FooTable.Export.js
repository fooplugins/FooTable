(function($, F){

	F.Export = F.Component.extend(/** @lends FooTable.Export */{
		/**
		 * @summary This component provides some basic export functionality.
		 * @memberof FooTable
		 * @constructs Export
		 * @param {FooTable.Table} table - The current instance of the plugin.
		 */
		construct: function(table){
			// call the constructor of the base class
			this._super(table, true);
			/**
			 * @summary A snapshot of the working set of rows prior to being trimmed by the paging component.
			 * @memberof FooTable.Export#
			 * @name snapshot
			 * @type {FooTable.Row[]}
			 */
			this.snapshot = [];
		},
		/**
		 * @summary Hooks into the predraw pipeline after sorting and filtering have taken place but prior to paging.
		 * @memberof FooTable.Export#
		 * @function predraw
		 * @description This method allows us to take a snapshot of the working set of rows before they are trimmed by the paging component and is called by the plugin instance.
		 */
		predraw: function(){
			this.snapshot = this.ft.rows.array.slice(0);
		},
		/**
		 * @summary Return the columns as simple JavaScript objects in an array.
		 * @memberof FooTable.Export#
		 * @function columns
		 * @returns {Object[]}
		 */
		columns: function(){
			var result = [];
			F.arr.each(this.ft.columns.array, function(column){
				result.push({
					type: column.type,
					name: column.name,
					title: column.title,
					visible: column.visible,
					hidden: column.hidden,
					classes: column.classes,
					style: column.style
				});
			});
			return result;
		},
		/**
		 * @summary Return the rows as simple JavaScript objects in an array.
		 * @memberof FooTable.Export#
		 * @function rows
		 * @param {boolean} [filtered=false] - Whether or not to exclude filtered rows from the result.
		 * @returns {Object[]}
		 */
		rows: function(filtered){
			filtered = F.is.boolean(filtered) ? filtered : false;
			var rows = filtered ? this.ft.rows.all : this.snapshot, result = [];
			F.arr.each(rows, function(row){
				result.push(row.val());
			});
			return result;
		},
		/**
		 * @summary Return the columns and rows as a properly formatted JSON object.
		 * @memberof FooTable.Export#
		 * @function json
		 * @param {boolean} [filtered=false] - Whether or not to exclude filtered rows from the result.
		 * @returns {Object}
		 */
		json: function(filtered){
			return JSON.parse(JSON.stringify({columns: this.columns(),rows: this.rows(filtered)}));
		},
		/**
		 * @summary Return the columns and rows as a properly formatted CSV value.
		 * @memberof FooTable.Export#
		 * @function csv
		 * @param {boolean} [filtered=false] - Whether or not to exclude filtered rows from the result.
		 * @returns {string}
		 */
		csv: function(filtered){
			var csv = "", columns = this.columns();
			F.arr.each(columns, function(column, i){
				csv += (i === 0 ? column.title : "," + column.title);
			});
			csv += "\n";
			F.arr.each(this.rows(filtered), function(row){
				F.arr.each(columns, function(column, i){
					csv += (i === 0 ? row[column.name] : "," + row[column.name]);
				});
				csv += "\n";
			});
			return csv;
		}
	});

	// register the component using a priority of 490 which falls just after filtering (500) and before paging (400).
	F.components.register("export", F.Export, 490);

})(jQuery, FooTable);