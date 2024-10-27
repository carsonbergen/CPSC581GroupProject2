import { useEffect, useState } from "react";
import Drawing from "./components/Drawing";
import { clamp } from "./components/utils";
import * as tmImage from "@teachablemachine/image";
import p5 from "p5";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import { twMerge } from "tailwind-merge";
import Model from "./components/Model";
import { Eye, EyeSlash, Password } from "@phosphor-icons/react";
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
  const [incorrectPassword, setIncorrectPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    setIncorrectPassword(false);
    console.log("reset app");
  };

  const unlockPhone = async () => {
    let canvas = document.getElementById("defaultCanvas0");
    let predictions = await model.getPredictions(canvas);
    let newCurrentPassword = currentPassword;
    let currentStep = step;
    const highestProbability = predictions.reduce((highest, current) =>
      current.probability > highest.probability ? current : highest
    );
    if (currentStep < 2 && currentPassword.length < 4) {
      console.log("adding to password");
      newCurrentPassword.push(selectedColor, highestProbability.className);
      setCurrentPassword(newCurrentPassword);
    }
    if (currentStep >= 2) {
      for (let i = 0; i < 4; i++) {
        if (defaultPassword[i] != currentPassword[i]) {
          setIncorrectPassword(true);
          return;
        }
      }
    }
    currentStep = currentStep + 1;
    setStep(currentStep);
    if (newCurrentPassword.length == 4 && currentStep >= 3) {
      console.log("correct password");
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
      console.log('done setup');
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
            className="w-full font-black uppercase bg-[#181818] p-2 rounded-md border border-[#383838]"
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
          `${incorrectPassword ? "opacity-100 z-[10000] translate-y-[0vh]" : "opacity-0 z-0 translate-y-[100vh]"}`,
          `transition-all duration-200`
        )}
      >
        <div className="flex flex-col w-full h-full p-4 pt-12 space-y-2">
          <h1 className="text-lg font-black">Wrong password!</h1>
          <span>Password entered:</span>
          <div>
            <div className="flex flex-row w-full justify-center items-center">
              {currentPassword.map((el, i) => (
                <input
                  type={showPassword ? "text" : "password"}
                  disabled
                  key={el + i}
                  className="
                    w-full mx-2 bg-[#181818] text-white 
                    px-1 py-2 rounded-lg capitalize shadow-[#140a14] 
                    shadow-inner shadow-[#000000]
                    justify-center items-center text-center
                  "
                  value={el}
                />
              ))}
              <button
                className=""
                onClick={() => {
                  setShowPassword(!showPassword);
                }}
              >
                {showPassword ? (
                  <Eye className="w-8 h-8 min-w-8"></Eye>
                ) : (
                  <EyeSlash className="w-8 h-8" />
                )}
              </button>
            </div>
          </div>
          <button className="bg-[#181818] p-2 rounded-md border border-[#383838]" onClick={() => resetApp()}>Try again?</button>
        </div>
      </div>

      <div
        className={twMerge(
          `absolute left-0 top-0 w-screen h-screen bg-black flex justify-center items-center`,
          `${correctPassword ? "opacity-100 z-[10000] translate-y-[0vh]" : "opacity-0 z-0 translate-y-[100vh]"}`,
          `transition-all duration-200`
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
