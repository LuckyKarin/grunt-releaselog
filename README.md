# grunt-releaselog

> 生成项目文件的发布日志

## 开始
该插件依赖于 Grunt `~0.4.5`

如果你从未用过 [Grunt](http://gruntjs.com/) ，请先查阅Grunt的开始指南 [Getting Started](http://gruntjs.com/getting-started)，上面讲解了如何创建一个[Gruntfile](http://gruntjs.com/sample-gruntfile)文件，以及如何安装和使用Grunt插件。当你熟悉了这一步骤之后，你可以通过以下命令安装这个插件：

```shell
npm install grunt-releaselog --save-dev
```

插件安装完成后，在你的Gruntfile中加入这行JavaScript

```js
grunt.loadNpmTasks('grunt-releaselog');
```

## "releaselog" 任务

### 概述
该插件的主要目的是生成前端静态资源的发布日志。
####开发背景
前端在发版前，为了避免因缓存导致资源未更新的情况，往往会在文件名后加上一段随机符号（时间戳或hash值等），如home.23ec834dn32k.js这种形式。一般常见的做法是根据文件内容生成一串md5的hash值，这样每次就只有被修改过的文件的文件名会有变化，没有改动的文件还保持原来的文件名。该方式既可以避免缓存导致的问题，又可以充分利用缓存的优势。
但带来的缺点就是，每个版本的文件名都是无规律的，一旦发版后发现线上问题，无法快速回溯到上一个版本。于是想到利用日志文件的形式将文件名的变化历史记录下来，同时还可以附带记录一些其它的辅助信息。
####最终生成的release log格式
#####示例
```
{  
   "common.js":{  
      "history":[  
         {  
            "datetime":"2017-01-12 18:14:11",
            "filename":"common.60d101b9.js",
            "comment":"增加搜索结果页的翻页功能"
         }
      ],
      "baseUrl":"//domain.com/project/js/v4/",
      "mark":"just test the mark function!",
      "fragment":"碎片1"
   },
   "home.js":{  
      "history":[  
         {  
            "datetime":"2017-01-12 18:14:11",
            "filename":"home.b0adcf01.js",
            "comment":"增加搜索结果页的翻页功能"
         }
      ],
      "baseUrl":"//domain.com/project/js/v4/",
      "mark":"just test the mark function!",
      "fragment":"碎片3"
   }
}
```
从以上示例可以看出，最终的日志内容是以JSON格式记录。
其中的key表示原始文件名（不带随机字符序列），如“common.js”。
对应的value对象中，history数组即表示文件的历史记录，在每一次文件名发生变更的时候，会记录下当前的时间datetime、当前变更后的文件名filename（带随机字符序列）、项目最新的git commit注释（可选）。
其它的如baseUrl、mark、fragment等信息属于自定义字段，在使用插件时可根据自身使用场景的需求自定义配置，名称和内容都可以是任意的。

### 用法
在你项目的Gruntfile文件中，在传递给“grunt.initConfig()”方法的对象里，增加一个名叫“releaselog”的模块。

```js
grunt.initConfig({
  releaselog: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Options

#### params
Type: `Object`
Default value: `{}`

指定需要记录的与文件相关的其它辅助信息。最终会在生成的日志对象里的相应文件下记录该参数对象中的所有内容。

#### hasCommitLog
Type: `Boolean`
Default value: `false`

是否需要在文件历史记录中将项目当前最新的commit注释记录下来。

#### separator
Type: `String`
Default value: `'.'`

文件名与随机字符串的连接符号。
如home.124343.js，则连接符是' . '；
而home-123456.js，则连接符是' - '。

#### process(key)
Type: `function`
Default value: `null`
Return: `Object`

参数key表示当前正在处理的文件名。
process函数返回一个对象，该对象中包含需要记录的额外字段信息。最终会将这些信息合并记录到日志内容中相应的文件名下。
这里的额外参数与通过params对象传入的参数的区别在于，可以针对所有文件分别记录不同的信息，用户可在process函数中动态处理这些信息。
而通过params传入的参数，则会在所有文件中记录下相同的信息。

### src
指定需要记录发布日志的源文件

### dest
指定生成的日志文件的路径和文件名

### 用法举例

#### 基础用法
默认情况只需指定src和dest，如下：

```js
grunt.initConfig({
  releaselog: {
      styles: {
          src: "dest/styles/c/*.css",
          dest: "release.log"
      }
  }
});
```

则生成的日志内容格式如下：

```
{
   "home.css":{  
      "history":[  
         {  
            "datetime":"2017-01-12 18:14:11",
            "filename":"home.3aae5e46.css"
         }
      ]
   },
   "login.css":{  
      "history":[  
         {  
            "datetime":"2017-01-12 18:14:11",
            "filename":"login.0847c217.css"
         }
      ]
   }
}
```

#### 高级用法

```js
grunt.initConfig({
  releaselog: {
      scripts: {
          options: {
              params: {
                  baseUrl: "//domain.com/project/js/v4/",
                  mark: 'just test the mark function!'
              },
              hasCommitLog: true,
              process: function(key) {
                  var fragmentMap = {
                    "common.js": "碎片1",
                    "login.js": "碎片2",
                    "home.js": "碎片3"
                  };
                  return {
                      fragment: fragmentMap[key]
                  };
              }
          },
          src: "dest/scripts/*.js",
          dest: "release.log"
      }
  }
});
```

则生成的日志内容格式如下：

```
{
   "common.js":{  
      "history":[  
         {  
            "datetime":"2017-01-12 18:14:11",
            "filename":"common.60d101b9.js",
            "comment":"增加搜索结果页的翻页功能"
         }
      ],
      "baseUrl":"//domain.com/project/js/v4/",
      "mark":"just test the mark function!",
      "fragment":"碎片1"
   },
   "home.js":{  
      "history":[  
         {  
            "datetime":"2017-01-12 18:14:11",
            "filename":"home.b0adcf01.js",
            "comment":"增加搜索结果页的翻页功能"
         }
      ],
      "baseUrl":"//domain.com/project/js/v4/",
      "mark":"just test the mark function!",
      "fragment":"碎片3"
   },
   "login.js":{  
      "history":[  
         {  
            "datetime":"2017-01-12 18:14:11",
            "filename":"login.76e682e6.js",
            "comment":"增加搜索结果页的翻页功能"
         }
      ],
      "baseUrl":"//domain.com/project/js/v4/",
      "mark":"just test the mark function!",
      "fragment":"碎片2"
   }
}
```

## 注意事项
在生成新版本的文件前应当清除旧版本的文件，也即dest文件夹中不应有多个版本的同名文件共存。如home.v1.js与home.v2.js不能同时存在于dest文件夹下。

## 发布历史
* v0.1.0  2017.01.05  完成基础功能，可生成指定文件变更的历史记录；
* v0.1.1  2017.01.12  优化代码，并增加可自定义记录字段和内容、可记录最新commit注释、可传入process函数等功能；
* v0.1.2  2017.01.13  限制process函数功能，禁止直接操作日志对象，增加返回值；
* v0.1.3  2017.01.17  优化代码和文档；
* v0.1.4  2017.02.06  重构代码，抽取出logActions，更新Gruntfile配置；
