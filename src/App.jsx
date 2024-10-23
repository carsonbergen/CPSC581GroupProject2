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

  let model;

  useEffect(() => {
    const initializeModel = async () => {
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

      model = await tmImage.loadFromFiles(modelFile, weightsFile, metadataFile);
    };

    const setup = async () => {
        // setTimeout(await initializeModel(), 1);

        setMounted(true);
    }

    setup();
  }, []);

  if (!mounted) {
    return <div className="animate-bounce duration-150">Loading...</div>;
  }

  return (
    <>
      <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js" />
      <script src="https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8.3/dist/teachablemachine-image.min.js" />

      <Drawing />
    </>
  );
}
