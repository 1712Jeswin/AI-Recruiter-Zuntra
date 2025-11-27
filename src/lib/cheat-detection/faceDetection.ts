// src/lib/cheat-detection/faceDetection.ts
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import * as blazeface from "@tensorflow-models/blazeface";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";

export type FaceDetectionResult = {
  faces: Array<any>; // raw face boxes
  landmarks?: any; // landmarks for first face
};

let blazeModel: blazeface.BlazeFaceModel | null = null;
let landmarkModel: faceLandmarksDetection.FaceLandmarksDetector | null = null;

export async function loadFaceModels() {
  if (!blazeModel) {
    await tf.setBackend("webgl");
    blazeModel = await blazeface.load();
  }
  if (!landmarkModel) {
    landmarkModel = await faceLandmarksDetection.createDetector(
      faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
      { runtime: "tfjs", refineLandmarks: true }
    );
  }
}

export async function detectFaces(videoEl: HTMLVideoElement): Promise<FaceDetectionResult> {
  if (!blazeModel) throw new Error("Blaze model not loaded");
  const returnTensors = false;
  const predictions = await blazeModel.estimateFaces(videoEl, returnTensors);
  const res: FaceDetectionResult = { faces: predictions || [] };

  // for gaze/head pose use landmark model for the first face
  if (predictions && predictions.length > 0 && landmarkModel) {
    try {
      const lm = await landmarkModel.estimateFaces(videoEl, { flipHorizontal: false });
      // lm is an array — take first
      if (lm && lm.length > 0) {
        res.landmarks = lm[0];
      }
    } catch (e) {
      // ignore landmark errors
    }
  }
  return res;
}

/**
 * Heuristic: compute approximate head yaw using keypoints
 * returns yawAngle in degrees (negative = left, positive = right)
 */
export function estimateYaw(landmarks: any): number | null {
  if (!landmarks || !landmarks.keypoints) return null;
  const kp = landmarks.keypoints;
  // use left eye outer (33) and right eye outer (263) and nose tip (1)
  const leftEye = kp[33];
  const rightEye = kp[263];
  const nose = kp[1];

  if (!leftEye || !rightEye || !nose) return null;

  // compute horizontal offset from nose to midpoint of eyes
  const midEyeX = (leftEye.x + rightEye.x) / 2;
  const dx = nose.x - midEyeX; // normalized coords
  // smaller/more negative means looking left, positive means looking right
  // scale to degrees roughly
  const yaw = dx * 180; // heuristic scaling
  return yaw;
}
