// const path = require('path');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
// const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// const webpack = require('webpack');

// module.exports = {
//     mode: 'production',
//     entry: './src/public/index.js',
//     output: {
//         filename: '[name].bundle.js',
//         path: path.resolve(__dirname, 'dist'),
//     },
//     optimization: {
//         splitChunks: {
//             chunks: 'all',
//         },
//     },
//     module: {
//         rules: [
//             {
//                 test: /\.css$/,
//                 use: [
//                     'style-loader',
//                     'css-loader',

//                 ]
//             }
//         ]
//     },
//     plugins: [
//         new webpack.ProvidePlugin({
//             $: 'jquery',
//         }),
//         new CleanWebpackPlugin(),
//         new HtmlWebpackPlugin({
//             filename: 'index.html',
//             template: 'src/public/index.html'
//         }),
//     ]
// };






// const path = require('path');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
// const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const webpack = require('webpack');

// module.exports = {
//     mode: 'production',
//     entry: './src/public/index.js',
//     output: {
//         filename: '[name].bundle.js',
//         path: path.resolve(__dirname, 'dist'),
//     },
//     optimization: {
//         splitChunks: {
//             chunks: 'all',
//         },
//     },
//     module: {
//         rules: [
//             {
//                 test: /\.css$/,
//                 use: [
//                     MiniCssExtractPlugin.loader,
//                     'css-loader',
//                 ]
//             }
//         ]
//     },
//     plugins: [
//         new webpack.ProvidePlugin({
//             $: 'jquery',
//         }),
//         new CleanWebpackPlugin(),
//         new HtmlWebpackPlugin({
//             filename: 'index.html',
//             template: 'src/public/index.html'
//         }),
//         new MiniCssExtractPlugin({
//             filename: '[name].css',
//             chunkFilename: '[id].css'
//         })
//     ]
// };


















// const path = require('path');
// const TerserJSPlugin = require('terser-webpack-plugin');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
// const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// const webpack = require('webpack');

// module.exports = {
//     mode: 'production',
//     entry: {
//         index: './src/public/index.js'
//     },
//     // entry: './src/public/index.js',
//     output: {
//         filename: '[name].bundle.js',
//         path: path.resolve(__dirname, 'dist'),
//     },
//     optimization: {
//         // splitChunks: {
//         //     chunks: 'all',
//         // },
//         minimizer: [
//             new TerserJSPlugin({}),
//             new OptimizeCSSAssetsPlugin({})
//         ]
//     },
//     module: {
//         rules: [
//             {
//                 test: /\.css$/,
//                 use: [
//                     MiniCssExtractPlugin.loader,
//                     'css-loader',
//                 ]
//             }
//         ]
//     },
//     plugins: [
//         new webpack.ProvidePlugin({
//             $: 'jquery',
//         }),
//         new CleanWebpackPlugin(),
//         new HtmlWebpackPlugin({
//             filename: 'index.html',
//             template: 'src/public/index.html',
//             chunks: ['index']
//         }),
//         new HtmlWebpackPlugin({
//             filename: 'schedule.html',
//             template: 'src/public/schedule.html',
//             chunks: []
//         }),
//         new MiniCssExtractPlugin({
//             filename: '[name].css',
//             chunkFilename: '[id].css'
//         })
//     ]
// };



// const path = require('path');
// const TerserJSPlugin = require('terser-webpack-plugin');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
// const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// const webpack = require('webpack');

// module.exports = {
//     mode: 'production',
//     entry: {
//         index: './src/public/index.js'
//     },
//     output: {
//         filename: '[name].bundle.js',
//         path: path.resolve(__dirname, 'dist'),
//     },
//     optimization: {
//         splitChunks: {
//             chunks: 'all',
//         },
//     },
//     module: {
//         rules: [
//             {
//                 test: /\.css$/,
//                 use: [
//                     'style-loader',
//                     'css-loader',
//                 ]
//             }
//         ]
//     },
//     plugins: [
//         new webpack.ProvidePlugin({
//             $: 'jquery',
//         }),
//         new CleanWebpackPlugin(),
//         new HtmlWebpackPlugin({
//             filename: 'index.html',
//             template: 'src/public/index.html',
//             chunks: ['index'],
//         }),
//         new HtmlWebpackPlugin({
//             filename: 'schedule.html',
//             template: 'src/public/schedule.html',
//             chunks: []
//         }),
//     ]
// };












const path = require('path');
const TerserJSPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    mode: 'production',
    entry: {
        index: './src/public/index.js'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ]
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
        }),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'src/public/index.html',
            chunks: ['index'],
        }),
        new HtmlWebpackPlugin({
            filename: 'schedule.html',
            template: 'src/public/schedule.html',
            chunks: []
        }),
    ]
};
