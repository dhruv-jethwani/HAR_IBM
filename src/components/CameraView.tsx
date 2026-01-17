import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { io } from 'socket.io-client';

const socket = io("http://127.0.0.1:5000", { transports: ["websocket"] });

const CameraView: React.FC = () => {
  const webcamRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activity, setActivity] = useState("Initializing...");

  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.onResults((results) => {
      if (!canvasRef.current || !webcamRef.current?.video) return;
      const ctx = canvasRef.current.getContext('2d')!;
      ctx.clearRect(0, 0, 640, 480);
      
      if (results.poseLandmarks) {
        drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {color: '#00FF00'});
        drawLandmarks(ctx, results.poseLandmarks, {color: '#FF0000', radius: 1});
        socket.emit("send_skeleton", results.poseLandmarks);
      }
    });

    const interval = setInterval(async () => {
      if (webcamRef.current?.video) await pose.send({ image: webcamRef.current.video });
    }, 100);

    socket.on("activity_result", (data) => setActivity(data.label));
    return () => { clearInterval(interval); socket.off("activity_result"); };
  }, []);

  return (
    <div className="relative w-[640px] h-[480px] rounded-2xl border-4 border-slate-800 overflow-hidden shadow-2xl">
      <Webcam 
        ref={webcamRef} 
        className="absolute inset-0 w-full h-full object-cover" 
        {...({ mirrored: true } as any)} 
      />
      <canvas ref={canvasRef} width={640} height={480} className="absolute inset-0 w-full h-full" />
      <div className="absolute top-4 left-4 bg-black/60 p-4 rounded-xl backdrop-blur-md border border-white/10">
        <h2 className="text-2xl font-black">{activity}</h2>
      </div>
    </div>
  );
};

export default CameraView;