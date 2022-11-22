const fs = require('fs');
const path = require('path');
class V3FileUtil {
    constructor(voxFreq) {
        this.VOX_FRAQ_24K = '6000';
        this.VOX_FRAQ_32K = '8000';
        this.voxfreq = voxFreq || this.VOX_FRAQ_24K;
    }
    long2Byte(output, input, len) {
        let i = 0;
        for (let j = 0; j < len; j += 4) {
            output[j] = Math.floor(input[i] & 0xff);
            output[j + 1] = Math.floor((input[i] >>> 8) & 0xff);
            output[j + 2] = Math.floor((input[i] >>> 16) & 0xff);
            output[j + 3] = Math.floor((input[i] >>> 24) & 0xff);
            i++;
        }
    }
    short2Byte(output, sh) {
        output[0] = Math.floor(sh & 0xff);
        output[1] = Math.floor((sh >>> 8) & 0xff);
    }

    byte2Short(b) {
        return b < 0 ? Math.floor(b & 0xff) : Math.floor(b);
    }

    /**
     * 转换录音格式
     * @param v3File  输入文件
     * @param wavFile	输出文件
     */
    convert(v3File, wavFile) {
        let readStream = null;
        let writeStream = null;

        let indsft = [-1, -1, -1, -1, 2, 4, 6, 8];
        let stpsz = [
            16, 17, 19, 21, 23, 25, 28, 31, 34, 37, 41, 45, 50, 55, 60, 66, 73,
            80, 88, 97, 107, 118, 130, 143, 157, 173, 190, 209, 230, 253, 279,
            307, 337, 371, 408, 449, 494, 544, 598, 658, 724, 796, 876, 963,
            1060, 1166, 1282, 1411, 1552, 1707, 1878, 2066, 2272, 2499, 2749,
            3024, 3327, 3660, 4026, 4428, 4871, 5358, 5894, 6484, 7132, 7845,
            8630, 9493, 10442, 11487, 12635, 13899, 15289, 16818, 18500, 20350,
            22385, 24623, 27086, 29794,
        ];
        let nbl2bit = [
            [0, 0, 0, 0],
            [0, 0, 0, 1],
            [0, 0, 1, 0],
            [0, 0, 1, 1],
            [0, 1, 0, 0],
            [0, 1, 0, 1],
            [0, 1, 1, 0],
            [0, 1, 1, 1],
            [1, 0, 0, 0],
            [1, 0, 0, 1],
            [1, 0, 1, 0],
            [1, 0, 1, 1],
            [1, 1, 0, 0],
            [1, 1, 0, 1],
            [1, 1, 1, 0],
            [1, 1, 1, 1],
        ];
        let sgns = [1, -1];

        let file = fs.statSync(path.resolve(v3File)); // 获取文件属性
        let ssindex = 0;
        if (!file) {
            console.log("There's no file:" + v3File);
            return false;
        }
        try {
            // 可读流
            readStream = fs.createReadStream(path.resolve(v3File));
            // 可写流
            writeStream = fs.createWriteStream(path.resolve(wavFile));

            let lPCMHDR = [
                1179011410, 0, 1163280727, 544501094, 16, 65537, 0, 0, 1048578,
                1635017060, 0,
            ];
            lPCMHDR[1] = 4 * file.size + 36;
            lPCMHDR[6] = parseInt(this.voxfreq);
            lPCMHDR[7] = 2 * parseInt(this.voxfreq);
            lPCMHDR[10] = 4 * file.size;

            let b = Buffer.alloc(44);
            this.long2Byte(b, lPCMHDR, 44);
            writeStream.write(b, 0, b.length);

            const _this = this;

            readStream.on('data', function (chunk) {
                if (chunk && chunk.length) {
                    let iVal = 0;
                    let pos = 0;

                    let szDesBuf = Buffer.alloc(chunk.length * 4);
                    for (var idx = 0; idx < chunk.length; idx++) {
                        try {
                            let incoded = Math.floor(
                                _this.byte2Short(chunk[idx]) / 16,
                            );
                            let diff =
                                sgns[nbl2bit[incoded][0]] *
                                (stpsz[ssindex] * nbl2bit[incoded][1] +
                                    (stpsz[ssindex] / 2) * nbl2bit[incoded][2] +
                                    (stpsz[ssindex] / 4) * nbl2bit[incoded][3] +
                                    stpsz[ssindex] / 8);
                            ssindex += indsft[incoded % 8];

                            if (ssindex < 0) {
                                ssindex = 0;
                            }
                            if (ssindex > 48) {
                                ssindex = 48;
                            }
                            iVal = Math.floor(iVal + diff);

                            if (iVal > 2047) {
                                iVal = 2047;
                            } else if (iVal < -2047) {
                                iVal = -2047;
                            }

                            let b2 = Buffer.alloc(2);
                            _this.short2Byte(b2, Math.floor(iVal * 16));

                            szDesBuf[pos] = b2[0];
                            pos++;
                            szDesBuf[pos] = b2[1];
                            pos++;

                            incoded = Math.floor(
                                _this.byte2Short(chunk[idx]) % 16,
                            );

                            diff =
                                sgns[nbl2bit[incoded][0]] *
                                (stpsz[ssindex] * nbl2bit[incoded][1] +
                                    (stpsz[ssindex] / 2) * nbl2bit[incoded][2] +
                                    (stpsz[ssindex] / 4) * nbl2bit[incoded][3] +
                                    stpsz[ssindex] / 8);

                            ssindex += indsft[incoded % 8];
                            if (ssindex < 0) {
                                ssindex = 0;
                            }

                            if (ssindex > 48) {
                                ssindex = 48;
                            }

                            iVal = Math.floor(iVal + diff);

                            if (iVal > 2047) {
                                iVal = 2047;
                            } else if (iVal < -2047) {
                                iVal = -2047;
                            }

                            let b3 = Buffer.alloc(2);
                            _this.short2Byte(b3, Math.floor(iVal * 16));
                            szDesBuf[pos] = b3[0];
                            pos++;
                            szDesBuf[pos] = b3[1];
                            pos++;
                        } catch (e) {
                            console.log(e);
                        }
                    }
                    writeStream.write(szDesBuf);
                    pos = 0;
                }
            });
            readStream.on('end', function (chunk) {
                console.log('Transfer v3 file to wav file successfully!');
            });
        } catch (e) {
            console.log('转换失败');
            console.log(e);
        }
    }
}

module.exports = V3FileUtil;
