import _buffer from 'buffer';
const Buffer = _buffer.Buffer;

const VOX_FRAQ_24K: string = '6000';
const VOX_FRAQ_32K: string = '8000';
const voxfreq = VOX_FRAQ_24K;

function long2Byte(output: Buffer, input: number[], len: number) {
    let i = 0;
    for (let j = 0; j < len; j += 4) {
        output[j] = Math.floor(input[i] & 0xff);
        output[j + 1] = Math.floor((input[i] >>> 8) & 0xff);
        output[j + 2] = Math.floor((input[i] >>> 16) & 0xff);
        output[j + 3] = Math.floor((input[i] >>> 24) & 0xff);
        i++;
    }
}
function short2Byte(output: Buffer, sh: number) {
    output[0] = Math.floor(sh & 0xff);
    output[1] = Math.floor((sh >>> 8) & 0xff);
}
function byte2Short(b: number) {
    return b < 0 ? Math.floor(b & 0xff) : Math.floor(b);
}

/**
 * 转换录音格式
 * @param { base64 } bf  字符串
 * @return { uint8array } szDesBuf
 */
export function v3BufferToWav(bf: string): Buffer {
    const buffer = new Buffer(bf, 'base64');

    let indsft = [-1, -1, -1, -1, 2, 4, 6, 8];
    let stpsz = [
        16, 17, 19, 21, 23, 25, 28, 31, 34, 37, 41, 45, 50, 55, 60, 66, 73, 80,
        88, 97, 107, 118, 130, 143, 157, 173, 190, 209, 230, 253, 279, 307, 337,
        371, 408, 449, 494, 544, 598, 658, 724, 796, 876, 963, 1060, 1166, 1282,
        1411, 1552, 1707, 1878, 2066, 2272, 2499, 2749, 3024, 3327, 3660, 4026,
        4428, 4871, 5358, 5894, 6484, 7132, 7845, 8630, 9493, 10442, 11487,
        12635, 13899, 15289, 16818, 18500, 20350, 22385, 24623, 27086, 29794,
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

    let ssindex = 0;
    if (!buffer) {
        console.log('There is no buffer:' + buffer);
        return Buffer.alloc(0);
    }
    try {
        let lPCMHDR = [
            1179011410, 0, 1163280727, 544501094, 16, 65537, 0, 0, 1048578,
            1635017060, 0,
        ];
        lPCMHDR[1] = 4 * buffer.length + 36;
        lPCMHDR[6] = parseInt(voxfreq);
        lPCMHDR[7] = 2 * parseInt(voxfreq);
        lPCMHDR[10] = 4 * buffer.length;

        if (buffer && buffer.length) {
            let szDesBuf = Buffer.alloc(buffer.length * 4 + 44);
            long2Byte(szDesBuf, lPCMHDR, 44);
            let iVal = 0;
            let pos = 44;
            for (let idx = 0; idx < buffer.length; idx++) {
                try {
                    let incoded = Math.floor(byte2Short(buffer[idx]) / 16);
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
                    short2Byte(b2, Math.floor(iVal * 16));

                    szDesBuf[pos] = b2[0];
                    pos++;
                    szDesBuf[pos] = b2[1];
                    pos++;

                    incoded = Math.floor(byte2Short(buffer[idx]) % 16);

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
                    short2Byte(b3, Math.floor(iVal * 16));
                    szDesBuf[pos] = b3[0];
                    pos++;
                    szDesBuf[pos] = b3[1];
                    pos++;
                } catch (e) {
                    console.log(e);
                }
            }
            return szDesBuf;
        }
    } catch (e) {
        console.log('转换失败');
        console.log(e);
    }
    return Buffer.alloc(0);
}
