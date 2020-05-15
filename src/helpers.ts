export class Helpers {
  /**
   * Returns the index of the first occurrence of the maximum value along an array.
   * @param arr
   */
  argmax(arr): number {
    let index = 0;
    let value = arr[0];

    arr.forEach((item, key) => {
      if (item > value) {
        value = item;
        index = key;
      }
    });

    return index;
  }

  /**
   * TODO: document
   * @param buffer
   */
  normalizeRGB(buffer: Float32Array): Float32Array {
    const npixels = buffer.length / 4;
    const out = new Float32Array(npixels * 3);

    for (let i = 0; i < npixels; i++) {
      out[3 * i] = buffer[4 * i] / 128 - 1;
      out[3 * i + 1] = buffer[4 * i + 1] / 128 - 1;
      out[3 * i + 2] = buffer[4 * i + 2] / 128 - 1;
    }

    return out;
  }

  /**
   * TODO: document
   * @param buffer
   */
  bufferToFloat32Array(buffer: Buffer): Float32Array {
    const outArray = new Float32Array(buffer.length / 4);
    for (let i = 0; i < outArray.length; i++) {
      outArray[i] = buffer.readFloatLE(4 * i);
    }
    return outArray;
  }
}
