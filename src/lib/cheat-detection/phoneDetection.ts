// src/lib/cheat-detection/phoneDetection.ts
import * as ort from "onnxruntime-web";

let session: ort.InferenceSession | null = null;
let ready = false;

export async function loadPhoneModelIfAvailable(modelPath = "/models/yolo-tiny.onnx") {
  try {
    session = await ort.InferenceSession.create(modelPath, { executionProviders: ["wasm"] });
    ready = true;
  } catch (e) {
    console.warn("Phone detection model not found or failed to load:", e);
    ready = false;
  }
  return ready;
}

export async function detectPhoneFromImageData(imageData: ImageData) {
  if (!ready || !session) return { phone: false, score: 0 };
  // NOTE: Full YOLO post-processing (NMS, anchors) is non-trivial.
  // Placeholder: integrate a lightweight JS postprocessor specific to the exported ONNX model.
  // For now, return false and leave hook for you to implement model-specific postprocessing.
  return { phone: false, score: 0 };
}
