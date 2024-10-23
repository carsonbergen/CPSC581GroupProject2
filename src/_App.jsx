import * as tmImage from "@teachablemachine/image";
import p5 from "p5";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

function clamp(num, lower, upper) {
  // Code from:
  // https://www.omarileon.me/blog/javascript-clamp
  return Math.min(Math.max(num, lower), upper);
}

function App() {
  const divRef = useRef(null);
  const URL = "/model/";
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [failed, setFailed] = useState(false);
  const [permissionsRequested, setPermissionsRequested] = useState(false);

  const [divRect, setDivRect] = useState({ width: 0, height: 0 });

  const [predictions, setPredictions] = useState([]);

  let model;

  // p5 values
  

  const updateRect = () => {
    let rect = divRef.current.getBoundingClientRect();
    if (rect) {
      setDivRect({
        width: rect.width,
        height: rect.height,
      });
      pos = {
        x: rect.width / 2,
        y: rect.height / 2,
      };
    }
  };

  async function init() {
    
  }

  

  const resetApp = () => {
    setUnlocked(false);
    setFailed(false);
    setLoading(false);
    drawing = false;
    shaking = false;
    done = false;
    shakeValue = 0;
    toErase = true;
  };

  const checkPasscode = async () => {
    await init()
    if (model) {
      let canvas = document.getElementById("defaultCanvas0");
      setPredictions(await model.predict(canvas));
    }
  };

  useEffect(() => {
    const setup = async () => {
      await init();
      setMounted(true);
      console.log('finished setup')
    }

    setup();
    updateRect();

    pos = { x: divRect.width / 2, y: divRect.height / 2 };

    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("resize", updateRect);
    };
  }, []);

  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        checkPasscode();
      }, 1);
    }
  }, [loading]);

  useEffect(() => {
    if (predictions.length > 0) {
      let highestProbabilityPrediction = predictions.reduce(
        (highest, prediction) =>
          highest.probability > prediction.probability ? highest : prediction
      );
      if (highestProbabilityPrediction.probability > 0.8) {
        setLoading(false);
        setUnlocked(true);
      } else {
        setLoading(false);
        setFailed(true);
      }
    }
  }, [predictions]);

  if (!model) return null;

  return (
    <>
      <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8.3/dist/teachablemachine-image.min.js"></script>

      {loading ? (
        <div className="text-black z-[10000] absolute top-0 left-0 backdrop-blur-md w-full h-full flex justify-center items-center">
          loading...
        </div>
      ) : null}

      {unlocked ? (
        <img
          className="z-[10000] absolute top-0 left-0 w-full h-full"
          src="/images/IMG_2019.png"
        ></img>
      ) : null}

      {failed ? (
        <div className="text-black z-[10000] absolute top-0 left-0 backdrop-blur-md w-full h-full flex justify-center items-center flex-col">
          failed
          <button
            className="text-white"
            onClick={() => {
              resetApp();
            }}
          >
            Try again
          </button>
        </div>
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


    </>
  );
}

export default App;
