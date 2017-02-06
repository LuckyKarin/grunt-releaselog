/*
 * grunt-releaselog
 * https://github.com/LuckyKarin/grunt-releaselog
 * 
 * @Description: generate the release log of your project files
 * @Result Example: {
 *     "originalFileName": {
 *          "baseUrl": "",
 *          "fragment": "",
 *          "history": [
 *              {
 *                  "datetime": "",
 *                  "filename": "",
 *                  "comment": ""
 *              }
 *          ]
 *     }  
 * }
 *
 * Copyright (c) 2016 yikuang
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var _ = require('lodash');

module.exports = function(grunt) {

    var LogActions = require('./lib/log_action.js')(grunt);

    grunt.registerMultiTask('releaselog', 'generate the release log', function() {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            separator: '.',
            hasCommitLog: false,
            params: {},
        });
        var self = this;
        var done = this.async();

        //主函数
        function main(comment) {
            //Iterate over all specified file groups.
            self.files.forEach(function(f) {
                var releaseLog = LogActions.readLog(f.dest);
                // Concat specified files.
                f.src.filter(function(filepath) {
                    // Warn on and remove invalid source files (if nonull was set).
                    if (!grunt.file.exists(filepath)) {
                        grunt.log.warn('Source file "' + filepath + '" not found.');
                        return false;
                    } else {
                        return true;
                    }
                }).map(function(filepath) {
                    var filename = path.basename(filepath);
                    var result = LogActions.generateLog(filename, releaseLog, comment, options);
                    releaseLog[result.key] = result.log;
                });
                LogActions.writeLog(f.dest, releaseLog);
            });
        }

        //获取最新的commit注释内容
        function getCommit(done, callback) {
            var commit = '';
            grunt.util.spawn({
                cmd: 'git',
                args: ['log', '-1', '--pretty=%B']
            }, function(error, result, code) {
                commit = result.stdout;
                callback(commit);
                done(code === 0);
            });
        }

        //判断是否需要增加commit注释,并执行主函数
        if(options.hasCommitLog) {
            getCommit(done, main);
        }else {
            main();
            done(true);
        }
    });
};
