import { fromByteArray, toByteArray } from "base64-js";

export class SongField {
  private data: (0 | 1 | 2)[];
  private length: number;

  constructor(length: number) {
    this.length = length;
    this.data = new Array(length).fill(0);
  }

  get(index: number): 0 | 1 | 2 {
    if (index < 0 || index >= this.length) {
      throw new RangeError("Index out of bounds");
    }
    return this.data[index]!;
  }

  set(index: number, value: 0 | 1 | 2): void {
    if (index < 0 || index >= this.length) {
      throw new RangeError("Index out of bounds");
    }
    if (value < 0 || value > 2) {
      throw new RangeError("Value must be 0, 1, or 2");
    }
    this.data[index] = value;
  }

  getLength(): number {
    return this.length;
  }

  toString(): string {
    let value = BigInt(0);
    let base = BigInt(1);
    for (let i = 0; i < this.length; i++) {
      value += BigInt(this.data[i]!) * base;
      base *= BigInt(3);
    }
    const byteArray: number[] = [];
    while (value > 0) {
      byteArray.push(Number(value & BigInt(0xff)));
      value >>= BigInt(8);
    }
    return fromByteArray(new Uint8Array(byteArray));
  }

  static fromString(encoded: string, length: number): SongField {
    const byteArray = toByteArray(encoded);
    let value = BigInt(0);
    for (let i = byteArray.length - 1; i >= 0; i--) {
      value = (value << BigInt(8)) + BigInt(byteArray[i]!);
    }
    const field = new SongField(length);
    for (let i = 0; i < length; i++) {
      field.data[i] = Number(value % BigInt(3)) as 0 | 1 | 2;
      value /= BigInt(3);
    }
    return field;
  }
}
