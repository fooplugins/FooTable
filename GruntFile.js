'use strict';

module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			pre: [
				'compiled',
				'releases/*.v<%= pkg.version %>.zip'
			],
			jsdoc: ['docs/jsdocs']
		},
		concat: {
			core_js: {
				src: [
					"src/js/FooTable.js",
					"src/js/utils/core/*.js",
					"src/js/utils/*.js",
					"src/js/classes/*.js",
					"src/js/classes/columns/*.js",
					"src/js/components/FooTable.Component.js",
					"src/js/components/internal/**/*.js"
				],
				dest: "compiled/footable.core.js"
			},
			core_standalone_css: {
				src: [
					"src/css/FooTable.NoBootstrap.css",
					"src/css/FooTable.css",
					"src/css/FooTable.FontAwesome.css"
				],
				dest: "compiled/footable.core.standalone.css"
			},
			core_bootstrap_css: {
				src: [
					"src/css/FooTable.css",
					"src/css/FooTable.Glyphicons.css"
				],
				dest: "compiled/footable.core.bootstrap.css"
			},
			filtering_js: {
				src: [
					"src/js/components/core/filtering/**/*.js"
				],
				dest: "compiled/footable.filtering.js"
			},
			filtering_css: {
				src: [
					"src/css/components/FooTable.Filtering.css"
				],
				dest: "compiled/footable.filtering.css"
			},
			sorting_js: {
				src: [
					"src/js/components/core/sorting/**/*.js"
				],
				dest: "compiled/footable.sorting.js"
			},
			sorting_css: {
				src: [
					"src/css/components/FooTable.Sorting.css"
				],
				dest: "compiled/footable.sorting.css"
			},
			paging_js: {
				src: [
					"src/js/components/core/paging/**/*.js"
				],
				dest: "compiled/footable.paging.js"
			},
			paging_css: {
				src: [
					"src/css/components/FooTable.Paging.css"
				],
				dest: "compiled/footable.paging.css"
			},
			all_js: {
				src: [
					"compiled/footable.core.js",
					"compiled/footable.filtering.js",
					"compiled/footable.sorting.js",
					"compiled/footable.paging.js"
				],
				dest: "compiled/footable.js"
			},
			standalone_css: {
				src: [
					"compiled/footable.core.standalone.css",
					"compiled/footable.filtering.css",
					"compiled/footable.sorting.css",
					"compiled/footable.paging.css"
				],
				dest: "compiled/footable.standalone.css"
			},
			bootstrap_css: {
				src: [
					"compiled/footable.core.bootstrap.css",
					"compiled/footable.filtering.css",
					"compiled/footable.sorting.css",
					"compiled/footable.paging.css"
				],
				dest: "compiled/footable.bootstrap.css"
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
					'compiled/footable.min.js': [ "compiled/footable.js" ],
					'compiled/footable.core.min.js': [ "compiled/footable.core.js" ],
					'compiled/footable.filtering.min.js': [ "compiled/footable.filtering.js" ],
					'compiled/footable.sorting.min.js': [ "compiled/footable.sorting.js" ],
					'compiled/footable.paging.min.js': [ "compiled/footable.paging.js" ]
				}
			}
		},
		cssmin: {
			minify: {
				files: {
					'compiled/footable.standalone.min.css': [ "compiled/footable.standalone.css" ],
					'compiled/footable.bootstrap.min.css': [ "compiled/footable.bootstrap.css" ],
					'compiled/footable.filtering.min.css': [ "compiled/footable.filtering.css" ],
					'compiled/footable.sorting.min.css': [ "compiled/footable.sorting.css" ],
					'compiled/footable.paging.min.css': [ "compiled/footable.paging.css" ]
				}
			}
		},
		compress: {
			bootstrap: {
				options: {
					archive: 'releases/footable-bootstrap.v<%= pkg.version %>.zip'
				},
				files: [{
					expand: true,
					cwd: 'compiled/',
					src: [
						'footable.bootstrap.css',
						'footable.bootstrap.min.css'
					],
					dest: 'css/'
				},{
					expand: true,
					cwd: 'compiled/',
					src: [
						'footable.js',
						'footable.min.js'
					],
					dest: 'js/'
				}]
			},
			standalone: {
				options: {
					archive: 'releases/footable-standalone.v<%= pkg.version %>.zip'
				},
				files: [{
					expand: true,
					cwd: 'compiled/',
					src: [
						'footable.standalone.css',
						'footable.standalone.min.css'
					],
					dest: 'css/'
				},{
					expand: true,
					cwd: 'compiled/',
					src: [
						'footable.js',
						'footable.min.js'
					],
					dest: 'js/'
				}]
			},
			components: {
				options: {
					archive: 'releases/footable-components.v<%= pkg.version %>.zip'
				},
				files: [{
					expand: true,
					cwd: 'compiled/',
					src: [
						'footable.core.bootstrap.css',
						'footable.core.bootstrap.min.css',
						'footable.core.standalone.css',
						'footable.core.standalone.min.css',
						'footable.filtering.css',
						'footable.filtering.min.css',
						'footable.paging.css',
						'footable.paging.min.css',
						'footable.sorting.css',
						'footable.sorting.min.css'
					],
					dest: 'css/'
				},{
					expand: true,
					cwd: 'compiled/',
					src: [
						'footable.core.js',
						'footable.core.min.js',
						'footable.filtering.js',
						'footable.filtering.min.js',
						'footable.paging.js',
						'footable.paging.min.js',
						'footable.sorting.js',
						'footable.sorting.min.js'
					],
					dest: 'js/'
				}]
			}
		},
		jsdoc: {
			dist: {
				src: ['src/js/**/*.js'],
				options: {
					destination: 'docs/jsdocs',
					configure: 'jsdoc.json'
				}
			}
		}
	});

	// Load grunt tasks
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-jsdoc');
	grunt.registerTask('default', ['clean:pre', 'concat', 'uglify', 'cssmin', 'compress']);
	grunt.registerTask('jsdocs', ['clean:jsdoc','jsdoc']);
};
