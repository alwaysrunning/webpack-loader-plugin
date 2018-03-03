const fs = require('fs')
const path = require('path')
const moment = require('moment')
const packagePath = path.resolve(__dirname, "../package.json")
const packageJson = require(packagePath)

function ChangePackageVersionPlugin(options) {
    this.options = Object.assign({}, {
        type: 'small',              // ['long', 'middle', 'small'] 大中小,
        updateTime: ''              // key存在则更新
    }, options)
}

ChangePackageVersionPlugin.prototype.apply = function (compiler) {
    let that = this
    // 编译前
    compiler.plugin("run", function (compiler, callback) {
        console.log("编译前...")
        let regVersion = /(\d+)\.(\d+)\.(\d+)/ig.exec(packageJson.version)
        // 删除正则exec返回的第一项
        regVersion.splice(0, 1)
        switch (that.options.type) {
            case 'small':
                regVersion.splice(2, 1, Number(regVersion[2]) + 1)
                break
            case 'middle':
                regVersion.splice(1, 1, Number(regVersion[1]) + 1)
                regVersion.splice(2, 1, 0)
                break
            case 'long':
                regVersion.splice(0, 1, Number(regVersion[0]) + 1)
                regVersion.splice(1, 1, 0)
                regVersion.splice(2, 1, 0)
                break
        }
        packageJson.version = regVersion.join('.')
        //  如果updateTime key存在，则更新时间
        if (that.options.updateTime && packageJson[that.options.updateTime]) {
            packageJson[that.options.updateTime] = moment().format("YYYY-MM-DD HH:mm:ss")
        }
        console.log(packagePath, packageJson, 3333)
        fs.writeFile(packagePath, JSON.stringify(packageJson, null, 2), function (err, data) {
            if (err)
                console.error("版本号修改失败: " + err)
            else {
                console.log("版本号修改完成")
                callback()
            }
        })
    })

    // 创建新编译之前
    compiler.plugin("compile", function (params) {
        console.log("创建新编译之前...")
    })

    // 编译创建完成
    compiler.plugin("compilation", function (compilation) {
        console.log("编译创建完成...")

        // 你已经不能再接收到任何模块
        compilation.plugin('seal', function () {
            console.log("你已经不能再接收到任何模块...")
        });

        // 优化编译
        compilation.plugin("optimize", function () {
            console.log("优化编译...")
        })
        
        compilation.plugin('record-chunks', function (chunks, records) {
            console.log("块记录...", chunks,records)
        });
    })
    // 在发送资源到输出目录之前
    compiler.plugin("emit", function (compilation, callback) {
        console.log("在发送资源到输出目录之前")
        // 执行一些异步……
        // setTimeout(function () {
        //     console.log("在发送资源到输出目录之前--异步结束...");
        //     callback();
        // }, 1000);
        callback();
    })
    
    // 编译后
    compiler.plugin("done", function (params) {
        console.log("编译完成, 版本号为: " + packageJson.version)
    })
    // 编译失败
    compiler.plugin("failed", function (error) {
        console.log("编译失败: " + error)
    })
}

module.exports = ChangePackageVersionPlugin
