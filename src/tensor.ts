import {DType} from "./DType";

/**
 * Direct mapping to RedisAI Tensors - represents an n-dimensional array of values
 */
export class Tensor {
    constructor(
        dtype: DType,
        shape: number[],
        data: number[] | null) {
        this._shape = shape;
        this._dtype = dtype;
        if (data != null) {
            this._data = data;
        }
    }

    private _dtype: DType;

    get dtype(): DType {
        return this._dtype;
    }

    set dtype(value: DType) {
        this._dtype = value;
    }

    private _shape: number[];

    get shape(): number[] {
        return this._shape;
    }

    set shape(value: number[]) {
        this._shape = value;
    }

    private _data: number[] | null;

    get data(): number[] | null {
        return this._data;
    }

    set data(value: number[] | null) {
        this._data = value;
    }

}