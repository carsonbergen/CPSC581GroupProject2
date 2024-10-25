import { useEffect, useState } from "react";
import Drawing from "./components/Drawing";
import { clamp } from "./components/utils";
import * as tmImage from "@teachablemachine/image";
import p5 from "p5";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import { twMerge } from "tailwind-merge";
import Model from "./components/Model";
import { Password } from "@phosphor-icons/react";
import HomeScreen from "./components/HomeScreen";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [permissionsRequested, setPermissionsRequested] = useState(false);
  const [model, setModel] = useState(null);
  const [selectedColor, setSelectedColor] = useState("black");
  const [defaultPassword, setDefaultPassword] = useState([
    "black",
    "Blank",
    "black",
    "Blank",
  ]);
  const [currentPassword, setCurrentPassword] = useState([]);
  const [step, setStep] = useState(0);
  const [correctPassword, setCorrectPassword] = useState(false);

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

  const resetApp = () => {
    setSelectedColor("black");
    setCurrentPassword([]);
    setStep(0);
    setCorrectPassword(false);
    console.log('reset app');
  };

  const unlockPhone = async () => {
    console.log(defaultPassword, currentPassword, step);
    let canvas = document.getElementById("defaultCanvas0");
    let predictions = await model.getPredictions(canvas);
    let newCurrentPassword = currentPassword;
    let currentStep = step;
    const highestProbability = predictions.reduce((highest, current) =>
      current.probability > highest.probability ? current : highest
    );
    if (currentStep < 2) {
      newCurrentPassword.push(selectedColor, highestProbability.className);
      setCurrentPassword(newCurrentPassword);
    }
    if (currentStep >= 2) {
      for (let i = 0; i < 4; i++) {
        if (defaultPassword[i] != currentPassword[i]) {
          resetApp();
          return;
        }
      }
    }
    currentStep = currentStep + 1;
    setStep(currentStep);
    if (newCurrentPassword.length == 4 && currentStep == 3) {
      setCorrectPassword(true);
    }
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
  }, []);

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

      <Drawing
        unlockPhone={unlockPhone}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        step={step}
      />

      <div
        className={twMerge(
          `absolute left-0 top-0 w-screen h-screen bg-black flex justify-center items-center`,
          `${correctPassword ? "opacity-100 z-[10000]" : "opacity-0 z-0"}`
        )}
      >
        <HomeScreen
          setPassword={(password) => {
            setDefaultPassword(password);
          }}
          resetApp={resetApp}
        />
      </div>
    </>
  );
}
