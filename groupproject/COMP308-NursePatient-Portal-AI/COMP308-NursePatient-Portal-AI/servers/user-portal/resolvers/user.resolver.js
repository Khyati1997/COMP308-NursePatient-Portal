const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const VitalSign = require("../models/VitalSigns");
const MotivationalTip = require("../models/MotivationalTip");
const Alert = require("../models/Alert");
require("dotenv").config(); // ✅ Load environment variables

// ✅ Ensure JWT_SECRET is available
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env");
}

const resolvers = {
  // ****************** QUERIES ******************
  Query: {
    currentUser: async (_, __, { req }) => {
      const token = req.cookies["token"];
      if (!token) {
        console.error("No token found in cookies");
        return null;
      }
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return User.findById(decoded.id);
      } catch (error) {
        console.error("Token verification failed: ", error);
        return null;
      }
    },

    getUser: async (_, { id }) => {
      return await User.findById(id)
        .populate("name")
        .populate("email")
        .populate("role")
        .populate("assignedPatients")
        .populate("assignedNurse")
        .populate("vitalSigns")
        .populate("motivationalTips")
        .populate("symptoms")
        .populate("symptomsRiskPrediction");
    },

    listUsers: async (_, { role }) => {
      return await User.find(role ? { role } : {})
        .populate("assignedPatients")
        .populate("assignedNurse");
    },

    getRandomMotivationalTip: async () => {
      try {
        const count = await MotivationalTip.countDocuments();
        const randomIndex = Math.floor(Math.random() * count);
        return await MotivationalTip.findOne().skip(randomIndex);
      } catch (error) {
        throw new Error("Failed to fetch motivational tip: " + error.message);
      }
    },

    listMotivationalTips: async () => {
      try {
        return await MotivationalTip.find()
          .populate("user")
          .sort({ createdAt: -1 });
      } catch (error) {
        throw new Error("Failed to fetch motivational tips: " + error.message);
      }
    },

    listAlerts: async () => {
      try {
        return await Alert.find().populate("user").sort({ createdAt: 1 });
      } catch (error) {
        throw new Error("Failed to fetch alerts: " + error.message);
      }
    },
  },

  // ****************** MUTATIONS ******************
  Mutation: {
    login: async (_, { email, password }, { res }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("User not found");

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) throw new Error("Invalid password");

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "Lax",
      });

      console.log("Logged in user: ", user);
      return user;
    },

    register: async (_, { name, email, password, role }) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ name, email, password: hashedPassword, role });
      await user.save();
      return user;
    },

    logout: async (_, __, { res }) => {
      console.log("Logging out user");
      res.clearCookie("token");
      return true;
    },

    updateUser: async (_, { id, name, email, password, role, assignedNurse, assignedPatients }) => {
      const user = await User.findById(id);
      if (!user) throw new Error("User not found");

      if (name) user.name = name;
      if (email) user.email = email;
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
      }
      if (role) user.role = role;

      if (assignedNurse && user.role === "patient") {
        const nurse = await User.findById(assignedNurse);
        if (!nurse || nurse.role !== "nurse") throw new Error("Invalid nurse ID");
        user.assignedNurse = nurse._id;
      }

      if (assignedPatients && user.role === "nurse") {
        const patients = await User.find({ _id: { $in: assignedPatients }, role: "patient" });
        if (patients.length !== assignedPatients.length)
          throw new Error("One or more assigned patients not found or invalid");
        user.assignedPatients = assignedPatients;
      }

      await user.save();
      return user;
    },

    assignPatientToNurse: async (_, { patientId, nurseId }) => {
      const nurse = await User.findById(nurseId);
      const patient = await User.findById(patientId);

      if (!nurse || !patient || nurse.role !== "nurse" || patient.role !== "patient")
        throw new Error("Invalid nurse or patient ID");

      nurse.assignedPatients.push(patient._id);
      patient.assignedNurse = nurse._id;

      await nurse.save();
      await patient.save();

      return nurse;
    },

    addVitalSign: async (_, { userId, bodyTemperature, heartRate, bloodPressure, respiratoryRate, bodyWeight }) => {
      const vitalSign = new VitalSign({
        user: userId,
        bodyTemperature,
        heartRate,
        bloodPressure,
        respiratoryRate,
        bodyWeight,
      });
      await vitalSign.save();
      return vitalSign;
    },

    addMotivationalTip: async (_, { content }, { user }) => {
      try {
        const newTip = new MotivationalTip({ user: user.id, content });
        return await newTip.save();
      } catch (error) {
        throw new Error("Failed to add motivational tip: " + error.message);
      }
    },

    updateMotivationalTip: async (_, { id, content }) => {
      try {
        const updatedTip = await MotivationalTip.findByIdAndUpdate(id, { content }, { new: true });
        if (!updatedTip) throw new Error("Motivational tip not found");
        return updatedTip;
      } catch (error) {
        throw new Error("Failed to update motivational tip: " + error.message);
      }
    },

    deleteMotivationalTip: async (_, { id }) => {
      try {
        const deletedTip = await MotivationalTip.findByIdAndDelete(id);
        if (!deletedTip) throw new Error("Motivational tip not found");
        return deletedTip;
      } catch (error) {
        throw new Error("Failed to delete motivational tip: " + error.message);
      }
    },

    addAlert: async (_, __, { user }) => {
      try {
        const newAlert = new Alert({ user: user.id });
        return await newAlert.save();
      } catch (error) {
        throw new Error("Failed to add alert: " + error.message);
      }
    },

    deleteAlert: async (_, { id }) => {
      try {
        const deletedAlert = await Alert.findByIdAndDelete(id);
        if (!deletedAlert) throw new Error("Alert not found");
        return deletedAlert;
      } catch (error) {
        throw new Error("Failed to delete alert: " + error.message);
      }
    },

    addSymptoms: async (_, { symptoms }, { user }) => {
      try {
        const response = await fetch("http://localhost:4002/predictRisk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symptoms }),
        });

        if (!response.ok) throw new Error("Failed to get risk prediction");
        const predictionData = await response.json();

        const updatedUser = await User.findByIdAndUpdate(
          user.id,
          {
            symptoms,
            symptomsRiskPrediction: predictionData.prediction,
          },
          { new: true }
        );

        if (!updatedUser) throw new Error("User not found");
        return updatedUser;
      } catch (error) {
        throw new Error("Failed to add symptoms: " + error.message);
      }
    },
  },

  User: {
    assignedPatients: async (user) => {
      return user.role === "nurse" ? User.find({ assignedNurse: user._id }) : null;
    },
    assignedNurse: async (user) => {
      return user.role === "patient" ? User.findById(user.assignedNurse) : null;
    },
    vitalSigns: async (user) => {
      return await VitalSign.find({ user: user._id });
    },
    motivationalTips: async (user) => {
      return await MotivationalTip.find({ user: user._id });
    },
  },
};

