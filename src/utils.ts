export const hexToNumber = (hex: string) => BigInt(`0x${hex}`)
export const bytesToHex = (b: Buffer) => b.toString('hex')