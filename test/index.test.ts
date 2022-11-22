import {v3BufferToWav} from '../src/index';
const testV3Base64Data = '/+M4ZAAAAAAAAAAAAAAAAAAAAAAASW5mbwA';

describe('生成数字范围内的随机数', () => {
    it('random(1, 1) -> should return 1', () => {
        const data = v3BufferToWav(testV3Base64Data);
        expect(data).toBe(data);
    });
});
