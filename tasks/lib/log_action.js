'use strict';

var _ = require('lodash');

module.exports = function (grunt) {
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
            grunt.file.write(file, JSON.stringify(releaseLog, null, 4));
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
            fileLog = _.extend(fileLog, options.params);
            //通过process方法写入其它动态参数
            if(typeof options.process === 'function') {
                extraParams = options.process(key);
                fileLog = _.extend(fileLog, extraParams);
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

    return LogActions;
};
module.exports.description = 'record log to file.';
