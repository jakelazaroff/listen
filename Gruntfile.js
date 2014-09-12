module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // express
        express: {
            dist: {
                options: {
                    script: 'server/app.js',
                }
            }
        },

        // sass
        sass: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'client/sass',
                    src: ['*.sass'],
                    dest: 'client/css',
                    ext: '.css'
                  }]
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
                tasks: ['sass'],
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
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-parallel');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['parallel']);

};
