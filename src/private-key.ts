import { CURVE, _0n } from './constant'
import ModMath from './mod-math'
import Point from './point'
import PublicKey from './public-key'
import { hexToNumber, bytesToHex, bytesToInt } from './utils'
import Signature from './signature'
const { mod, invert } = ModMath

export default class PrivateKey {

    static random = () => {
      const ret: number[] = []
      //32 bytes "random" buffer as a private key
      for (let i = 0; i < 32; i++){
        ret.push(Math.random() * 255)
      }
      return new PrivateKey(Buffer.from(ret))
    }
  
    private _p: bigint = _0n
    constructor(p: bigint | Buffer){
      if (p instanceof Buffer) {
          this._p = mod(hexToNumber(bytesToHex(p)))
      } else {
        this._p = mod(p)
      }
    }

    get = () => this._p
    publicKey = () => new PublicKey(Point.SECP256K1.multiplyCT(this._p))

    /*
      sign(m, d, k) where
        m = message to sign and h(m) is its hash converted to number
        d = private key converted to number
        k = random number
      (x1, y1) = G × k
      r = x1 mod n
      s = (k**-1 * (h(m) + d * r) mod n
    */
    sign = (data: string | Buffer) => {
      const k = PrivateKey.random().get()
      const R = Point.SECP256K1.multiplyCT(k)
      const r = mod(R.x, CURVE.n)
      const d = this.get()

      const hM = bytesToInt(Signature.dataToHash(data))
      //s = (1/k * (h(m) + d * r) mod n
      const s = mod(invert(k, CURVE.n) * mod(hM + d * r, CURVE.n), CURVE.n)
      return new Signature(r, s)
    }

}