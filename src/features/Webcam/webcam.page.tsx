import React, { useEffect, useRef, useState } from "react";
import { styled } from "../../theme";
import faceApi, { createCanvasFromMediaUser } from "../../lib/faceApi";

type DeviceKind = "videoinput" | "audioinput" | string;

type Device = {
  deviceId: string;
  groupId: string;
  kind: DeviceKind;
  label: string;
};

const Flex = styled("div", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  width: "100%",

  variants: {
    direction: {
      row: {
        flexDirection: "row",
      },
      column: {
        flexDirection: "column",
      },
    },
  },
});

const DISPLAY_SIZE = {
  width: 600,
  height: 600,
};

export function WebcamPage() {
  const navigatorRef = useRef(navigator);

  const [devices, setDevices] = useState<Device[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const canRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    navigatorRef.current?.mediaDevices.enumerateDevices().then((devices) => {
      setDevices(devices);
    });
  }, []);

  async function startRecord() {
    try {
      const stream = await navigatorRef.current?.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (canRef.current) {
        canRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async function stopRecord() {
    if (canRef?.current) {
      canRef.current.srcObject = null;
      setIsStreaming(false);
      canvasRef.current.innerHTML = "";
    }
  }

  async function detectionsFaces() {
    if (!canRef.current || !canvasRef.current) return;

    const can = canRef.current;
    const canvas = canvasRef.current;

    canvasRef.current.innerHTML = faceApi.createCanvasFromMedia(can) as any;

    faceApi.matchDimensions(canvasRef.current, DISPLAY_SIZE);

    const results = await faceApi
      .detectSingleFace(can, new faceApi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    const resizeDetections = faceApi.resizeResults(results, DISPLAY_SIZE);

    canvas
      .getContext("2d")
      .clearRect(0, 0, DISPLAY_SIZE.width, DISPLAY_SIZE.height);

    const detections = [
      faceApi.draw.drawDetections,
      faceApi.draw.drawFaceExpressions,
      faceApi.draw.drawFaceLandmarks,
    ];

    detections.forEach((draw) => draw(canvas, resizeDetections));

    console.log("detectionsFaces", resizeDetections);
  }

  useEffect(() => {
    if (!canRef?.current) return;

    const can = canRef.current;

    return () => {
      can.removeEventListener("play", () => null);
    };
  }, []);

  useEffect(() => {
    if (!isStreaming) return;

    const listener = setInterval(detectionsFaces, 100);

    return () => {
      clearInterval(listener);
    };
  }, [isStreaming]);

  return (
    <Flex>
      {devices.map((device) => (
        <div key={device.deviceId}>{device.label}</div>
      ))}

      <br />

      <button onClick={isStreaming ? stopRecord : startRecord}>
        {isStreaming ? "Stop record" : "Start record"}
      </button>

      <Flex style={{ marginTop: 100 }}>
        <video
          ref={canRef}
          autoPlay
          playsInline
          muted
          width={DISPLAY_SIZE.width}
          height={DISPLAY_SIZE.height}
        />

        <canvas
          width={DISPLAY_SIZE.width}
          height={DISPLAY_SIZE.height}
          ref={canvasRef}
        ></canvas>
      </Flex>
    </Flex>
  );
}
