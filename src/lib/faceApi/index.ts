import * as faceApi from "face-api.js";

export async function loadModels() {
  const modelPath = "./assets/models";

  const modelsLoaders = [
    faceApi.nets.faceLandmark68Net,
    faceApi.nets.faceLandmark68TinyNet,
    faceApi.nets.faceRecognitionNet,
    faceApi.nets.tinyFaceDetector,
    faceApi.nets.faceExpressionNet,
  ];

  return Promise.all(
    modelsLoaders.map((loader) => loader.loadFromUri(modelPath))
  );
}

export async function createCanvasFromMediaUser(el: HTMLVideoElement) {
  return faceApi.createCanvasFromMedia(el);
}

export async function loadLabels() {
  const images = 6;

  const labels = ["Davi_Ribeiro"];

  const detectionsList: Float32Array[] = [];

  return Promise.all(
    labels.map(async (label) => {
      for (let i = 1; i <= images; i++) {
        const img = await faceApi.fetchImage(`./assets/labels/${i}.jpg`);
        const detections = await faceApi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();

        detectionsList.push(detections.descriptor);
      }
      return new faceApi.LabeledFaceDescriptors(label, detectionsList);
    })
  );
}

export default faceApi;
