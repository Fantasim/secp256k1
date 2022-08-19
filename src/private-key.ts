import { _0n } from './constant'
import ModMath from './mod-math'
import { hexToNumber, bytesToHex } from './utils'

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
          this._p = ModMath.mod(hexToNumber(bytesToHex(p)))
      } else {
        this._p = ModMath.mod(p)
      }
    }
    get = () => this._p
}