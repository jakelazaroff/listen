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
            tmp: {
                files: [{
                    // html
                    src: 'client/index.html', dest: '.tmp'
                }]
            },
            build: {
                files: [{
                    // server
                    src: '.tmp/server.js', dest: 'build/server.js'
                }, {
                    // html
                    src: '.tmp/**/*.html', dest: 'build/public', expand: true, flatten: true
                }, {
                    // css
                    src: '.tmp/css/*', dest: 'build/public/css', expand: true, flatten: true
                }, {
                    // js
                    src: '.tmp/js/*', dest: 'build/public/js', expand: true, flatten: true
                }, {
                    // img
                    src: 'client/img/*', dest: 'build/public/img', expand: true, flatten: true
                }, {
                    // fonts
                    src: 'client/fonts/*', dest: 'build/public/fonts', expand: true, flatten: true
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
                    '.tmp/js/application.js': ['.tmp/js/application.js']
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
                    '.tmp/css/application.css': [ '.tmp/css/application.css' ]
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
    grunt.registerTask('build', ['clean:build', 'copy:tmp', 'useminPrepare', 'js', 'css', 'concat:server', 'copy:build', 'usemin', 'clean:tmp']);

    grunt.registerTask('dev', ['parallel:dev']);
    grunt.registerTask('prod', ['ngAnnotate:build', 'sass:build', 'concat:server', 'copy:build', 'parallel:prod']);

};
