'use strict';

module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('footable.jquery.json'),
        clean: {
            files: ['dist']
        },
        csslint: {
            strict: {
                options: {
                    csslintrc: '.csslintrc'
                },
                src: ['css/*.css']
            }
        },
        uglify: {
            all : {
                options: {
                    preserveComments: 'some',
                    mangle: {
                        except: [ "undefined" ]
                    }
                },
                files: {
                    'dist/footable.min.js': [ 'js/footable.js' ],
                    'dist/footable.grid.min.js': [ 'js/footable.grid.js' ],
                    'dist/footable.filter.min.js': [ 'js/footable.filter.js' ],
                    'dist/footable.paginate.min.js': [ 'js/footable.paginate.js' ],
                    'dist/footable.sort.min.js': [ 'js/footable.sort.js' ],
                    'dist/footable.striping.min.js': [ 'js/footable.striping.js' ],
                    'dist/footable.bookmarkable.min.js': [ 'js/footable.bookmarkable.js' ]
                }
            }
        },
		concat: {
			options: {
				separator: ';'
			},
			dist: {
				src: [ 'dist/footable.min.js', 'dist/footable.grid.min.js', 'dist/footable.filter.min.js', 'dist/footable.paginate.min.js', 'dist/footable.sort.min.js', 'dist/footable.striping.min.js', 'dist/footable.bookmarkable.min.js' ],
				dest: 'dist/footable.all.min.js'
			}
		},		
        jshint: {
            gruntfile: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: 'Gruntfile.js'
            },
            src: {
                options: {
                    jshintrc: 'js/.jshintrc'
                },
                src: ['js/**/*.js']
            }
        },
        less: {
            development: {
                files: {
                    "css/footable.core.css": "less/footable.core.less",
                    "css/footable.metro.css": "less/footable.metro.less",
                    "css/footable.standalone.css": "less/footable.standalone.less"
                }
            },
            production: {
                options: {
                    yuicompress: true
                },
                files: {
                    "css/footable.core.min.css": "less/footable.core.less",
                    "css/footable.metro.min.css": "less/footable.metro.less",
                    "css/footable.standalone.min.css": "less/footable.standalone.less"
                }
            }
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            src: {
                files: '<%= jshint.src.src %>',
                tasks: ['jshint:src']
            },
            less: {
                files: 'less/*.less',
                tasks: ['less:development']
            },
            csslint: {
                files: 'css/*.css',
                tasks: ['csslint']
            }
        }
    });

    // Load grunt tasks
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-csslint');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	
	

    // Default task.
    grunt.registerTask('default', ['jshint', 'clean', 'uglify', 'concat', 'less', 'csslint']);

    // Test task
    grunt.registerTask('test', ['jshint']);

};
