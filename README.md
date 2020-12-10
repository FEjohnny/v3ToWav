# v3ToWav

核心算法：将 v3 格式的文件，通过 node 获取浏览器转换成普通的 wav 或者 mp4

v3 文件转 wav 或者 mp4 文件，
v3 to wav
v3 to mp4
eg.

# 使用说明

node 目录表示是 node 可以直接使用的类

javascript 表示前端浏览器中可以直接使用的类
javascript 类需要依赖一下 npm 包
"buffer": "^5.6.0",

# javascript 使用示例

```
import v3BufferToWav from 'v3BufferToWav';

const res = '原二进制文件';
const c = new v3BufferToWav();
const coveredBuffer = c.convert(res); // 转换后的文件
#const coveredBuffer = c.convert(res).toString('base64'); // 转换后的base64文件
```
