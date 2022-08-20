import { BITS, CURVE, _0n, _1n, _2n, _3n } from "./constant";
import ModMath from "./mod-math";
const { mod, invert } = ModMath

export default class Point {

    static SECP256K1 = new Point(CURVE.Gx, CURVE.Gy)
    static ZERO = new Point(_0n, _0n)

    private precomputes: Point[] = []

    constructor(public x: bigint, public y: bigint){}
    //http://hyperelliptic.org/EFD/g1p/auto-shortw.html
    add = (p: Point) => {   
        const [y1, x1, y2, x2] = [this.y, this.x, p.y, p.x]
        if (x1 === 0n || y1 === 0n) return p;
        if (x2 === 0n || y2 === 0n) return this;
        if (x1 === x2 && y1 === y2) return this.double();
        if (x1 === x2 && y1 === -y2) return Point.ZERO;

        /*
            x3 = (y2-y1)^2 / (x2-x1)^2 - x1 - x2
            y3 = (2*x1+x2) * (y2-y1) / (x2-x1) - (y2-y1)^3 / (x2-x1)^3 - y1
        */
        const rep = mod((y2 - y1) * invert(x2 - x1))
        const x3 = mod(rep * rep - x1 - x2);
        const y3 = mod((_2n * x1 + x2) * rep - (rep ** _3n) - y1)

        return new Point(x3, y3)
    }
    //http://hyperelliptic.org/EFD/g1p/auto-shortw.html
    double = () => {
        const { x, y } = this
        const { a } = CURVE
        /*
            x2 = (3 * x1^2 + a)^2 / (2 * y1)^2 - x1 - x1
            y2 = (2 * x1 + x1) * (3 * x1^2 + a) / (2 * y1) - (3 * x1^2 + a)^3 / (2 * y1)^3 - y1
        */
        const rep1 = mod(_3n * x ** _2n + a)
        const rep2 = mod(_2n * y)
        const rep3 = mod(rep1 * invert(rep2))

       const x2 = rep3 ** _2n - _2n * x
       const y2 = (_3n * x) * rep3 - (rep3 ** _3n) - y

       return new Point(x2, y2)
    }

    getPrecomputes = () => {
        if (this.precomputes.length) 
            return this.precomputes;
        this.precomputes = [];
        let dbl: Point = this;
        for (let i = 0; i < BITS; i++) {
          this.precomputes.push(dbl);
          dbl = dbl.double();
        }
        return this.precomputes;
    }
      
    //https://en.wikipedia.org/wiki/Elliptic_curve_point_multiplication
    multiplyCT = (n: bigint) => {
        let ret = Point.ZERO
        let fake = Point.ZERO

        const dbls = this.getPrecomputes()
        for (let i = 0; i < BITS; i++){
            if (n & _1n)
                ret = ret.add(dbls[i]) 
            else 
                fake = fake.add(dbls[i])
            n >>= _1n
        }
        return ret
    }
}