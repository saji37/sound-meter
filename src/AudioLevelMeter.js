// AudioLevelMeter.js
import React, { useState, useEffect } from "react";
import "./AudioLevelMeter.css"; // Import a CSS file for styling

const AudioLevelMeter = () => {
  const [calculator, setCalculator] = useState(0);
  let mic;
  let analyser;
  let audioContext;

  useEffect(() => {
    const setupAudio = async () => {
      try {
        // Request permission to use the microphone
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        // Create AudioContext
        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Create a MediaStreamSourceNode from the microphone stream
        mic = audioContext.createMediaStreamSource(stream);

        // Create an analyser node to analyze the audio data
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.4;

        // Connect the mic to the analyser
        mic.connect(analyser);

        // const threshold = 0.2; // Adjust this threshold based on your audio
        // const gainNode = audioContext.createGain();
        // gainNode.gain.value = 1;
        // analyser.connect(gainNode);

        // Set up audio processing logic (e.g., calculating audio levels)
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const intervalId = setInterval(() => {
          analyser.getByteFrequencyData(dataArray);
          const average = calculateAverage(dataArray);
          // console.log(average)
          // gainNode.gain.value = average > threshold ? 1 : 0;
          setCalculator((average * 100) / 255);
        }, 20);

        return () => {
          clearInterval(intervalId);
          mic.disconnect();
          analyser.disconnect();
          audioContext.close();
          stream.getTracks().forEach((track) => track.stop());
        };
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    };

    setupAudio();
  }, []);

  const calculateAverage = (array) => {
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
      sum += array[i];
    }
    return sum / array.length;
  };
  return (
    <div className="container">
      <div className="meter">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className={"bar" + index}
            style={{
              backgroundColor: "white",
              height: `${
                calculator > 10
                  ? calculator + (index === 0 || index === 2 ? 0 : 8)
                  : 15
              }%`, // Adjust the constant (10) to control the spacing between bars
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AudioLevelMeter;