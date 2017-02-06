/*
 * grunt-releaselog
 * https://github.com/yikuang/grunt-releaselog
 *
 * Copyright (c) 2016 yikuang
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        'tasks/lib/*.js',
        'test/src/scripts/{,*/}*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    clean: {
      dest: ['test/dest']
    },

    filerev: {
      options: {
        algorithm: 'md5',
        length: 8
      },
      scripts: {
        src: 'test/src/scripts/{,*/}*.js',
        dest: 'test/dest/scripts'
      },
      styles: {
        src: 'test/src/styles/{,*/}*.css',
        dest: 'test/dest/styles'
      }
    },

    // Configuration to be run (and then tested).
    releaselog: {
      scripts: {
        options: {
          params: {
            baseUrl: "//domain.com/h5/ucenter/v4/master/js/",
            mark: "test js mark adding!"
          },
          hasCommitLog: true,
          process: function(key) {
              var fragmentMap = {
                "lib.js": "碎片a",
                "main.js": "碎片b"
              };
              return {
                  fragment: fragmentMap[key]
              };
          }
        },
        src: "test/dest/scripts/*.js",
        dest: "release.log"
      },
      styles: {
        options: {
          params: {
            baseUrl: "//domain.com/h5/ucenter/v4/master/css/"
          }
        },
        src: "test/dest/styles/*.css",
        dest: "release.log"
      }
    }

  });

  grunt.loadTasks('tasks');
  require('load-grunt-tasks')(grunt);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'clean', 'filerev', 'releaselog']);

};
