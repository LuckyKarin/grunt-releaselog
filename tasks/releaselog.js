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
            //复制对象
            copy: function(obj, isArray) {
                var toStr = Object.prototype.toString;
                var astr = "[object Array]";
                var resultObj = isArray ? [] : {};
                if(!this.isEmptyObject(obj)) {
                    for (var i in obj) {
                        if (obj.hasOwnProperty(i)) {
                            if (typeof obj[i] === "object") {
                                resultObj[i] = this.copy(obj[i], toStr.call(obj[i]) === astr);
                            } else {
                                resultObj[i] = obj[i];
                            }
                        }
                    }
                }
                return resultObj;
            },
            //扩展对象
            extend: function(parent, child) {
                var resultObj = this.copy(parent);
                if(!this.isEmptyObject(child)) {
                    for(var i in child) {
                        if (child.hasOwnProperty(i)) {
                            resultObj[i] = child[i];
                        }
                    }
                }
                return resultObj;
            }
        };
        //对日志文件的操作
        var LogActions = {
            //读日志文件
            readLog: function(file) {
                var releaseLog = {};
                if(grunt.file.exists(file)){
                    releaseLog = grunt.file.readJSON(file);
                }
                return releaseLog;
            },
            //写日志文件
            writeLog: function(file, releaseLog) {
                grunt.file.write(file, JSON.stringify(releaseLog));
            },
            //根据文件名和分隔符，生成相应的key值
            generateKey: function(filename, separator) {
                var filenameArr = filename.split('.');
                var extname = filenameArr[filenameArr.length - 1];
                return filename.split(separator)[0] + '.' + extname;
            },
            //通过key值，取到对应文件的日志内容
            getFileLogByKey: function(releaseLog, key) {
                if(releaseLog[key]) {
                    return releaseLog[key];
                }else {
                    return {};
                }
            },
            //生成某文件的日志历史记录
            generateHistoryLog: function(fileLog, filename, comment) {
                var history = fileLog.history || [];
                var length = history.length;
                var log = {
                    'datetime': grunt.template.today('yyyy-mm-dd HH:MM:ss'),
                    'filename': filename
                };
                if(comment) {
                    log.comment = comment;
                }
                if(length > 0) {
                    if(history[length - 1].filename !== filename) {
                        history.push(log);
                    }
                }else {
                    history = [log];
                }
                return history;
            },
            //生成某文件的日志内容（包含历史记录）
            generateLog: function(key, history, options) {
                var fileLog = {
                    history: history
                };
                var extraParams = {};
                //写入其它配置参数
                fileLog = Util.extend(fileLog, options.params);
                //通过process方法写入其它动态参数
                if(typeof options.process === 'function') {
                    extraParams = options.process(key);
                    fileLog = Util.extend(fileLog, extraParams);
                }else {
                    if(options.process) {
                        grunt.log.error('options.process must be a function; ignoring');
                    }
                }
                // Print a success message.
                grunt.log.writeln('relesed log of ' + key);
                return fileLog;
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
                    var key = LogActions.generateKey(filename, options.separator);
                    var fileLog = LogActions.getFileLogByKey(releaseLog, key);
                    var historyLog = LogActions.generateHistoryLog(fileLog, filename, comment);
                    releaseLog[key] = LogActions.generateLog(key, historyLog, options);
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

    });

};
