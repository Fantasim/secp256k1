import { CURVE, _0n, _1n } from './constant'

export default class ModMath {

    static mod = (a: bigint, b = CURVE.P) => {
      const result = a % b
      return result >= 0 ? result : result + b
    }
  
    static invert = (a: bigint, b = CURVE.P): bigint => {
      if (a === 0n || b <= _0n){
        throw new Error(`invert: expected positive integers, got n=${a} mod=${b}`);
      }
  
      let r2 = ModMath.mod(a, b)
      let r1 = b

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