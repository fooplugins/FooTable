'use strict';

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('footable.jquery.json'),
        clean: {
            files: ['dist']
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
                    'dist/footable.filter.min.js': [ 'js/footable.js' ],
                    'dist/footable.paginate.min.js': [ 'js/footable.paginate.js' ],
                    'dist/footable.sort.min.js': [ 'js/footable.sort.js' ]
                }
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
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            src: {
                files: '<%= jshint.src.src %>',
                tasks: ['jshint:src']
            },
        },
    });

    // Load grunt tasks
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task.
    grunt.registerTask('default', ['jshint', 'clean', 'uglify']);

    // Test task
    grunt.registerTask('test', ['jshint']);

};
