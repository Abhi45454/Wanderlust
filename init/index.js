const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing=require("../modules/listing.js"); 
const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({ ...obj, owner: "687369ba50780d33e1224953"}));
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB(); 