module.exports = resolvers;


// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");
// const VitalSign = require("../models/VitalSigns");
// const MotivationalTip = require("../models/MotivationalTip");
// const Alert = require("../models/Alert");

// const resolvers = {
//   // ****************** QUERIES ******************
//   Query: {
//     // ------------------ User ------------------
//     currentUser: async (_, __, { req }) => {
//       const token = req.cookies["token"];
//       if (!token) {
//         console.error("No token found in cookies");
//         return null;
//       }
//       try {
//         const decoded = jwt.verify(token, "your_secret_key");
//         return User.findById(decoded.id);
//       } catch (error) {
//         console.error("Token verification failed: ", error);
//         return null;
//       }
//     },

//     getUser: async (_, { id }) => {
//       return await User.findById(id)
//         .populate("name")
//         .populate("email")
//         .populate("role")
//         .populate("assignedPatients")
//         .populate("assignedNurse")
//         .populate("vitalSigns")
//         .populate("motivationalTips")
//         .populate("symptoms")
//         .populate("symptomsRiskPrediction");
//     },

//     listUsers: async (_, { role }) => {
//       return await User.find(role ? { role } : {})
//         .populate("assignedPatients")
//         .populate("assignedNurse");
//     },

//     // ------------------ Motivational Tips ------------------
//     getRandomMotivationalTip: async () => {
//       try {
//         const count = await MotivationalTip.countDocuments();
//         const randomIndex = Math.floor(Math.random() * count);
//         return await MotivationalTip.findOne().skip(randomIndex);
//       } catch (error) {
//         throw new Error("Failed to fetch motivational tip: " + error.message);
//       }
//     },

