module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // express
        express: {
            dev: {
                options: {
                    script: 'server/server.js',
                    node_env: 'development'
                }
            },
            prod : {
                options: {
                    script: 'build/server.js',
                    node_env: 'production'
                }                
            }
        },

        // clean
        clean: {
            tmp: {
                src: ['.tmp']
            },
            build: {
                src: ['build']
            }
        },

        // copy
        copy: {
            build: {
                files: [{
                    src: ['.tmp/**/*.html', '.tmp/**/*.css', '.tmp/**/*.js'], dest: 'build/', expand: true, flatten: true
                }, {
                    src: 'client/img/*', dest: 'build/img', expand: true, flatten: true
                }, {
                    src: 'client/fonts/*', dest: 'build/fonts', expand: true, flatten: true
                }]
            }
        },

        // concat
        concat: {
            options: {
                separator: ';'
            },
            server: {
                src: 'server/**/*.js',
                dest: '.tmp/server.js',
            }
        },

        // usemin
        useminPrepare: {
            build: {
                src: 'client/index.html',
                dest: '.tmp'
            }
        },

        usemin: {  
            html: '.tmp/index.html'
        },

        // ngAnnotate
        ngAnnotate: {
            options: {
                singleQuotes: true,
            },
            build: {
                files: {
                    '.tmp/application.js': ['client/js/**/*.js']
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
                    '.tmp/js/application.js': ['.tmp/application.js']
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
                    dest: '.tmp',
                    ext: '.css'
                }]
            }
        },

        // cssmin
        cssmin: {
            build: {
                files: {
                    '.tmp/css/application.css': [ '.tmp/application.css' ]
                }
            }
        },

        // watch
        watch: {
            server: {
                files: ['server/**/*.js'],
                tasks: ['express']
            },
            js: {
                files: ['client/**/*.js'],
                tasks: ['ngAnnotate:dev'],
                options: {
                    spawn: false,
                    livereload: true
                }
            },
            css: {
                files: ['client/**/*.sass'],
                tasks: ['sass:dev'],
                options: {
                    spawn: false,
                    livereload: true
                }
            },
            prod: {
                files: ['server/**/*', 'client/**/*'],
                tasks: ['ngAnnotate:build', 'sass:build', 'copy:build'],
                options: {
                    spawn: false,
                    livereload: true
                }
            }
        },

        // parallel
        parallel: {
            dev: {
                options: {
                    stream: true
                },
                tasks: [{
                    grunt: true,
                    args: ['express:dev']
                }, {
                    grunt: true,
                    args: ['watch:server']
                }, {
                    grunt: true,
                    args: ['watch:css']
                }]
            },
            prod: {
                options: {
                    stream: true
                },
                tasks: [{
                    grunt: true,
                    args: ['express:prod']
                }, {
                    grunt: true,
                    args: ['watch:prod']
                }]
            },
        }

    });

    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-ng-annotate');
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-parallel');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('js', ['ngAnnotate', 'uglify:build']);
    grunt.registerTask('css', ['sass:build', 'cssmin:build']);
    grunt.registerTask('build', ['clean:build', 'useminPrepare', 'js', 'css', 'concat:server', 'copy:build', 'usemin', 'clean:tmp']);

    grunt.registerTask('dev', ['parallel:dev']);
    grunt.registerTask('prod', ['ngAnnotate:build', 'sass:build', 'concat:server', 'copy:build', 'parallel:prod']);

};
