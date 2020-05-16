import { Dtype } from './dtype';

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
}
