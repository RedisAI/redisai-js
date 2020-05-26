import { Dtype, DTypeMap } from './dtype';

/**
 * Direct mapping to RedisAI Tensors - represents an n-dimensional array of values
 */
export class Tensor {
  /**
   *  Creates a tensor - represents an n-dimensional array of values
   * @param dtype the tensor's data type
   * @param shape one or more dimensions, or the number of elements per axis, for the tensor
   * @param data numeric data provided by one or more subsequent val arguments
   */
  constructor(dtype: Dtype, shape: number[], data: Buffer | number[] | null) {
    this._shape = shape;
    this._dtype = dtype;
    if (data != null) {
      this._data = data;
    }
  }

  private _dtype: Dtype;

  get dtype(): Dtype {
    return this._dtype;
  }

  set dtype(value: Dtype) {
    this._dtype = value;
  }

  private _shape: number[];

  get shape(): number[] {
    return this._shape;
  }

  set shape(value: number[]) {
    this._shape = value;
  }

  private _data: Buffer | number[];

  get data(): Buffer | number[] | null {
    return this._data;
  }

  set data(value: Buffer | number[] | null) {
    this._data = value;
  }
  //
  public tensorSetFlatArgs(keName: string): any[] {
    const args: any[] = [keName, this.dtype];
    this.shape.forEach((value) => args.push(value.toString()));
    if (this.data != null) {
      if (this.data instanceof Buffer) {
        args.push('BLOB');
        args.push(this.data);
      } else {
        args.push('VALUES');
        this.data.forEach((value) => args.push(value.toString()));
      }
    }
    return args;
  }

  static NewTensorFromTensorGetReply(reply: any[]) {
    let dt = null;
    let shape = null;
    let values = null;
    for (let i = 0; i < reply.length; i += 2) {
      const key = reply[i];
      const obj = reply[i + 1];
      switch (key.toString()) {
        case 'dtype':
          dt = DTypeMap[obj.toString()];
          break;
        case 'shape':
          shape = obj;
          break;
        case 'values':
          values = obj.map(Number);
          break;
      }
    }
    if (dt == null || shape == null || values == null) {
      const missingArr = [];
      if (dt == null) {
        missingArr.push('dtype');
      }
      if (shape == null) {
        missingArr.push('shape');
      }
      if (values == null) {
        missingArr.push('values');
      }
      throw Error(
        'AI.TENSORGET reply did not had the full elements to build the Tensor. Missing ' + missingArr.join(',') + '.',
      );
    }
    return new Tensor(dt, shape, values);
  }

  static tensorGetFlatArgs(keyName: string): any[] {
    const args: any[] = [keyName, 'META', 'VALUES'];
    return args;
  }
}
