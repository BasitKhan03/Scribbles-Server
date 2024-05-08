const mongoose = require("mongoose");

const mongoURI =
  "mongodb+srv://basitkhan:Basit%4012345@scribbles.5bm5ynv.mongodb.net/?retryWrites=true&w=majority&appName=Scribbles";

const connectToMongo = () => {
  mongoose
    .connect(mongoURI)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB:", error);
    });
};

module.exports = connectToMongo;
