import dotenv from "dotenv"
dotenv.config()
 
const config = {
    db_host : process.env.DB_HOST,
    db_user : process.env.DB_USER,
    db_password : process.env.DB_PASSWORD,
    db_name : process.env.DB_NAME,
    port : process.env.PORT,
    jwt_secret_key : process.env.JWT_SECRET_KEY,
    cloud_api_key : process.env.CLOUD_API_KEY,
    cloud_api_secret : process.env.CLOUD_API_SECRET,
    cloud_name : process.env.CLOUD_NAME
}

export default config;