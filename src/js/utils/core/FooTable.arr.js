(function(F){
	var returnTrue = function(){ return true; };

	/**
	 * This namespace contains commonly used array utility methods.
	 * @namespace {object} FooTable.arr
	 */
	F.arr = {};

	/**
	 * Iterates over each item in the supplied array and performs the supplied function passing in the current item as the first argument.
	 * @memberof FooTable.arr
	 * @function each
	 * @param {Array} array - The array to iterate
	 * @param {function} func - The function to execute for each item. The first argument supplied to this function is the current item and the second is the current index.
	 */
	F.arr.each = function (array, func) {
		if (!F.is.array(array) || !F.is.fn(func)) return;
		for (var i = 0, len = array.length; i < len; i++) {
			if (func(array[i], i) === false) break;
		}
	};

	/**
	 * Get all items in the supplied array that optionally matches the supplied where function. If no items are found an empty array is returned.
	 * @memberof FooTable.arr
	 * @function get
	 * @param {Array} array - The array to get items from.
	 * @param {function} where - This function must return a boolean value, true includes the item in the result array.
	 * @returns {Array}
	 */
	F.arr.get = function (array, where) {
		var result = [];
		if (!F.is.array(array)) return result;
		if (!F.is.fn(where)) return array;
		for (var i = 0, len = array.length; i < len; i++) {
			if (where(array[i], i)) result.push(array[i]);
		}
		return result;
	};

	/**
	 * Get a boolean value indicating if any item exists in the supplied array that optionally matches the supplied where function.
	 * @memberof FooTable.arr
	 * @function any
	 * @param {Array} array - The array to check.
	 * @param {function} [where] - [Optional] This function must return a boolean value, true indicates that the current item is a valid match.
	 * @returns {boolean}
	 */
	F.arr.any = function (array, where) {
		if (!F.is.array(array)) return false;
		where = F.is.fn(where) ? where : returnTrue;
		for (var i = 0, len = array.length; i < len; i++) {
			if (where(array[i], i)) return true;
		}
		return false;
	};

	/**
	 * Checks if the supplied value exists in the array.
	 * @memberof FooTable.arr
	 * @function contains
	 * @param {Array} array - The array to check.
	 * @param {*} value - The value to check for.
	 * @returns {boolean}
	 */
	F.arr.contains = function(array, value){
		if (!F.is.array(array) || F.is.undef(value)) return false;
		for (var i = 0, len = array.length; i < len; i++) {
			if (array[i] == value) return true;
		}
		return false;
	};

	/**
	 * Get the first item in the supplied array that optionally matches the supplied where function. If no item is found null is returned.
	 * @memberof FooTable.arr
	 * @function first
	 * @param {Array} array - The array to get the item from.
	 * @param {function} [where] - [Optional] This function must return a boolean value, true indicates that the current item can be returned.
	 * @returns {(*|null)}
	 */
	F.arr.first = function (array, where) {
		if (!F.is.array(array)) return null;
		where = F.is.fn(where) ? where : returnTrue;
		for (var i = 0, len = array.length; i < len; i++) {
			if (where(array[i], i)) return array[i];
		}
		return null;
	};

	/**
	 * Creates a new array from the results of the supplied getter function. If no items are found an empty array is returned, to exclude an item from the results return null.
	 * @memberof FooTable.arr
	 * @function map
	 * @param {Array} array - The array to iterate.
	 * @param {function} getter - This function must return either a new value or null.
	 * The first argument is the result being returned at this point in the iteration. The second argument is the current item being iterated.
	 * @returns {(*|null)}
	 */
	F.arr.map = function (array, getter) {
		var result = [], returned = null;
		if (!F.is.array(array) || !F.is.fn(getter)) return result;
		for (var i = 0, len = array.length; i < len; i++) {
			if ((returned = getter(array[i], i)) != null) result.push(returned);
		}
		return result;
	};

	/**
	 * Removes items from the array matching the supplied where function. All removed items are returned in a new array.
	 * @memberof FooTable.arr
	 * @function remove
	 * @param {Array} array - The array to iterate and remove items from.
	 * @param {function} where - This function must return a boolean value, true includes the item in the result array.
	 * @returns {*}
	 */
	F.arr.remove = function (array, where) {
		var remove = [], removed = [];
		if (!F.is.array(array) || !F.is.fn(where)) return removed;
		var i = 0, len = array.length;
		for (; i < len; i++) {
			if (where(array[i], i, removed)){
				remove.push(i);
				removed.push(array[i]);
			}
		}
		// sort the indexes to be removed from largest to smallest
		remove.sort(function(a, b){ return b - a; });
		i = 0; len = remove.length;
		for(; i < len; i++){
			var index = remove[i] - i;
			array.splice(index, 1);
		}
		return removed;
	};

	/**
	 * Deletes a single item from the array. The item if removed is returned.
	 * @memberof FooTable.arr
	 * @function delete
	 * @param {Array} array - The array to iterate and delete the item from.
	 * @param {*} item - The item to find and delete.
	 * @returns {(*|null)}
	 */
	F.arr.delete = function(array, item){
		var remove = -1, removed = null;
		if (!F.is.array(array) || F.is.undef(item)) return removed;
		var i = 0, len = array.length;
		for (; i < len; i++) {
			if (array[i] == item){
				remove = i;
				removed = array[i];
				break;
			}
		}
		if (remove != -1) array.splice(remove, 1);
		return removed;
	};

	/**
	 * Replaces a single item in the array with a new one.
	 * @memberof FooTable.arr
	 * @function replace
	 * @param {Array} array - The array to iterate and replace the item in.
	 * @param {*} oldItem - The item to be replaced.
	 * @param {*} newItem - The item to be inserted.
	 */
	F.arr.replace = function(array, oldItem, newItem){
		var index = array.indexOf(oldItem);
		if (index !== -1) array[index] = newItem;
	};

})(FooTable);