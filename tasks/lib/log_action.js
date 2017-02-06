'use strict';

var _ = require('lodash');
var path = require('path');

module.exports = function (grunt) {
    //对日志文件的操作
    var LogActions = {
        //读日志文件
        readLog: function(file) {
            var releaseLog = {};
            if(grunt.file.exists(file)){
                try {
                    releaseLog = grunt.file.readJSON(file);
                } catch (err) {
                    grunt.log.warn(err);
                    grunt.log.warn('reset it');
                }
            }
            return releaseLog;
        },
        //写日志文件
        writeLog: function(file, releaseLog) {
            grunt.file.write(file, JSON.stringify(releaseLog, null, 4));
        },
        //根据文件名和分隔符，生成相应的key值
        generateKey: function(filename, separator) {
            var extname = path.extname(filename);
            return filename.split(separator)[0] + extname;
        },

        //生成某文件的日志历史记录
        updateHistory: function(history, filename, comment) {
            history = history || [];
            var length = history.length;
            var newLog = {
                'datetime': grunt.template.today('yyyy-mm-dd HH:MM:ss'),
                'filename': filename
            };
            
            if (comment) {
                newLog.comment = comment;
            }
            
            if(length > 0) {
                if(history[length - 1].filename !== filename) {
                    history.push(newLog);
                }
            }else {
                history = [newLog];
            }
            
            return history;
        },
        //生成某文件的日志内容（包含历史记录）
        generateLog: function(filename, releaseLog, comment, options) {
            var key = this.generateKey(filename, options.separator);
            var history = releaseLog && releaseLog[key] ? releaseLog[key].history : [];
            history = this.updateHistory(history, filename, comment);
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
            return {key: key, log: fileLog};
        }
    };

    return LogActions;
};
module.exports.description = 'record log to file.';
