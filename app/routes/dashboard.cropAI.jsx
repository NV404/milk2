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
      const imageUrl = window.URL.createObjectURL(file); // Correct URL reference
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
    <div>
      <h1>Teachable Machine Image Model - Upload Image</h1>

      {/* File input for image upload */}
      <input type="file" accept="image/*" onChange={handleImageUpload} />

      {/* Display uploaded image */}
      {uploadedImage && (
        <div>
          <img
            src={uploadedImage}
            alt="Uploaded"
            style={{ maxWidth: "400px" }}
          />
        </div>
      )}

      {/* Display predictions */}
      <div id="label-container">
        {predictions.map((pred, index) => (
          <div key={index}>
            {pred.className}: {pred.probability.toFixed(2)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeachableMachine;
