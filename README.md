# v3ToWav

javascript 将华为电话录音文件 .v3 格式，通过 node 或 浏览器 转换成普通的 wav 或者 mp4

v3 音频文件转 wav 或者 mp4 文件，
v3 to wav
v3 to mp4
eg.

# 使用说明

安装依赖包

npm install v3ToWav --S

导入依赖包

import { v3BufferToWav } from 'v3ToWav';

传入.v3 文件的 base64 数据，即可返回.wav 格式二进制内容

const result = v3BufferToWav(v3MediaBase61);

如果需要 base64 格式的，直接 toString 即可，

const result = v3BufferToWav(v3MediaBase61).toString('base64');

调用 Howl 即可直接播放

const result = v3BufferToWav(v3MediaBase61).toString('base64');

new Howl({
src: [`data:audio/wav;base64,${result}`],
})

# 版本记录

v 1.0.0
初始化
