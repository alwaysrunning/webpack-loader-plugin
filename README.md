Webpack Share
==========================================================
### 什么是 Webpack
Webpack整体是一个插件架构，所有的功能都以插件的方式集成在构建流程中，通过发布订阅事件来触发各个插件执行。webpack核心使用 [Tapable](https://github.com/webpack/tapable) 来实现插件(plugins)的binding（绑定）和applying（应用）

### 什么是 Tapable
Tapable是webpack官方开发维护的一个小型库,能够让我们为javascript模块添加并应用插件。 它可以被其它模块继承或混合。它类似于NodeJS的 EventEmitter 类,专注于自定义事件的发射和操作。 除此之外, Tapable 允许你通过回调函数的参数访问事件的生产者。
Tapable 就相当于是一个 事件管家，它所提供的 plugin 方法类似于 addEventListen 监听事件，apply 方法类似于事件触发函数 trigger；

### Compiler(编译器)和Compilation(编译)
在webpack插件开发中最重要的两个核心概念就是 compiler 和 compilation。
Compiler 继承自前面我们介绍的Tapable类，其混合了 Tapable 类以吸收其功能来注册和调用自身的插件。大多数面向用户的插件，都是首先在 Compiler 上注册的。
Compiler对象代表的是配置完备的Webpack环境。 Compiler对象只在Webpack启动时构建一次，由Webpack组合所有的配置项构建生成。
Compilation 对象代表了一次单一的版本构建和生成资源。当运行 webpack 开发环境中间件时，每当检测到一个文件变化，一次新的编译将被创建，从而生成一组新的编译资源。
一个编译对象表现了当前的模块资源、编译生成资源、变化的文件、以及被跟踪依赖的状态信息。编译对象也提供了很多关键点事件回调供插件做自定义处理时选择使用。
Compiler 对象代表的是不变的webpack环境，是针对webpack的。
Compilation 对象针对的是随时可变的项目文件，只要文件有改动，compilation就会被重新创建。

### 什么是 Loader?
Loader 用于加载某些资源文件，专注于资源转换（transform），例如：less-loader将less资源转换成css。因为webpack 本身只能打包 commonJs 规范的js文件，对于其他资源例如 vue、css、图片、coffee等是没有办法加载的。 这就需要对应的loader将资源转换加载进来。所以loader是用于转换的，它作用于一个个资源文件上。

### 什么是 Plugin?
Plugin 可以实现loader所不能完成的复杂功能，使用plugin丰富的自定义API以及生命周期事件，可以控制webpack编译流程的每个环节，实现对webpack的自定义功能扩展
，它直接作用于 webpack。
```
// 注入全局变量
new webpack.DefinePlugin({
    "process.env": {
        NODE_ENV: JSON.stringify("test")
    }
})
```

## Loader
### 1.1 Loader的使用
加载器[从右到左](https://webpack.js.org/guides/migrating/#chaining-loaders)(从后往前)链式执行。上一个加载器的处理结果当作下一个加载器的输入。

```
// 1.0版本写法
{
  module: {
    loaders: [
      { test: /\.jade$/, loader: "jade" },
      { test: /\.css$/, loader: "style!css" },
      // 另一种写法
      { test: /\.css$/, loaders: ["style", "css"] }
    ]
  }
}
// 2.0版本写法
{
 module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              modules: true
            }
          }
        ]
      }
    ]
  }
}
```

### 1.2、[怎么编写loader（加载器）?](https://webpack.js.org/development/how-to-write-a-loader/)
> loader 是一个node模块导出的 function。 \
资源被loader转换时，会调用对应的node模块方法。



- Loader 是一个单任务模块，但loader可以链接。我们应该为每个步骤创建加载程序，而不是在一个加载器中一次完成所有的操作。
- Loader 传递一个参数：资源文件的内容。 返回结果是字符串(String)或缓冲区(Buffer)。
- 同步模式下直接return结果 ^[1.3]^。
- 在异步模式下，必须调用 this.async() 来指示加载程序应该等待异步结果，它返回 this.callback() ，将处理的结果传递给下一个加载器 ^[1.4]^。
- Loader 可以缓存，加快打包速度 ^[1.5]^。
- Loader 程序可以在该函数的上下文中访问
[Loader API](https://webpack.js.org/api/loaders/#this-version)。

### 1.3 同步 Loader

```
module.exports = function(source) {
    return someSyncOperation(source);
};

// style-loader，查看源码是直接 return;
```

### 1.4 异步 Loader
```
module.exports = function(source) {
    var callback = this.async();
    someAsyncOperation(source, function(err, result) {
        if(err) return callback(err);
        callback(null, result);
    });
};

// less-loader
const less = require('less');
module.exports = function (source) {
    // 声明此 loader 是异步的
    this.async();
    let resultCb = this.callback;
    less.render(source, (e, output) => {
        if (e) {
            throw `less解析出现错误: ${e}, ${e.stack}`;
        }
        resultCb("module.exports = " + JSON.stringify(output.css));
    });
}
```
less-loader 本质上只是调用了 less 本身的 render 方法，由于 less.render 是异步的，less-loader 肯定也得异步，所以需要通过回调函数来获取其解析之后的 css 代码。
### 1.5 Loader 缓存，提高编译效率
```
module.exports = function(source) {
    this.cacheable && this.cacheable();
    return source;
};
```
### 1.6 Raw loader
默认的情况，原文件是以 UTF-8 String 的形式传入给加载器，同样加载器可以使用 Buffer 的形式传入。
```
module.exports = function(source) {
    return source;
};
module.exports.raw = true;
```


### 1.7 使用 [loader-utils](https://github.com/webpack/loader-utils)
使用 loader-utils 来获取加载程序选项。
```
const loaderUtils = require("loader-utils");

module.exports = function(source) {
    const options = loaderUtils.getOptions(this);
};
```
### 1.8 加载器参数
this.query 与 loaderUtils.getOptions(this) 都可以获得参数。
后者可以把 "bbg?param=foo" 转换成 { param: 'foo' } 。
```
// 方法1
{
    test: /\.bbg/,
    loader: "bbg?param=foo"
}
// 方法2
{
    test: /\.bbg/,
    loader: "bbg",
    options: {
        param: "foo"
    }
}
const params = this.query;
// url形式返回的是: ?param=foo
// options的形式返回的是Object: { param: 'foo' }

const params = loaderUtils.getOptions(this);
// url与options形式都是返回: { param: 'foo' }

```

### 1.9 [修改输出文件名](https://github.com/webpack/loader-utils#interpolatename)
使用 loaderUtils.interpolateName() 来修改输出文件名。
```
const filename = loaderUtils.interpolateName(this, "[hash].min.[ext]", {
    context: config.context || this.options.context,
    content: source,    // 根据文件内容进行Hash，内容不同Hash值不同
    regExp: config.regExp
});

```

## 2 [Plugin](https://webpack.js.org/api/plugins/)
[如何编写Plugin](https://webpack.js.org/development/how-to-write-a-plugin/)

### 2.1 Plugin的使用
plugin分为两种：
```
// 访问内置的插件
new webpack.optimize.UglifyJsPlugin()
new webpack.DefinePlugin({
    "process.env": {
        NODE_ENV: JSON.stringify("test")
    }
})
```
```
// 访问第三方插件
new HtmlWebpackPlugin({template: './src/index.html'})
```
调用 compiler.plugin 来访问资源的编译和它们独立的构建步骤
```
// ChangePackageVersionPlugin.js

function ChangePackageVersionPlugin(options) {
  // Configure your plugin with options...
}

ChangePackageVersionPlugin.prototype.apply = function(compiler) {
  compiler.plugin("compile", function (params) {
          console.log("创建新编译之前...")
  })
  // 编译创建完成
  compiler.plugin("compilation", function (compilation) {
      console.log("编译创建完成...")
      // 优化编译
      compilation.plugin("optimize", function () {
          console.log("优化编译...")
      })
      // 你已经不能再接收到任何模块
      compilation.plugin('seal', function () {
          console.log("你已经不能再接收到任何模块...")
      });
      compilation.plugin('record-chunks', function (chunks, records) {
          console.log("块记录...", records)
      });
  })
  // 在发送资源到输出目录之前
  compiler.plugin("emit", function (compilation, callback) {
      console.log("在发送资源到输出目录之前")
      // 执行一些异步……
      setTimeout(function () {
          console.log("在发送资源到输出目录之前--异步结束...");
          callback();
      }, 1000);
  })
};

module.exports = ChangePackageVersionPlugin;
```

[Event Hooks](https://webpack.js.org/api/plugins/compiler/#event-hooks)
Event name | Reason | Params | Type
---|---|---|---
entry-option | - | - | bailResult
after-plugins | 设置插件的初始配置后 | compiler | sync
after-resolvers | 设置解析器后 | compiler | sync
environment | - | - | sync
after-environment | 环境配置完成 | - | sync
before-run | compiler.run() 开始 | compiler | sync
run | 读取记录之前 | compiler | bailResult
watch-run | 监视后开始编译之前 | compiler | async
normal-module-factory | 创建 NormalModuleFactory 后 | normalModuleFactory | sync
context-module-factory | 创建 ContextModuleFactory 后 | contextModuleFactory | sync
before-compile | 编译参数创建完成 | compilationParams | async
compile | 创建新编译之前 | compilationParams | sync
this-compilation | 发送 compilation 事件之前 | compilation | sync
compilation | 编译创建完成 | compilation | sync
make | - | compilation | parallel
after-compile | - | compilation | async
should-emit | Can return true/false at this point | compilation | bailResult
need-additional-pass | - | - | bailResult
emit | 在发送资源到输出目录之前 | compilation | async
after-emit | 在发送资源到输出目录之后 | compilation | async
done | 完成编译 | stats | sync
failed | 编译失败 | error | sync
invalid | After invalidating a watch compile | fileName, changeTime | sync
watch-close | After stopping a watch compile | - | sync


### [Compilation API](https://doc.webpack-china.org/api/plugins/compilation)
Compilation 实例继承于 compiler

```
compiler.plugin("compilation", function(compilation) {
    //主要的编译实例
    //随后所有的方法都从 compilation.plugin 上得来
});
compilation.plugin('seal', function() {
    //你已经不能再接收到任何模块
    //没有参数
});
compilation.plugin('optimize', function() {
    //webpack 已经进入优化阶段
    //没有参数
});
```