//     listMotivationalTips: async () => {
//       try {
//         return await MotivationalTip.find()
//           .populate("user")
//           .sort({ createdAt: -1 }); // Sort by most recent
//       } catch (error) {
//         throw new Error("Failed to fetch motivational tips: " + error.message);
//       }
//     },

//     // ------------------ Alerts ------------------
//     listAlerts: async () => {
//       try {
//         return await Alert.find().populate("user").sort({ createdAt: 1 }); // Sort by most recent
//       } catch (error) {
//         throw new Error("Failed to fetch alerts: " + error.message);
//       }
//     },
//   },

//   // ****************** MUTATIONS ******************
//   Mutation: {
//     // ------------------ User ------------------
//     login: async (_, { email, password }, { res }) => {
//       const user = await User.findOne({ email });
//       if (!user) {
//         throw new Error("User not found");
//       }

//       const isValidPassword = await bcrypt.compare(password, user.password);
//       if (!isValidPassword) {
//         throw new Error("Invalid password");
//       }

//       // Generate a JWT token
//       const token = jwt.sign(
//         { id: user._id, role: user.role },
//         "your_secret_key",
//         {
//           expiresIn: "1d",
//         }
//       );

//       // Store token in an HTTP-only cookie
//       res.cookie("token", token, {
//         httpOnly: true,
//         maxAge: 24 * 60 * 60 * 1000, // 1 day
//         // sameSite: "None", // Ensure cookie works across the same site
//         sameSite: "Lax", // Ensure cookie works across the same site
//         // secure: true, // Ensure cookie is only sent over HTTPS
//       });

//       console.log("Logged in user: ", user);
//       console.log("Token: ", token);

//       return user; // Indicating successful login
//     },

//     register: async (_, { name, email, password, role }) => {
//       const hashedPassword = await bcrypt.hash(password, 10);
//       const user = new User({ name, email, password: hashedPassword, role });
//       await user.save();
//       return user;
//     },

//     logout: async (_, __, { res }) => {
//       console.log("Logging out user");
//       res.clearCookie("token");
//       return true;
//     },

//     updateUser: async (
//       _,
//       { id, name, email, password, role, assignedNurse, assignedPatients }
//     ) => {
//       const user = await User.findById(id);
//       if (!user) {
//         throw new Error("User not found");
//       }

//       // Update user fields if provided
//       if (name) user.name = name;
//       if (email) user.email = email;
//       if (password) {
//         const hashedPassword = await bcrypt.hash(password, 10);
//         user.password = hashedPassword;
//       }
//       if (role) user.role = role;

//       // Update relationships
//       if (assignedNurse && user.role === "patient") {
//         const nurse = await User.findById(assignedNurse);
//         if (!nurse || nurse.role !== "nurse") {
//           throw new Error("Invalid nurse ID");
//         }
//         user.assignedNurse = nurse._id;
//       }

//       if (assignedPatients && user.role === "nurse") {
//         const patients = await User.find({
//           _id: { $in: assignedPatients },
//           role: "patient",
//         });
//         if (patients.length !== assignedPatients.length) {
//           throw new Error("One or more assigned patients not found or invalid");
//         }
//         user.assignedPatients = assignedPatients;
//       }

//       await user.save();
//       return user;
//     },

//     assignPatientToNurse: async (_, { patientId, nurseId }) => {
//       const nurse = await User.findById(nurseId);
//       const patient = await User.findById(patientId);

//       if (
//         !nurse ||
//         !patient ||
//         nurse.role !== "nurse" ||
//         patient.role !== "patient"
//       ) {
//         throw new Error("Invalid nurse or patient ID");
//       }

//       nurse.assignedPatients.push(patient._id);
//       patient.assignedNurse = nurse._id;

