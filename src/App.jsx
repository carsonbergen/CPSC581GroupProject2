import { useEffect, useState } from "react";
import Drawing from "./components/Drawing";
import { clamp } from "./components/utils";
import * as tmImage from "@teachablemachine/image";
import p5 from "p5";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import { twMerge } from "tailwind-merge";

export default function App() {
  const [predictions, setPredictions] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setLoading(false);
  }, [mounted]);

  const getPredictions = async (model) => {
    let canvas = document.getElementById("defaultCanvas0");
    let predictions = await model.predict(canvas);
    console.log(predictions);
    return predictions;
  };

  const unlockPhone = async () => {
    console.log("unlocking phone");
    setLoading(true);
    let model = await loadModel();
    let predictions = await getPredictions(model);
    setLoading(false);
  };

  if (!mounted) return null;

  return (
    <>
      <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js" />
      <script src="https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8.3/dist/teachablemachine-image.min.js" />

      {loading ? (
        <div className="text-black z-[10000] absolute top-0 left-0 backdrop-blur-md w-full h-full flex justify-center items-center">
          loading...
        </div>
      ) : null}

      <Drawing unlockPhone={unlockPhone} />
    </>
  );
}
