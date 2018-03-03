/**
 * 获取loader参数
 * 根据内容生成文件名hash
 * 输出到指定目录
 */
const loaderUtils = require("loader-utils")

module.exports = function(source) {
    console.log(source,222)
    // 启用cache，加速webpack编译效率
    if (this.cacheable) this.cacheable()
    // 默认配置
    const defaultConfig = {
        name: '[hash].[ext]',
        outputPath: ''
    }
    // 获取参数
    const query = loaderUtils.getOptions(this) || {}
    // 合并选项
    const config = Object.assign({}, defaultConfig, query)
    // 使用loaderUtils工具，生成Hash文件名
    let url = loaderUtils.interpolateName(this, config.name, {
        context: config.context || this.options.context,
        content: source,
        regExp: config.regExp
    })

    // 输出路径
    let outputPath = ''
    if (config.outputPath) {
        outputPath = (typeof config.outputPath === 'function' ? config.outputPath(url) : config.outputPath + url)
        url = outputPath
    } else {
        outputPath = url
    }

    // 输出到webpack指定的output路径下
    let publicPath = `__webpack_public_path__ + ${JSON.stringify(url)}`
    if (config.emitFile === undefined || config.emitFile) {
        this.emitFile(outputPath, source)
    }

    // 同步加载器最后必须要有返回值
    return `module.exports = ${publicPath}`
}