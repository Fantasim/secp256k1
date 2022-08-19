const _0n = BigInt(0);
const _1n = BigInt(1);
const _2n = BigInt(2);
const _3n = BigInt(3);
const _8n = BigInt(8);

const CURVE = Object.freeze({
  // Params: a, b
  a: _0n,
  b: BigInt(7),
  // Field over which we'll do calculations. Verify with:
  //   console.log(CURVE.P === (2n**256n - 2n**32n - 977n))
  P: BigInt('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f'),
  // Curve order, total count of valid points in the field. Verify with:
  //   console.log(CURVE.n === (2n**256n - 432420386565659656852420866394968145599n))
  n: BigInt('0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141'),
  // Cofactor. It's 1, so other subgroups don't exist, and default subgroup is prime-order
  h: _1n,
  // Base point (x, y) aka generator point
  Gx: BigInt('55066263022277343669578718895168534326250603453777594175500187360389116729240'),
  Gy: BigInt('32670510020758816978083085130507043184471273380659243275938904335757337482424'),
});

class ModMath {

  static mod = (a: bigint, b = CURVE.P) => {
    const result = a % b
    return result >= 0 ? result : result + b
  }

  static invert = (a: bigint, b: bigint): bigint => {
    if (a === 0n || b <= _0n){
      throw new Error(`invert: expected positive integers, got n=${a} mod=${b}`);
    }

    let r1 = b
    let r2 = a
    let t1 = _0n
    let t2 = _1n
    let t: bigint
    let r: bigint

    while (r2 > 0){
      let q = r1 / r2
      r = r1 % r2
      t = t1 - (q * t2)

      r1 = r2
      r2 = r
      t1 = t2
      t2 = t
    }
    if (r1 !== _1n){
      throw new Error(`invert doesn't not exist on ${a.toString()}`)
    }
    return ModMath.mod(t1, b)
  }
}

const hexToNumber = (hex: string) => BigInt(`0x${hex}`)
const bytesToHex = (b: Buffer) => b.toString('hex')

class PrivateKey {

  static random = () => {
    const ret: number[] = []
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
