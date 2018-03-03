const path = require('path');
const webpack = require('webpack');
const ChangePackageVersionPlugin = require('./plugins/bbg-plugin');

module.exports = {
    //页面入口文件配置
    entry: {
        index : './src/main.js'
    },
    //入口文件输出配置
    output: {
        path: __dirname +'/dist/',
        filename: '[name].js'
    },
    module: {
        //加载器配置
        rules: [
            {
                test: /\.bbg$/,
                use: [
                    {
                        loader: path.resolve('loaders/bbg-loader/index.js'),
                        options: {
                            name: "[hash:5].[ext]",
                            outputPath: "bbg/",
                            // name: "[path][name].[ext]",
                            // name: "[emoji:4].[ext]",
                            // name: "[sha512:hash:base64:7].[ext]",
                            // name: "[1].[hash].min.[ext]",
                            // regExp: "page.(.*).bbg"
                        }
                    },
                    {
                        loader: path.resolve('loaders/bbg-loader/index.js')
                    }
                ]
            }
        ]
    },
    
    //插件项
    plugins: [
        // 自定义插件，编译完成后修改Package中的版本号
        new ChangePackageVersionPlugin({
            // type: 'middle',
            updateTime: 'updatetime'
        })
    ],
};