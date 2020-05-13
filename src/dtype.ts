export enum Dtype {
  float32 = 'FLOAT',
  double64 = 'DOUBLE',
  int8 = 'INT8',
  int16 = 'INT16',
  int32 = 'INT32',
  int64 = 'INT64',
  uint8 = 'UINT8',
  uint16 = 'UINT16',
}

export const DTypeMap = {
  FLOAT: Dtype.float32,
  DOUBLE: Dtype.double64,
  INT8: Dtype.int8,
  INT16: Dtype.int16,
  INT32: Dtype.int32,
  INT64: Dtype.int64,
  UINT8: Dtype.uint8,
  UINT16: Dtype.uint16,
};
