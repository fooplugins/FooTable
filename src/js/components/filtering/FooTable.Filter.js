(function(F){
	F.Filter = F.Class.extend(/** @lends FooTable.Filter */{
		/**
		 * The filter object contains the query to filter by and the columns to apply it to.
		 * @constructs
		 * @extends FooTable.Class
		 * @param {string} name - The name for the filter.
		 * @param {(string|FooTable.Query)} query - The query for the filter.
		 * @param {Array.<FooTable.Column>} columns - The columns to apply the query to.
		 * @param {string} [space="AND"] - How the query treats space chars.
		 * @param {boolean} [connectors=true] - Whether or not to replace phrase connectors (+.-_) with spaces.
		 * @param {boolean} [ignoreCase=true] - Whether or not ignore case when matching.
		 * @param {boolean} [hidden=true] - Whether or not this is a hidden filter.
		 * @returns {FooTable.Filter}
		 */
		construct: function(name, query, columns, space, connectors, ignoreCase, hidden){
			/**
			 * The name of the filter.
			 * @instance
			 * @type {string}
			 */
			this.name = name;
			/**
			 * A string specifying how the filter treats space characters. Can be either "OR" or "AND".
			 * @instance
			 * @type {string}
			 */
			this.space = F.is.string(space) && (space == 'OR' || space == 'AND') ? space : 'AND';
			/**
			 * Whether or not to replace phrase connectors (+.-_) with spaces before executing the query.
			 * @instance
			 * @type {boolean}
			 */
			this.connectors = F.is.boolean(connectors) ? connectors : true;
			/**
			 * Whether or not ignore case when matching.
			 * @instance
			 * @type {boolean}
			 */
			this.ignoreCase = F.is.boolean(ignoreCase) ? ignoreCase : true;
			/**
			 * Whether or not this is a hidden filter.
			 * @instance
			 * @type {boolean}
			 */
			this.hidden = F.is.boolean(hidden) ? hidden : false;
			/**
			 * The query for the filter.
			 * @instance
			 * @type {(string|FooTable.Query)}
			 */
			this.query = query instanceof F.Query ? query : new F.Query(query, this.space, this.connectors, this.ignoreCase);
			/**
			 * The columns to apply the query to.
			 * @instance
			 * @type {Array.<FooTable.Column>}
			 */
			this.columns = columns;
		},
		/**
		 * Checks if the current filter matches the supplied string.
		 * If the current query property is a string it will be auto converted to a {@link FooTable.Query} object to perform the match.
		 * @instance
		 * @param {string} str - The string to check.
		 * @returns {boolean}
		 */
		match: function(str){
			if (!F.is.string(str)) return false;
			if (F.is.string(this.query)){
				this.query = new F.Query(this.query, this.space, this.connectors, this.ignoreCase);
			}
			return this.query instanceof F.Query ? this.query.match(str) : false;
		},
		/**
		 * Checks if the current filter matches the supplied {@link FooTable.Row}.
		 * @instance
		 * @param {FooTable.Row} row - The row to check.
		 * @returns {boolean}
		 */
		matchRow: function(row){
			var self = this, text = F.arr.map(row.cells, function(cell){
				return F.arr.contains(self.columns, cell.column) ? cell.filterValue : null;
			}).join(' ');
			return self.match(text);
		}
	});

})(FooTable);