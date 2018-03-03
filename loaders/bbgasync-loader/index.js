/**
 * 模拟异步loader
 * 读取package.json
 * 往文件内容中写入banner信息，并格式化JSON字符串
 */
const path = require('path')
const packageJson = require(path.resolve(__dirname, "../../package.json"))

module.exports = function(source) {
    // 启用cache，加速webpack编译效率
    if (this.cacheable) this.cacheable()
    // 异步时需要调用
    let callback = this.async()
    // 调用异步方法
    asyncOperation(source, function(err, result) {
        if(err) return callback(err)
        // 异步返回，把异步结果通过callback传递给下一个加载器
        callback(null, result)
    })

    // 异步延迟操作
    function asyncOperation(sc, cb) {
        let value = typeof source === "string" ? JSON.parse(sc) : sc
        let info = [
            '/** \n',
            ' * author: ' + packageJson.author + '\n',
            ' * version: ' + packageJson.version + '\n',
            ' * time: ' + new Date() + '\n',
            ' */ \n'
        ]
        cb(null, info.join('') + JSON.stringify(value, null, 2))
    }
}