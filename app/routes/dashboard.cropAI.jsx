import React, { useState, useEffect } from "react";
import * as tmImage from "@teachablemachine/image";

const TeachableMachine = () => {
  const URL = "/models/";
  const [model, setModel] = useState(null);
  const [maxPredictions, setMaxPredictions] = useState(0);
  const [predictions, setPredictions] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);

  // Initialize the model on component mount
  useEffect(() => {
    const loadModel = async () => {
      const modelURL = URL + "model.json";
      const metadataURL = URL + "metadata.json";

      try {
        const loadedModel = await tmImage.load(modelURL, metadataURL);
        setModel(loadedModel);
        setMaxPredictions(loadedModel.getTotalClasses());
      } catch (error) {
        console.error("Error loading the model:", error);
      }
    };

    loadModel();
  }, []);

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = window.URL.createObjectURL(file);
      setUploadedImage(imageUrl);
      predict(imageUrl);
    }
  };

  // Make predictions on the uploaded image
  const predict = async (imageUrl) => {
    if (!model) {
      console.error("Model is not loaded yet!");
      return; // Ensure the model is loaded
    }

    const imageElement = new Image(); // Use Image object to create image element
    imageElement.src = imageUrl;

    imageElement.onload = async () => {
      try {
        const prediction = await model.predict(imageElement);
        setPredictions(prediction);
      } catch (error) {
        console.error("Error during prediction:", error);
      }
    };

    imageElement.onerror = (error) => {
      console.error("Error loading the image:", error);
    };
  };

  return (
    <div className="flex flex-col items-center p-6 space-y-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800">
        Teachable Machine Image Model
      </h1>

      {/* File input for image upload */}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600"
      />

      {/* Display uploaded image */}
      {uploadedImage && (
        <div className="mt-4">
          <img
            src={uploadedImage}
            alt="Uploaded"
            className="w-96 max-w-full rounded shadow-md"
          />
        </div>
      )}

      {/* Display predictions */}
      <div id="label-container" className="mt-4 space-y-2">
        {predictions.map((pred, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded shadow-md text-gray-700 text-lg flex justify-between w-80"
          >
            <span>{pred.className}</span>
            <span>{(pred.probability * 100).toFixed(2)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeachableMachine;
