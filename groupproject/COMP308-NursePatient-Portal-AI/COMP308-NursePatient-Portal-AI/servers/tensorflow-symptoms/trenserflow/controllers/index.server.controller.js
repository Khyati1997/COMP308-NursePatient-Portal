// // const tf = require("@tensorflow/tfjs");
// // const fs = require("fs");
// // const path = require("path");
// const tf = require('@tensorflow/tfjs');
// require('@tensorflow/tfjs-node-cpu');
// // Change the imports at the top of the file
// const tf = require('@tensorflow/tfjs');
// // Remove or comment out the tfjs-node import
// // require("@tensorflow/tfjs-node");
// const fs = require("fs");
// const path = require("path");

// const dataset = require("../dataset.json");
// const datasetTesting = require("../dataset-testing.json");

// const modelDir = path.join(__dirname, "../models");
// const modelPath = path.join(modelDir, "tensorflow");

// async function trainModel() {
//   console.log("training data: ");

//   // Step 1: Extract unique symptoms
//   const allSymptoms = [
//     ...new Set(
//       dataset.flatMap((item) =>
//         item.symptoms.split(",").map((symptom) => symptom.trim())
//       )
//     ),
//   ];

//   console.log("allSymptoms: ", allSymptoms);

//   // Step 2: Create training data as binary vectors
//   const trainingData = tf.tensor2d(
//     dataset.map((item) =>
//       allSymptoms.map((symptom) => (item.symptoms.includes(symptom) ? 1 : 0))
//     )
//   );

//   // Generate a list of risk levels
//   const riskLevels = ["low", "medium", "high"];

//   const cleanRiskLevel = (dataset) => {
//     return dataset.map((item) => {
//       if (item["risk level"].toLowerCase().includes("low")) {
//         item["risk level"] = "low";
//       } else if (item["risk level"].toLowerCase().includes("high")) {
//         item["risk level"] = "high";
//       } else {
//         item["risk level"] = "medium";
//       }
//       return item;
//     });
//   };

//   cleanRiskLevel(dataset);

//   // Map each disease to its one-hot encoded vector
//   const outputData = tf.tensor2d(
//     dataset.map((item) =>
//       riskLevels.map((risk) => (item["risk level"] === risk ? 1 : 0))
//     )
//   );

//   // Build the model
//   const model = tf.sequential();

//   // Input layer
//   model.add(
//     tf.layers.dense({
//       inputShape: [trainingData.shape[1]], // Number of symptoms (e.g., 289)
//       units: 64,
//       activation: "relu",
//     })
//   );

//   // Hidden layers
//   model.add(
//     tf.layers.dense({
//       units: 128,
//       activation: "relu",
//     })
//   );

//   // Output layer
//   model.add(
//     tf.layers.dense({
//       units: outputData.shape[1], // Number of diseases (e.g., 88)
//       activation: "softmax",
//     })
//   );

//   let learning_rate = 0.06;

//   // Compile the model
//   model.compile({
//     optimizer: tf.train.adam(learning_rate),
//     loss: "categoricalCrossentropy",
//     metrics: ["accuracy"],
//   });

//   console.log(model.summary());

//   const startTime = Date.now();

//   // Train the model
//   await model.fit(trainingData, outputData, {
//     epochs: 2000, // Experiment with the number of epochs
//     callbacks: {
//       // Callbacks for monitoring training progress
//       onEpochEnd: async (epoch, log) => {
//         const elapsedTime = Date.now() - startTime;
//         console.log(
//           `Epoch ${epoch}: loss = ${log.loss}, elapsed time = ${elapsedTime}ms`
//         );
//       },
//     },
//   });

//   // Ensure the model directory exists
//   const modelSaveDir = path.dirname(modelPath);
//   if (!fs.existsSync(modelSaveDir)) {
//     console.log("Creating model directory");
//     fs.mkdirSync(modelSaveDir, { recursive: true });
//   }

//   // Save the model
//   await model.save(`file://${modelPath}`);
//   console.log("Model saved to", modelPath);
// }

// // async function loadModel() {
// //   if (fs.existsSync(modelPath)) {
// //     const model = await tf.loadLayersModel(`file://${modelPath}/model.json`);
// //     console.log("Model loaded from", modelPath);
// //     return model;
// //   } else {
// //     console.log("Model not found, training a new one...");
// //     await trainModel();
// //     return await tf.loadLayersModel(`file://${modelPath}`);
// //   }
// // }
// async function loadModel() {
//   if (fs.existsSync(path.join(modelPath, "model.json"))) {
//     try {
//       const model = await tf.loadLayersModel(`file://${modelPath}/model.json`);
//       console.log("Model loaded from", modelPath);
//       return model;
//     } catch (error) {
//       console.error("Error loading model:", error);
//       console.log("Training new model due to loading error...");
//       await trainModel();
//       return await tf.loadLayersModel(`file://${modelPath}/model.json`);
//     }
//   } else {
//     console.log("Model not found, training a new one...");
//     await trainModel();
//     return await tf.loadLayersModel(`file://${modelPath}/model.json`);
//   }
// }

// exports.predictRisk = async function (req, res) {
//   let providedSymptoms = req.body.symptoms;

//   if (!providedSymptoms) {
//     return res.status(400).send("Symptoms are required");
//   }
//   console.log("dataset before: ", providedSymptoms);

//   // make sure all the symptoms in the dataset are lowercase
//   providedSymptoms = providedSymptoms.map((symptom) => symptom.toLowerCase());
//   console.log("dataset after: ", providedSymptoms);

//   const model = await loadModel();

