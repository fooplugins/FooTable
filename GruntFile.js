'use strict';

module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			compiled: ['compiled'],
			releases: [
				'releases/*.v<%= pkg.version %>.zip',
				'releases/latest.zip'
			],
			jsdoc: ['docs/jsdocs']
		},
		concat: {
			options: {
				stripBanners: true,
				banner: '/*\n' +
				'* <%= pkg.title %> - <%= pkg.description %>\n' +
				'* @version <%= pkg.version %>\n' +
				'* @link <%= pkg.homepage %>\n' +
				'* @copyright Steven Usher & Brad Vincent 2015\n' +
				'* @license Released under the GPLv3 license.\n' +
				'*/\n'
			},
			core_js: {
				src: [
					"src/js/FooTable.js",
					"src/js/utils/core/*.js",
					"src/js/utils/*.js",
					"src/js/classes/*.js",
					"src/js/classes/columns/*.js",
					"src/js/components/breakpoints/**/*.js",
					"src/js/components/columns/**/*.js",
					"src/js/components/rows/**/*.js"
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
					"src/js/components/filtering/**/*.js"
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
					"src/js/components/sorting/**/*.js"
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
					"src/js/components/paging/**/*.js"
				],
				dest: "compiled/footable.paging.js"
			},
			paging_css: {
				src: [
					"src/css/components/FooTable.Paging.css"
				],
				dest: "compiled/footable.paging.css"
			},
			editing_js: {
				src: [
					"src/js/components/editing/**/*.js"
				],
				dest: "compiled/footable.editing.js"
			},
			editing_css: {
				src: [
					"src/css/components/FooTable.Editing.css"
				],
				dest: "compiled/footable.editing.css"
			},
			state_js: {
				src: [
					"src/js/components/state/**/*.js"
				],
				dest: "compiled/footable.state.js"
			},
			export_js: {
				src: [
					"src/js/components/export/**/*.js"
				],
				dest: "compiled/footable.export.js"
			},
			all_js: {
				src: [
					"compiled/footable.core.js",
					"compiled/footable.filtering.js",
					"compiled/footable.sorting.js",
					"compiled/footable.paging.js",
					"compiled/footable.editing.js",
					"compiled/footable.state.js",
					"compiled/footable.export.js"
				],
				dest: "compiled/footable.js"
			},
			standalone_css: {
				src: [
					"compiled/footable.core.standalone.css",
					"compiled/footable.filtering.css",
					"compiled/footable.sorting.css",
					"compiled/footable.paging.css",
					"compiled/footable.editing.css"
				],
				dest: "compiled/footable.standalone.css"
			},
			bootstrap_css: {
				src: [
					"compiled/footable.core.bootstrap.css",
					"compiled/footable.filtering.css",
					"compiled/footable.sorting.css",
					"compiled/footable.paging.css",
					"compiled/footable.editing.css"
				],
				dest: "compiled/footable.bootstrap.css"
			}
		},
		uglify: {
			prod: {
				options: {
					preserveComments: false,
					banner: '/*\n' +
					'* <%= pkg.title %> - <%= pkg.description %>\n' +
					'* @version <%= pkg.version %>\n' +
					'* @link <%= pkg.homepage %>\n' +
					'* @copyright Steven Usher & Brad Vincent 2015\n' +
					'* @license Released under the GPLv3 license.\n' +
					'*/\n'
				},
				files: {
					'compiled/footable.min.js': [ "compiled/footable.js" ],
					'compiled/footable.core.min.js': [ "compiled/footable.core.js" ],
					'compiled/footable.filtering.min.js': [ "compiled/footable.filtering.js" ],
					'compiled/footable.sorting.min.js': [ "compiled/footable.sorting.js" ],
					'compiled/footable.paging.min.js': [ "compiled/footable.paging.js" ],
					'compiled/footable.editing.min.js': [ "compiled/footable.editing.js" ],
					'compiled/footable.state.min.js': [ "compiled/footable.state.js" ],
					'compiled/footable.export.min.js': [ "compiled/footable.export.js" ]
				}
			}
		},
		cssmin: {
			minify: {
				options: {
					keepSpecialComments: 1
				},
				files: {
					'compiled/footable.core.standalone.min.css': [ "compiled/footable.core.standalone.css" ],
					'compiled/footable.standalone.min.css': [ "compiled/footable.standalone.css" ],
					'compiled/footable.core.bootstrap.min.css': [ "compiled/footable.core.bootstrap.css" ],
					'compiled/footable.bootstrap.min.css': [ "compiled/footable.bootstrap.css" ],
					'compiled/footable.filtering.min.css': [ "compiled/footable.filtering.css" ],
					'compiled/footable.sorting.min.css': [ "compiled/footable.sorting.css" ],
					'compiled/footable.paging.min.css': [ "compiled/footable.paging.css" ],
					'compiled/footable.editing.min.css': [ "compiled/footable.editing.css" ]
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
						'footable.sorting.min.css',
						'footable.editing.css',
						'footable.editing.min.css'
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
						'footable.sorting.min.js',
						'footable.editing.js',
						'footable.editing.min.js',
						'footable.state.js',
						'footable.state.min.js',
						'footable.export.js',
						'footable.export.min.js'
					],
					dest: 'js/'
				}]
			}
		},
		copy: {
			latest: {
				files: [{
					expand: true,
					cwd: 'releases/',
					src: ['footable-bootstrap.v<%= pkg.version %>.zip'],
					dest: 'releases/',
					rename: function(dest, src){
						return dest + src.replace('v'+grunt.config('pkg.version'), 'latest');
					}
				},{
					expand: true,
					cwd: 'releases/',
					src: ['footable-components.v<%= pkg.version %>.zip'],
					dest: 'releases/',
					rename: function(dest, src){
						return dest + src.replace('v'+grunt.config('pkg.version'), 'latest');
					}
				},{
					expand: true,
					cwd: 'releases/',
					src: ['footable-standalone.v<%= pkg.version %>.zip'],
					dest: 'releases/',
					rename: function(dest, src){
						return dest + src.replace('v'+grunt.config('pkg.version'), 'latest');
					}
				}]
			}
		},
		jsdoc: {
			dist: {
				src: [
					'./src/js/**/*.js',
					'README.md'
				],
				jsdoc: './node_modules/.bin/jsdoc',
				options: {
					destination: 'docs/jsdocs',
					configure: 'jsdoc.json',
					template: './node_modules/jsdoc-oblivion/template'
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
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-jsdoc');
	grunt.registerTask('default', ['clean:compiled', 'concat', 'uglify', 'cssmin']);
	grunt.registerTask('package', ['default', 'clean:releases', 'compress', 'copy']);
	grunt.registerTask('jsdocs', ['clean:jsdoc','jsdoc']);
};
