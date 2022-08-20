import PublicKey from "./public-key";
import CryptoJS, {SHA512} from 'crypto-js'
import { bytesToInt } from "./utils";
import ModMath from "./mod-math";
import { CURVE } from "./constant";
import Point from "./point";

const { invert, mod } = ModMath

export default class Signature {

    static dataToHash = (d: string | Buffer) => {
        const normalized = d instanceof Buffer ? d.toString() : d
        return Buffer.from(SHA512(normalized).toString(CryptoJS.enc.Hex), 'hex').subarray(32, 64)
    }

    constructor(private r: bigint, private s: bigint) {}

    verify = (data: string, publickey: PublicKey) => {
        const { r, s } = this
        const hM = bytesToInt(Signature.dataToHash(data))
        const Q = publickey.to().point()
        
        const w = invert(s, CURVE.n)
        const u1 = mod(hM * w, CURVE.n)
        const u2 = mod(r * w, CURVE.n)
        const p = Point.SECP256K1.multiplyCT(u1).add(Q.multiplyCT(u2))

        return p.x === r
    }

}