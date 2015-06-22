// This is just a little script to auto generate row data and imitate an ajax request to a server.
(function($, FAjax){
	var firstNames = ['Elodia', 'Sephnie', 'Maxine', 'Claudine', 'Londa', 'Gwyn', 'Consuelo', 'Mariko', 'Lashanda', 'Jesusa', 'Bernie', 'Annamaria', 'Muriel', 'Nikia', 'Margene', 'Lorraine', 'Annemarie', 'Rayna', 'Anonina', 'Carie', 'Gran', 'Jua', 'Jacqulyn', 'Whiney', 'Renaa', 'Usha', 'Annea', 'Jack', 'Chun', 'Eddy', 'Isidra', 'Myesha', 'Ami', 'Easer', 'Karon', 'Granville', 'Maria', 'Shenia', 'Solomon', 'Marquia', 'Charles', 'Neie', 'Beariz', 'Humbero', 'Rigobero', 'Lamon', 'Rivka', 'Phoebe', 'Renea', 'Celia', 'Shay', 'Sanford', 'Gwen', 'Lizzee', 'Lucila', 'Alice', 'Lauri', 'Desmond', 'Raeann', 'Rona', 'Jason', 'Lilian', 'Karena', 'Dennise', 'Delana', 'Rheba', 'Doy', 'Dolly', 'Venice', 'Dalene', 'Cyndy', 'Ilona', 'Lakeshia', 'Laurena', 'Lorriane', 'Kaci', 'Velve', 'Maple', 'Maire', 'Marline', 'Bar', 'Nelly', 'Shona', 'Karole', 'Judi', 'Ardelia', 'Alonzo', 'Junie', 'Alvina', 'Ilda'];
	var lastNames = ['Ortego', 'Landa', 'Piermarini', 'Valles', 'Lusher', 'Branco', 'Falls', 'Hallett', 'Nicley', 'Cambareri', 'Han', 'Edwin', 'Lan', 'Dauenhauer', 'Cerrone', 'Matsumura', 'Mosher', 'Dragoo', 'Robare', 'Judon', 'Kyger', 'Bonk', 'Mcgaughy', 'Mcfetridge', 'Maxton', 'Roling', 'Klotz', 'Boudreaux', 'Hayton', 'Leonardo', 'Schug', 'Dewitt', 'Wohlwend', 'Hoos', 'Pennock', 'Sprinkle', 'Weick', 'Gilliland', 'Resler', 'Badgett', 'Bittinger', 'Letts', 'Bottom', 'Hibler', 'Fuhrman', 'Lewis', 'Moudy', 'Goyette', 'Difranco', 'Kyles', 'Sluss', 'Bruening', 'Halladay', 'Leinen', 'Leister', 'Morgado', 'Wadkins', 'Yingst', 'Hyland', 'Carasco', 'Stever', 'Weisz', 'Woldt', 'Leak', 'Sinclair', 'Heinen', 'Furniss', 'Hosler', 'Shumpert', 'Keasler', 'Stgelais', 'Landers', 'Hogle', 'Ates', 'Vanatta', 'Goodlow', 'Haner', 'Yaple', 'Lamark', 'Cataldo', 'Smelcer', 'Marco', 'Quaranta', 'Cooke', 'Ardrey', 'Guilford', 'Polo', 'Sprouse', 'Gaffney', 'Lafromboise'];
	var jobTitles = ['Language Translator', 'Propeller-Driven Airplane Mechanic', 'Work Ticket Distributor', 'Pipe Organ Technician', 'LAN Systems Administrator', 'Employment Clerk', 'Electrical Lineworker', 'Serials Librarian', 'Technical Services Librarian', 'Blackjack Supervisor', 'Pulpwood Cutter', 'Military Science Teacher', 'Missile Pad Mechanic', 'Psychology Professor', 'Scene and Lighting Design Lecturer', 'Internet Marketing Manager', 'Business Services Sales Representative', 'Assistant Corporation Counsel', 'Photocopying Equipment Repairer', 'Post-Anesthesia Care Unit Nurse', 'Animal Husbandry Manager', 'Electrical Engineering Director', 'Drag Car Racer', 'Auto Detailer', 'Childrens Pastor', 'Strawberry Sorter', 'Geophysicist', 'Financial Accountant', 'Crown and Bridge Technician', 'Jig Bore Tool Maker', 'Union Representative', 'High School Librarian', 'High School History Teacher', 'Beveling and Edging Machine Operator', 'Roller Skater', 'Wallpaperer Helper', 'Childcare Center Administrator', 'Ordnance Engineer', 'Industrial Waste Treatment Technician', 'Airline Transport Pilot', 'Window Trimmer', 'Garment Presser', 'State Archivist', 'Die Designer', 'Ventriloquist', 'Calculus Professor', 'Technical Writer', 'Meat Packager', 'Automobile Body Painter', 'Aircraft Landing Gear Inspector', 'Fashion Designer', 'Drywall Stripper', 'Clown', 'National Association for Stock Car Auto Racing Driver', 'Staff Electronic Warfare Officer', 'Hydroelectric Machinery Mechanic', 'Clinical Services Director', 'Traffic Court Referee', 'Internal Medicine Nurse Practitioner', 'Horticulture Instructor', 'Ships Electronic Warfare Officer', 'Broadcast Maintenance Engineer', 'Weight Training Instructor', 'Potato Sorter', 'Appliance Parts Counter Clerk', 'Body Shop Supervisor', 'Accounts Collector', 'Commercial Lender', 'Scale Clerk', 'Obstetrician/Gynecologist', 'Gaming Cage Cashier', 'Fresco Artist', 'Youth Pastor', 'Parachute Officer', 'Geophysical Engineer', 'Route Sales Person', 'Master of Ceremonies', 'Cloak Room Attendant', 'Gas Main Fitter', 'Religious Activities Director', 'Hemodialysis Technician', 'Telephone Lines Repairer', 'Periodontist', 'Wood Fence Installer', 'Offbearer', 'Aviation Tactical Readiness Officer', 'Biology Laboratory Assistant', 'Emergency Room Orderly', 'Magician', 'Dog Trainer'];
	var statuses = [{ 'name': 'Active', 'value': 1 }, { 'name': 'Disabled', 'value': 2 }, { 'name': 'Suspended', 'value': 3 }];
	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	function randomDate(start, end) {
		return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
	}

	FAjax.createRows = function(count){
		var rows = [];
		for (var i = 0; i < count; i++){
			rows.push({
				id: i + 1,
				firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
				lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
				something: randomDate(new Date(2010, 0, 1), new Date(2014, 0, 1)).getTime(),
				jobTitle: jobTitles[Math.floor(Math.random() * jobTitles.length)],
				started: randomDate(new Date(2010, 0, 1), new Date(2014, 0, 1)).getTime(),
				dob: randomDate(new Date(1960, 0, 1), new Date(1994, 0, 1)).getTime()
			});
		}
		return rows;
	};

	FAjax.defaults = {
		delay: 1500,
		columns: {
			0: { name: 'id', title: 'ID', width: 80, type: 'number' },
			1: { name: 'firstName', title: 'First Name', sorted: true, direction: 'ASC' },
			2: { name: 'lastName', title: 'Last Name', hide: 'phone' },
			3: { name: 'something', title: 'Something', hide: 'all', visible: false },
			4: { name: 'jobTitle', title: 'Job Title', hide: 'phone', maxWidth: 200, ellipsis: true },
			5: { name: 'started', title: 'Started', hide: 'phone tablet', sortable: false, formatter: function(value){
				if (typeof value == "number") value = new Date(value);
				return value instanceof Date ? months[value.getMonth()] + ' ' + value.getFullYear() : null;
			}},
			6: { name: 'dob', title: 'DOB', hide: 'phone tablet', formatter: function(value){
				if (typeof value == "number") value = new Date(value);
				return value instanceof Date ? value.getDate() + ' ' + months[value.getMonth()] + ' ' + value.getFullYear() : null;
			}}
		},
		rows: FAjax.createRows(1000),
		sorters: {
			text: function (a, b) {
				if (typeof(a) === 'string') { a = a.toLowerCase(); }
				if (typeof(b) === 'string') { b = b.toLowerCase(); }
				if (a === b) return 0;
				if (a < b) return -1;
				return 1;
			},
			number: function (a, b) {
				return a - b;
			}
		}
	};

	FAjax.getColumn = function(name){
		for (var i in FAjax.defaults.columns){
			if (FAjax.defaults.columns.hasOwnProperty(i) && FAjax.defaults.columns[i].name == name) return FAjax.defaults.columns[i];
		}
		return {};
	};

	FAjax.writeColumns = function(){
		var row = '<tr>';
		for (var i in FAjax.defaults.columns){
			if (!FAjax.defaults.columns.hasOwnProperty(i)) continue;
			var col = FAjax.defaults.columns[i];
			row += '<th';
			for (var attr in col){
				if (!col.hasOwnProperty(attr) || $.isFunction(col[attr])) continue;
				row += ' data-' + attr.replace(/(.)([A-Z])/, function(m, $1, $2){ return $1 + '-' + $2.toLowerCase(); }) + '="' + col[attr] + '"';
			}
			row += '>' + (col.title || col.name.replace(/(.)([A-Z])/, "$1 $2").replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); })) + '</th>';
		}
		row += '</tr>';
		document.write(row);
	};

	FAjax.writeRows = function(){
		for (var i = 0; i < FAjax.defaults.rows.length; i++){
			var data = FAjax.defaults.rows[i],
				row = '<tr>';
			row += '<td>' + data.id + '</td>';
			row += '<td>' + data.firstName + '</td>';
			row += '<td>' + data.lastName + '</td>';
			row += '<td>' + data.something + '</td>';
			row += '<td>' + data.jobTitle + '</td>';
			row += '<td data-value="' + data.started + '">' + FAjax.defaults.columns['5'].formatter(data.started) + '</td>';
			row += '<td data-value="' + data.dob + '">' + FAjax.defaults.columns['6'].formatter(data.dob) + '</td>';
			row += '</tr>';
			document.write(row);
		}
	};

	FAjax.isFiltered = function(query, text){
		var queries = query.split(' '), count = queries.length;
		for (var i = 0, len = queries.length; i < len; i++){
			if (text.toUpperCase().indexOf(queries[i].toUpperCase()) >= 0) count--;
		}
		return count > 0;
	};

	FAjax.request = function(data){
		return $.Deferred(function(d){
			setTimeout(function(){
				var rows = JSON.parse(JSON.stringify(FAjax.defaults.rows));
				if (data.filterQuery && data.filterColumns){
					var i, text, len = rows.length, remove = [];
					for (i = 0; i < len; i++){
						text = '';
						for (var j = 0, column, name; j < data.filterColumns.length; j++){
							name = data.filterColumns[j];
							column = FAjax.getColumn(name);
							text += ' ' + ($.isFunction(column.formatter) ? column.formatter(rows[i][name]) + '' : rows[i][name] + '');
						}
						if (FAjax.isFiltered(data.filterQuery, text)){
							remove.push(i);
						}
					}
					remove.sort(function(a, b){ return a - b; });
					len = remove.length - 1;
					for (i = len; i >= 0; i--){
						rows.splice(remove[i],1);
					}
				}
				if (data.sortColumn && data.sortDirection){
					var col = FAjax.getColumn(data.sortColumn),
						sorter = $.isFunction(FAjax.defaults.sorters[col.type]) ? FAjax.defaults.sorters[col.type] : FAjax.defaults.sorters.text;
					rows.sort(function(a, b){
						return data.sortDirection == 'ASC'
							? sorter(a[data.sortColumn], b[data.sortColumn])
							: sorter(b[data.sortColumn], a[data.sortColumn]);
					});
				}
				var total = rows.length, result = {};
				if (data.currentPage && data.pageSize){
					var start = (data.currentPage - 1) * data.pageSize,
						end = data.currentPage * data.pageSize > rows.length ? rows.length - 1 : data.currentPage * data.pageSize;

					if (total > data.pageSize) rows = rows.slice(start, end);
					result.totalRows = total;
				}
				result.rows = rows;
				d.resolve(result);
			}, FAjax.defaults.delay);
		});
	};

})(jQuery, window.FAjax = window.FAjax || {});