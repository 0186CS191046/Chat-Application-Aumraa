import { Sequelize } from "sequelize";
import  config from "./index";
 
console.log("config", config);
 
const sequelize = new Sequelize(
  config.db_name,
  config.db_user,
  config.db_password,
  {
    host: config.db_host,
    port: 5432,
    dialect: "postgres",
    logging: false,
    dialectOptions:{
        ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
  
);
 
const connectToDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to DB");
 
    await sequelize.sync();
 
    console.log("All models synced");
  } catch (error) {
    console.error("Error connecting to DB", error);
  }
};
 
export { connectToDB, sequelize };