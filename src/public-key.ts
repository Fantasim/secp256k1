import { CURVE, PUBKEY_COMPRESSED_LENGTH, PUBKEY_LENGTH, _1n, _3n } from "./constant";
import Point from "./point";
import { bytesToHex, bytesToInt, intToBytes } from "./utils";
import ModMath from './mod-math' 
const { mod } = ModMath

export default class PublicKey {

    static from = (p: string | Point | Buffer) => {
        let normalizedBuffer: Buffer = Buffer.from([])

        if (p instanceof Point)
            return new PublicKey(p)
        else if (typeof p === 'string')
            normalizedBuffer = Buffer.from(p, 'hex')
        else if (p instanceof Buffer)
            normalizedBuffer = p as Buffer

        if ( 
            (normalizedBuffer.length !== PUBKEY_COMPRESSED_LENGTH && normalizedBuffer.length != PUBKEY_LENGTH) ||
            (normalizedBuffer.length === PUBKEY_COMPRESSED_LENGTH && (normalizedBuffer[0] !== 3 && normalizedBuffer[0] !== 2)) ||
            (normalizedBuffer.length === PUBKEY_LENGTH && normalizedBuffer[0] !== 4)
        )
            throw new Error("Wrong public key format.")

        const isCompressed = normalizedBuffer.length === PUBKEY_COMPRESSED_LENGTH
        if (isCompressed){
            /* 
                http://hyperelliptic.org/EFD/g1p/auto-shortw.html
                y^2 = x^3 + a*x + b
            */
            const x = bytesToInt(normalizedBuffer.subarray(1, PUBKEY_COMPRESSED_LENGTH))
            // y2 = x^3 + a * x + b
            const y2 = ModMath.weistrass(x)
            //y = √y2
            const y = ModMath.sqrt(y2)

            const isFirstByteOdd = normalizedBuffer[0] === 3
            const isYOdd = (y & _1n) === _1n;
            return new PublicKey(new Point(x, isFirstByteOdd === isYOdd ? y : mod(-y)))
        } else {
            const x = normalizedBuffer.subarray(1, PUBKEY_COMPRESSED_LENGTH)
            const y = normalizedBuffer.subarray(PUBKEY_COMPRESSED_LENGTH, PUBKEY_LENGTH)
            return new PublicKey(new Point(bytesToInt(x), bytesToInt(y)))
        }
    }

    constructor(private p: Point){}

    to = () => {
        const point = () => this.p
        const hex = (isCompressed = false) => {
            const p = point()
            const x = bytesToHex(intToBytes(p.x))
            if (isCompressed) {
                const prefix = p.y & _1n ? '03' : '02';
                return `${prefix}${x}`;
            }
            return `04${x}${bytesToHex(intToBytes(p.y))}`;
        }

        const bytes = (isCompressed = false) => Buffer.from(hex(isCompressed), 'hex')

        return {
            hex, bytes,
            point
        }
    }
}