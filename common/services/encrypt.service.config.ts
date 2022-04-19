import 'dotenv/config';
import CryptoJs, { mode, pad } from 'crypto-js';
import crypto from 'crypto';

export class EncryptService {
    private iv = CryptoJs.enc.Utf8.parse(process.env.SECRET_KEY);

    public encrypt(data: any) {
        return CryptoJs.AES.encrypt(
            JSON.stringify(data),
            process.env.SECRET_KEY,
            {
                keySize: 128 / 8,
                iv: this.iv,
                mode: mode.CBC,
                padding: pad.Pkcs7,
            }
        );
    }

    public decrypt(data: string) {
        return JSON.parse(
            CryptoJs.enc.Utf8.stringify(
                CryptoJs.AES.decrypt(data, process.env.SECRET_KEY, {
                    keySize: 128 / 8,
                    iv: this.iv,
                    mode: mode.CBC,
                    padding: pad.Pkcs7,
                })
            )
        );
    }

    public RandomChar(len: number) {
        return crypto.randomBytes(len).toString('hex');
    }
}
