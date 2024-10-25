import { useEffect, useState } from "react";
import Drawing from "./components/Drawing";
import { clamp } from "./components/utils";
import * as tmImage from "@teachablemachine/image";
import p5 from "p5";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import { twMerge } from "tailwind-merge";
import Model from "./components/Model";

export default function App() {
  const [predictions, setPredictions] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [permissionsRequested, setPermissionsRequested] = useState(false);
  const [painting, setPainting] = useState(false);
  const [model, setModel] = useState(null);
  const [selectedColor, setSelectedColor] = useState('black');

  const loadModel = async () => {
    const URL = "/model/";
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    const weightsURL = URL + "weights.bin";

    const modelFile = new File(
      [await fetch(modelURL).then((res) => res.blob())],
      "model"
    );

    const metadataFile = new File(
      [await fetch(metadataURL).then((res) => res.blob())],
      "metadata"
    );

    const weightsFile = new File(
      [await fetch(weightsURL).then((res) => res.blob())],
      "weights.bin"
    );

    return await tmImage.loadFromFiles(modelFile, weightsFile, metadataFile);
  };

  const unlockPhone = async () => {
    let canvas = document.getElementById("defaultCanvas0");
    let predictions = await model.getPredictions(canvas);
    console.log(predictions);
    setPredictions(predictions);
  };

  useEffect(() => {
    const setup = async () => {
      setLoading(true);
      let loadedModel = await loadModel();
      let canvas = document.getElementById("defaultCanvas0");
      const model = new Model(loadedModel, canvas);
      setModel(model);
      setLoading(false);
    };
    setup();
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadPredictions = async () => {
      let canvas = document.getElementById("defaultCanvas0");
      await model.getPredictions(canvas);
    };
    if (model && !loading) {
      // loadPredictions();
    }
  }, [model]);

  return (
    <>
      <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js" />
      <script src="https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8.3/dist/teachablemachine-image.min.js" />

      {loading ? (
        <>
          <div className="absolute left-0 top-0 w-screen h-screen backdrop-blur-md z-[10000]">
            Loading
          </div>
        </>
      ) : null}

      <div
        className={twMerge(
          "absolute left-0 top-0 w-full h-full flex justify-end items-end pb-2 px-2 backdrop-blur-sm transition-all duration-300",
          `${permissionsRequested ? "opacity-0 z-[0]" : "opacity-100 z-[9999]"}`
        )}
      >
        {!permissionsRequested ? (
          <button
            className="w-full font-black uppercase"
            onClick={() => {
              if (
                typeof DeviceOrientationEvent.requestPermission === "function"
              ) {
                DeviceOrientationEvent.requestPermission();
                setPermissionsRequested(true);
              } else {
                setPermissionsRequested(true);
              }
            }}
          >
            Allow motion?
          </button>
        ) : null}
      </div>

      <div className="flex space-x-2 mb-4 justify-center z-[100]">
          <button
            onClick={() => setSelectedColor("black")}
            className={`w-8 h-8 border-2 rounded-full p-1 ${selectedColor === "black" ? "border-white" : "border-transparent"}`}
            style={{ backgroundColor: "black" }}
          />
          
          <button
            onClick={() => setSelectedColor("red")}
            className={`w-8 h-8 border-2 rounded-full p-1 ${selectedColor === "red" ? "border-white" : "border-transparent"}`}
            style={{ backgroundColor: "red" }}
          />
          
          <button
            onClick={() => setSelectedColor("blue")}
            className={`w-8 h-8 border-2 rounded-full p-1 ${selectedColor === "blue" ? "border-white" : "border-transparent"}`}
            style={{ backgroundColor: "blue" }}
          />
          
          <button
            onClick={() => setSelectedColor("green")}
            className={`w-8 h-8 border-2 rounded-full p-1 ${selectedColor === "green" ? "border-white" : "border-transparent"}`}
            style={{ backgroundColor: "green" }}
          />
        </div>

      <Drawing unlockPhone={unlockPhone} />
    </>
  );
}
