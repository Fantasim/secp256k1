import { BITS, _0n, _1n, _2n } from "./constant";
export const hexToNumber = (hex: string) => BigInt(`0x${hex}`)
export const bytesToHex = (b: Buffer) => b.toString('hex')
export const bytesToInt = (b: Buffer) => BigInt('0x' + bytesToHex(b)).valueOf()
export const intToBytes = (b: BigInt | number) => {
    if (b > _2n ** BigInt(BITS)) throw new Error(`Expected number < 2^${BITS}`);
    return Buffer.from(b.toString(16).padStart(64, '0'), 'hex')
}
export const intToBinary = (num: bigint) => {
    let n = num
    if (n < _0n)
        throw new Error("expected greater than 0")
    if (n < _2n)
        return [n === _1n]
    let binary: boolean[] = [];
    binary.push(n % _2n === _1n)
    while (n > 0){
        n = n / _2n
        const bool = (n % _2n) === _1n
        binary = [bool].concat(binary)
    }
    return binary.slice(1, binary.length)
}