//   // Ensure testing data is in the correct format
//   const allSymptoms = [
//     ...new Set(
//       dataset.flatMap((item) =>
//         item.symptoms.split(",").map((symptom) => symptom.trim())
//       )
//     ),
//   ];

//   const testingData = tf.tensor2d(
//     [
//       allSymptoms.map((symptom) =>
//         providedSymptoms.includes(symptom) ? 1 : 0
//       ),
//     ],
//     [1, allSymptoms.length]
//   );

//   // Predict using test data
//   const results = model.predict(testingData).dataSync();

//   // Process prediction results
//   const riskLevels = ["low", "medium", "high"];
//   const highestProbIndex = results.indexOf(Math.max(...results));
//   const prediction = riskLevels[highestProbIndex];

//   // Log and send predictions (adjust output based on your needs)
//   console.log("Predicted risk level:", prediction);

//   // Optionally send predictions to a client (if part of a server-side API)
//   res.status(200).send({ prediction });
// };

// // Check if the model file exists before training
// if (!fs.existsSync(modelPath)) {
//   trainModel();
// }

const fs = require("fs");
const path = require("path");

const dataset = require("../dataset.json");
const datasetTesting = require("../dataset-testing.json");

// This will store our trained model data
const modelDir = path.join(__dirname, "../models");
const modelPath = path.join(modelDir, "model-data.json");

// A simple implementation of a neural network classifier
class SimpleNeuralClassifier {
  constructor() {
    this.symptomWeights = {}; // Stores importance of each symptom for risk levels
    this.trained = false;
  }

  train(dataset) {
    console.log("Training simple neural classifier...");
    
    // Initialize weight counters
    const riskLevelCounts = { low: 0, medium: 0, high: 0 };
    const symptomRiskOccurrences = {};
    
    // Process dataset to count occurrences
    dataset.forEach(item => {
      const risk = item["risk level"].toLowerCase().includes("low") ? "low" : 
                  item["risk level"].toLowerCase().includes("high") ? "high" : "medium";
      
      // Increment risk level counter
      riskLevelCounts[risk]++;
      
      // Process symptoms
      const symptoms = item.symptoms.split(",").map(s => s.trim().toLowerCase());
      symptoms.forEach(symptom => {
        if (!symptomRiskOccurrences[symptom]) {
          symptomRiskOccurrences[symptom] = { low: 0, medium: 0, high: 0 };
        }
        symptomRiskOccurrences[symptom][risk]++;
      });
    });
    
    // Calculate weights for each symptom
    Object.keys(symptomRiskOccurrences).forEach(symptom => {
      this.symptomWeights[symptom] = {
        low: symptomRiskOccurrences[symptom].low / (riskLevelCounts.low || 1),
        medium: symptomRiskOccurrences[symptom].medium / (riskLevelCounts.medium || 1),
        high: symptomRiskOccurrences[symptom].high / (riskLevelCounts.high || 1)
      };
    });
    
    this.trained = true;
    console.log(`Model trained with ${Object.keys(this.symptomWeights).length} symptoms`);
    
    // Save the model
    this.save();
    
    return this;
  }
  
  predict(symptoms) {
    if (!this.trained) {
      throw new Error("Model not trained yet");
    }
    
    // Initialize scores
    const scores = { low: 0.1, medium: 0.1, high: 0.1 };
    
    // For each symptom, add its contribution to each risk level
    symptoms.forEach(symptom => {
      const normalizedSymptom = symptom.toLowerCase();
      if (this.symptomWeights[normalizedSymptom]) {
        scores.low += this.symptomWeights[normalizedSymptom].low;
        scores.medium += this.symptomWeights[normalizedSymptom].medium;
        scores.high += this.symptomWeights[normalizedSymptom].high;
      }
    });
    
    // Apply a simple activation function (softmax-like normalization)
    const total = scores.low + scores.medium + scores.high;
    const results = {
      low: scores.low / total,
      medium: scores.medium / total,
      high: scores.high / total
    };
    
    return results;
  }
  
  save() {
    if (!fs.existsSync(modelDir)) {
      fs.mkdirSync(modelDir, { recursive: true });
    }
    
    fs.writeFileSync(modelPath, JSON.stringify({
      symptomWeights: this.symptomWeights,
      trained: this.trained
    }));
    
    console.log("Model saved to", modelPath);
  }
  
  load() {
    if (fs.existsSync(modelPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
        this.symptomWeights = data.symptomWeights;
        this.trained = data.trained;
        console.log("Model loaded successfully");
        return true;
      } catch (error) {
        console.error("Error loading model:", error);
        return false;
      }
    }
    return false;
  }
}

// Create and load the classifier
const classifier = new SimpleNeuralClassifier();
if (!classifier.load()) {
  classifier.train(dataset);
}

exports.predictRisk = async function (req, res) {
  let providedSymptoms = req.body.symptoms;

  if (!providedSymptoms) {
    return res.status(400).send("Symptoms are required");
  }
  console.log("Symptoms before:", providedSymptoms);

  // Convert to lowercase
  providedSymptoms = providedSymptoms.map((symptom) => symptom.toLowerCase());
  console.log("Symptoms after:", providedSymptoms);

  // Get prediction
  const results = classifier.predict(providedSymptoms);
  console.log("Prediction results:", results);
  
  // Find the highest probability risk level
  const riskLevels = ["low", "medium", "high"];
  const prediction = riskLevels.reduce((prev, current) => 
    results[current] > results[prev] ? current : prev
  );
  
  console.log("Predicted risk level:", prediction);
  res.status(200).send({ prediction });
};