'use strict';

var spawn = require('child_process').spawn,
  readline = require('readline'),
  modRewrite = require('connect-modrewrite');

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            'app-dist',
          ]
        }]
      },
      build: {
        files: [{
          dot: true,
          src: [
            'app-build',
          ]
        }]
      }
    },

    concat: {},

    connect: {
      options: {
        hostname: '0.0.0.0',
        base: './'
      },
      devserver: {
        options: {
          port: 8888,
          middleware: function(connect, options) {
            var middlewares = [];
            var directory = options.directory || options.base[options.base.length - 1];
            if (!Array.isArray(options.base)) {
              options.base = [options.base];
            }
            // Setup the proxy
            middlewares.push(require('grunt-connect-proxy/lib/utils').proxyRequest);

            middlewares.push(modRewrite([
              '^/students/$ /app/lib/educationext.core/app-build/index.html [L]',
              '^/students/(.+)$ /app/lib/educationext.core/app-build/$1',
            ]));

            options.base.forEach(function(base) {
              // Serve static files.
              middlewares.push(connect.static(base));
            });

            // Make directory browse-able.
            middlewares.push(connect.directory(directory));


            return middlewares;
          }
        },
        proxies: [{
          context: '/api/v1',
          host: '0.0.0.0',
          port: 8080
        }, {
          context: '/_ah',
          host: '0.0.0.0',
          port: 8080
        }]
      },
      screenshots: {
        options: {
          port: 5556,
          base: './screenshots/',
          keepalive: true
        }
      },
      e2e: {
        options: {
          port: 5557
        }
      }
    },

    copy: {
      build: {
        files: [{
          expand: true,
          dot: true,
          cwd: 'app',
          dest: 'app-build',
          src: [
            '**/*',
            '!lib/',
            '!lib/**/*',
            '!js/',
            '!components/**/*',
            '!js/**/*',
            '!css/',
            '!css/**/*',
          ]
        }, {
          expand: true,
          cwd: 'app/lib/bootstrap/dist',
          dest: 'app-build',
          src: [
            'fonts/*'
          ]
        }, {
          expand: true,
          cwd: 'app/lib/angular-file-upload/dist',
          dest: 'app-build/js',
          src: [
            'FileAPI.*'
          ]
        }]
      },
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: 'app-build',
          dest: 'app-dist',
          src: [
            '**/*',
            '!js/**/*',
            '!components/**/*',
            '!css/**/*',
            '!*.html',
            '!views/**/*.html'
          ]
        }, {
          expand: true,
          cwd: 'app/lib/angular-file-upload/dist',
          dest: 'app-dist/js',
          src: [
            'FileAPI.*'
          ]
        }]
      }
    },

    cssmin: {
      dist: {
        expand: true,
        cwd: 'app-build/css/',
        src: ['*.css', '!*.min.css'],
        dest: 'app-dist/css/'
      }
    },

    htmlmin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'app-build',
          src: ['*.html', 'views/**/*.html'],
          dest: 'app-dist'
        }]
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
      },
      all: [
        'Gruntfile.js',
        'app/js/**/*.js',
        'app/components/**/*.js'
      ]
    },

    karma: {
      unit: {
        configFile: 'config/karma.conf.js',
        singleRun: true
      },
      autoUnit: {
        configFile: 'config/karma.conf.js',
        autoWatch: true,
        singleRun: false
      }
    },

    protractor: {
      options: {
        configFile: 'config/e2e.conf.js',
        keepAlive: true,
        noColor: false,
      },
      build: {
        options: {
          args: {
            specs: ['app/js/appSpec.e2e.js']
          }
        }
      },
    },

    rev: {
      dist: {
        files: {
          src: [
            'app-dist/js/**/*.js',
            'app-dist/css/**/*.css',
            'app-dist/fonts/*'
          ]
        }
      }
    },

    shell: {
      options: {
        stdout: true,
        stderr: true
      },
      'npm_install': {
        command: 'npm install'
      },
      'npm_post_install': {
        command: [
          './node_modules/.bin/bower install',
          './node_modules/.bin/webdriver-manager update'
        ].join(';')
      }
    },

    targethtml: {
      build: {
        files: {
          'app-build/index.html': 'app-build/index.html'
        }
      }
    },

    uglify: {
      dist: {
        expand: true,
        cwd: 'app-build/js/',
        src: ['*.js', '!*.min.js'],
        dest: 'app-dist/js/'
      }
    },

    useminPrepare: {
      html: 'app/index.html',
      options: {
        dest: 'app-build',
        flow: {
          html: {
            steps: {
              'js': ['concat'],
              'css': ['concat']
            },
            post: {}
          }
        }
      }
    },

    usemin: {
      html: ['app-build/**/*.html', 'app-dist/**/*.html'],
      css: ['app-build/css/**/*.css', 'app-dist/css/**/*.css'],
    },

    watch: {
      app: {
        files: [
          'app/**/*',
          '!app/lib/**/*'
        ],
        tasks: ['build']
      },
      e2e: {
        files: [
          'app/**/*',
          '!app/lib/**/*'
        ],
        tasks: ['protractor:build']
      }
    },

  });

  grunt.registerTask('gae:start', 'run "make server".', function() {
    var kill, exit, done, rl, gae;

    // Start the server.
    //
    // TODO: convert the make task to a grunt task.
    gae = spawn('make', ['serve'], {
      stdio: [process.stdin, process.stdout, 'pipe']
    });

    kill = function() {
      if (gae && gae.connected) {
        gae.kill();
      }
    };

    exit = function() {
      kill();
      process.exit();
    };

    // make this task async. We need to give the server some time to
    // start up.
    done = this.async();

    rl = readline.createInterface({
      input: gae.stderr,
      output: process.stderr
    });

    // Finish task when the server exit...
    gae.on('exit', function() {
      done();
      gae = null;
      rl.close();
    });

    // ... or when the server is ready
    rl.on('line', function(log) {
      if (log.indexOf('Starting admin server') > -1) {
        done();
      } else if (log.indexOf('Unable to bind') > -1) {
        kill();
        done();
      }
    });

    // Stop the server when asked...
    grunt.event.on('gae.stop', kill);

    // ... Or when the all grunt tasks stop
    process.on('uncaughtException', exit);
    process.on('SIGINT', exit);
  });

  grunt.registerTask('gae:stop', 'stop dev server.', function() {
    grunt.event.emit('gae.stop');
  });

  grunt.registerTask('build:assets', [
    'jshint',
    'clean:build',
    'useminPrepare',
    'concat',
    'copy:build',
    'targethtml:build'
  ]);
  grunt.registerTask('build', ['build:assets', 'usemin']);

  grunt.registerTask('dist', [
    'build:assets',
    'clean:dist',
    'copy:dist',
    'htmlmin',
    'cssmin',
    'uglify',
    'rev',
    'usemin'
  ]);

  grunt.registerTask('test', ['jshint', 'karma:unit']);

  grunt.registerTask('autotest', ['jshint', 'karma:autoUnit']);
  grunt.registerTask('autotest:e2e', [
    'build',
    'connect:e2e',
    'protractor:build',
    'watch:e2e'
  ]);

  grunt.registerTask(
    'server:dev', ['gae:start', 'configureProxies:devserver', 'connect:devserver']
  );

  grunt.registerTask('dev', ['build', 'server:dev', 'watch:app', 'gae:stop']);

  grunt.registerTask('default', ['test', 'build', 'server:dev', 'autoshot', 'gae:stop']);

};