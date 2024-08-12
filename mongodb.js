
const {MongoClient} = require("mongodb")
require('dotenv').config()



const mongoHost = process.env.MONGO_HOST || "localhost"
const mongoPort = process.env.MONGO_PORT || 27017
const mongoUser = process.env.MONGO_USER 
const mongoPassword = process.env.MONGO_PASSWORD 
const mongoDbName = process.env.MONGO_DB 
const mongoAuthDb = process.env.MONGO_AUTH_DB || mongoDbName

const mongoUrl = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoAuthDb}`

console.log("mongodb.js: " + mongoUrl)

let db = null

exports.connectToDb = async function connectToDb(){
    const client = await MongoClient.connect(mongoUrl)
    db = client.db(mongoDbName)
}

exports.getDb = function getDb(){
    return db;
}