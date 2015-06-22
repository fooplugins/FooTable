'use strict';

module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			files: ['dist']
		},
		concat: {
			js: {
				src: [
					"js/FooTable.js",
					"js/FooTable.is.js",
					"js/FooTable.strings.js",
					"js/objects/FooTable.Class.js",
					"js/objects/FooTable.Component.js",
					"js/objects/FooTable.Defaults.js",
					"js/objects/FooTable.Breakpoint.js",
					"js/objects/FooTable.Cell.js",
					"js/objects/FooTable.Column.js",
					"js/objects/FooTable.Row.js",
					"js/objects/FooTable.Filter.js",
					"js/objects/FooTable.Sorter.js",
					"js/objects/FooTable.Pager.js",
					"js/components/FooTable.Instance.js",
					"js/components/FooTable.Columns.js",
					"js/components/FooTable.Rows.js",
					"js/components/FooTable.Breakpoints.js",
					"js/components/core/FooTable.Filtering.js",
					"js/components/core/FooTable.Paging.js",
					"js/components/core/FooTable.Sorting.js"
				],
				dest: "dist/footable.js"
			},
			css: {
				src: [
					"css/bootstrap/FooTable.css",
					"css/bootstrap/components/FooTable.Sorting.css",
					"css/bootstrap/components/FooTable.Paging.css",
					"css/bootstrap/components/FooTable.Filtering.css"
				],
				dest: "dist/footable.bootstrap.css"
			}
		},
		uglify: {
			prod: {
				options: {
					preserveComments: 'some',
					mangle: {
						except: [ "undefined" ]
					}
				},
				files: {
					'dist/footable.min.js': [ "dist/footable.js" ]
				}
			}
		},
		cssmin: {
			minify: {
				files: {
					'dist/footable.bootstrap.min.css': [ "dist/footable.bootstrap.css" ]
				}
			}
		}
	});

	// Load grunt tasks
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.registerTask('default', ['clean', 'concat', 'uglify', 'cssmin']);
};
