import 'dotenv/config';
import token from 'jsonwebtoken';

export class JwtService {
    public encryptToken(data: {}, expires: number = 60 * 60) {
        return token.sign(data, process.env.TOKEN_SECRET, {
            expiresIn: expires,
        });
    }

    public decryptToken(data: string) {
        return token.verify(data, process.env.TOKEN_SECRET);
    }
}
