export enum Backend {
  // TF represents a TensorFlow backend
  TF = 'TF',
  // Torch represents a Torch backend
  Torch = 'TORCH',
  // ONNX represents an ONNX backend
  ONNX = 'ONNX',
  // TFLite represents a TensorFlow backend
  TFLite = 'TFLITE',
}

export const BackendMap = {
  TF: Backend.TF,
  TORCH: Backend.Torch,
  ORT: Backend.ONNX,
  TFLITE: Backend.TFLite,
};