//       await nurse.save();
//       await patient.save();

//       return nurse;
//     },

//     // ------------------ Vital Signs ------------------
//     addVitalSign: async (
//       _,
//       {
//         userId,
//         bodyTemperature,
//         heartRate,
//         bloodPressure,
//         respiratoryRate,
//         bodyWeight,
//       }
//     ) => {
//       const vitalSign = new VitalSign({
//         user: userId,
//         bodyTemperature,
//         heartRate,
//         bloodPressure,
//         respiratoryRate,
//         bodyWeight,
//       });
//       await vitalSign.save();
//       return vitalSign;
//     },

//     // ------------------ Motivational Tips ------------------
//     addMotivationalTip: async (_, { content }, { user }) => {
//       try {
//         const newTip = new MotivationalTip({ user: user.id, content });
//         return await newTip.save();
//       } catch (error) {
//         throw new Error("Failed to add motivational tip: " + error.message);
//       }
//     },

//     updateMotivationalTip: async (_, { id, content }) => {
//       try {
//         const updatedTip = await MotivationalTip.findByIdAndUpdate(
//           id,
//           { content },
//           { new: true }
//         );
//         if (!updatedTip) {
//           throw new Error("Motivational tip not found");
//         }
//         return updatedTip;
//       } catch (error) {
//         throw new Error("Failed to update motivational tip: " + error.message);
//       }
//     },

//     deleteMotivationalTip: async (_, { id }) => {
//       try {
//         const deletedTip = await MotivationalTip.findByIdAndDelete(id);
//         if (!deletedTip) {
//           throw new Error("Motivational tip not found");
//         }
//         return deletedTip;
//       } catch (error) {
//         throw new Error("Failed to delete motivational tip: " + error.message);
//       }
//     },

//     // ------------------ Alerts ------------------
//     addAlert: async (_, __, { user }) => {
//       try {
//         console.log("Adding alert for user: ", user.id);
//         const newAlert = new Alert({ user: user.id });
//         return await newAlert.save();
//       } catch (error) {
//         throw new Error("Failed to add alert: " + error.message);
//       }
//     },

//     deleteAlert: async (_, { id }) => {
//       try {
//         const deletedAlert = await Alert.findByIdAndDelete(id);
//         if (!deletedAlert) {
//           throw new Error("Alert not found");
//         }
//         return deletedAlert;
//       } catch (error) {
//         throw new Error("Failed to delete alert: " + error.message);
//       }
//     },

//     // ------------------ SYMPTOMS CHECKLIST DETAILS ------------------
//     addSymptoms: async (_, { symptoms }, { user }) => {
//       try {
//         // Get risk prediction based on symptoms
//         // Send symptoms to a machine learning model to get risk prediction GET http://localhost:4002/predictRisk
//         const response = await fetch("http://localhost:4002/predictRisk", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ symptoms: symptoms }),
//         });

//         if (!response.ok) {
//           throw new Error("Failed to get risk prediction");
//         }

//         const predictionData = await response.json();
//         console.log("Risk prediction data: ", predictionData.prediction);

//         const updatedUser = await User.findByIdAndUpdate(
//           user.id,
//           {
//             symptoms: symptoms,
//             symptomsRiskPrediction: predictionData.prediction,
//           },
//           { new: true }
//         );

//         if (!updatedUser) {
//           throw new Error("Motivational tip not found");
//         }

//         return updatedUser;
//       } catch (error) {
//         throw new Error("Failed to add symptoms: " + error.message);
//       }
//     },
//   },

//   User: {
//     assignedPatients: async (user) => {
//       return user.role === "nurse"
//         ? User.find({ assignedNurse: user._id })
//         : null;
//     },

//     assignedNurse: async (user) => {
//       return user.role === "patient" ? User.findById(user.assignedNurse) : null;
//     },

//     vitalSigns: async (user) => {
//       return await VitalSign.find({ user: user._id });
//     },

//     motivationalTips: async (user) => {
//       return await MotivationalTip.find({ user: user._id });
//     },
//   },
// };

// module.exports = resolvers;
