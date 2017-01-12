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
        'tasks/*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    releaselog: {
      scripts: {
        options: {
          params: {
            baseUrl: "//s6.rr.itc.cn/h5/ucenter/v4/master/js/",
            mark: "just test!"
          },
          process: function(releaseLogObj, key) {
            var fragmentMap = {
              "test-a.js": "碎片a",
              "test-b.js": "碎片b"
            };
            if(fragmentMap[key]) {
              releaseLogObj[key]["fragment"] = fragmentMap[key];
            }
          }
        },
        src: "test/scripts/*.js",
        dest: "release.log"
      }
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'releaselog', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
