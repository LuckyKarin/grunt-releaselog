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

module.exports = function(grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('releaselog', 'generate the release log', function() {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            separator: '.',
            hasCommitLog: false,
            params: {},
        });
        var self = this;
        var done = this.async();
        var Util = {
            //判断是否是空对象
            isEmptyObject: function(obj) {
                var name;
                var toStr = Object.prototype.toString;
                var objStr = "[object Object]";
                if(!obj || typeof obj !== 'object' || toStr.call(obj) !== objStr) {
                    return false;
                }
                for ( name in obj ) {
                    return false;
                }
                return true;
            },
            //扩展对象
            extend: function(parent, child) {
                if(!this.isEmptyObject(child)) {
                    for(var item in child) {
                        parent[item] = child[item];
                    }
                }
            }
        };

        //判断是否需要增加commit注释,并执行主函数
        if(options.hasCommitLog) {
            getCommit(done, main);
        }else {
            main();
            done(true);
        }

        //主函数
        function main(commit) {
            //Iterate over all specified file groups.
            self.files.forEach(function(f) {
                var releaseLog = getReleaseLog(f.dest);
                // Concat specified files.
                var src = f.src.filter(function(filepath) {
                    // Warn on and remove invalid source files (if nonull was set).
                    if (!grunt.file.exists(filepath)) {
                        grunt.log.warn('Source file "' + filepath + '" not found.');
                        return false;
                    } else {
                        return true;
                    }
                }).map(function(filepath) {
                    var filename = path.basename(filepath);
                    setLog(releaseLog, filename, commit);
                });
                setReleaseLog(f.dest, releaseLog);
            });
        }

        //读取日志对象
        function getReleaseLog(file) {
            var releaseLogObj = {};
            if(grunt.file.exists(file)){
                releaseLogObj = grunt.file.readJSON(file);
            }
            return releaseLogObj;
        }

        //写入日志
        function setReleaseLog(file, releaseLogObj) {
            // Write the destination file.
            grunt.file.write(file, JSON.stringify(releaseLogObj));
        }

        //写入一条log
        function setLog(releaseLogObj, filename, comment) {
            var log = {
                'datetime': grunt.template.today('yyyy-mm-dd HH:MM:ss'),
                'filename': filename
            };
            if(comment) {
                log.comment = comment;
            }
            var filenameArr = filename.split('.');
            var extname = filenameArr[filenameArr.length - 1];
            var key = filename.split(options.separator)[0] + '.' + extname;
            var historyLength;
            var extraParams = {};

            //写入history数据
            if(releaseLogObj[key]) {
                historyLength = releaseLogObj[key].history ?  releaseLogObj[key].history.length : 0;
                if(historyLength > 0) {
                    if(releaseLogObj[key].history[historyLength - 1].filename !== filename) {
                        releaseLogObj[key].history.push(log);
                    }
                }else {
                    releaseLogObj[key].history = [log];
                }
            }else {
                releaseLogObj[key] = {
                    'history': [log]
                };
            }

            //写入其它配置参数
            Util.extend(releaseLogObj[key], options.params);

            //通过process方法写入其它动态参数
            if(typeof options.process === 'function') {
                extraParams = options.process(key);
                Util.extend(releaseLogObj[key], extraParams);
            }else {
                if(options.process) {
                    grunt.log.error('options.process must be a function; ignoring');
                }
            }

            // Print a success message.
            grunt.log.writeln('relesed log of ' + key);
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

    });

};
