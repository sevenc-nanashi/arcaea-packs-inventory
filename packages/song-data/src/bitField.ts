import { fromByteArray, toByteArray } from "base64-js";

export class BitField {
  private data: boolean[];
  private length: number;

  constructor(length: number) {
    this.length = length;
    this.data = new Array(length).fill(0);
  }

  get(index: number): boolean {
    if (index < 0 || index >= this.length) {
      throw new RangeError("Index out of bounds");
    }
    return this.data[index]!;
  }

  set(index: number, value: boolean): void {
    if (index < 0 || index >= this.length) {
      throw new RangeError("Index out of bounds");
    }
    this.data[index] = value;
  }

  getLength(): number {
    return this.length;
  }

  serialize(): string {
    const byteArray = new Uint8Array(Math.ceil(this.length / 8));
    for (let i = 0; i < this.length; i++) {
      if (this.data[i]) {
        byteArray[Math.floor(i / 8)]! |= 1 << (i % 8);
      }
    }
    return "1" + fromByteArray(byteArray);
  }
  static deserialize(serialized: string, length: number): BitField {
    if (serialized.startsWith("1")) {
      const byteArray = toByteArray(serialized.slice(1));
      const bitField = new BitField(length);
      for (let i = 0; i < length; i++) {
        const byteIndex = Math.floor(i / 8);
        const bitIndex = i % 8;
        if (byteIndex < byteArray.length) {
          bitField.set(i, (byteArray[byteIndex]! & (1 << bitIndex)) !== 0);
        }
      }
      return bitField;
    } else {
      throw new Error("Unsupported serialization format");
    }
  }
}
