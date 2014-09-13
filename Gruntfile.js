module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // express
        express: {
            dist: {
                options: {
                    script: 'server/app.js'
                }
            }
        },

        // clean
        clean: {
            build: {
                src: ['build']
            },
            tmp: {
                src: ['.tmp']
            }
        },

        // ngAnnotate
        ngAnnotate: {
            options: {
                singleQuotes: true,
            },
            listen: {
                files: {
                    '.tmp/js/application.js': ['client/js/**/*.js']
                },
            },
        },

        // uglify
        uglify: {
            options: {
                mangle: false
            },
            build: {
                files: {
                    'build/application.js': ['.tmp/**/*.js']
                }
            }
        },

        // sass
        sass: {
            dev: {
                files: [{
                    expand: true,
                    cwd: 'client/sass',
                    src: ['*.sass'],
                    dest: 'client/css',
                    ext: '.css'
                }]
            },
            build: {
                files: [{
                    expand: true,
                    cwd: 'client/sass',
                    src: ['*.sass'],
                    dest: '.tmp/css',
                    ext: '.css'
                }]
            }
        },

        // cssmin
        cssmin: {
            build: {
                files: {
                    'build/application.css': [ '.tmp/**/*.css' ]
                }
            }
        },

        // watch
        watch: {
            server: {
                files: ['server/*.js'],
                tasks: ['express']
            },
            css: {
                files: ['client/sass/*.sass'],
                tasks: ['sass:dev'],
                options: {
                    spawn: false,
                    livereload: true
                }
            }
        },

        // parallel
        parallel: {
            web: {
                options: {
                    stream: true
                },
                tasks: [{
                    grunt: true,
                    args: ['express']
                }, {
                    grunt: true,
                    args: ['watch:server']
                }, {
                    grunt: true,
                    args: ['watch:css']
                }]
            }
        }

    });

    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-ng-annotate');
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-parallel');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('dev', ['parallel']);
    grunt.registerTask('scripts', ['ngAnnotate', 'uglify']);
    grunt.registerTask('styles', ['sass:build', 'cssmin']);
    grunt.registerTask('build', ['clean:build', 'useminPrepare', 'scripts', 'styles', 'usemin', 'clean:tmp']);

};
