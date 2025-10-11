import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import httpStatus from "http-status"
const app = express()

app.use(cors({
  origin: function (origin, callback) {
     if (!origin) return callback(null, true);
       callback(null, origin); 
         },
        }));

  app.options('*', cors())

app.use(express.json({limit: "50mb"}))
app.use(express.urlencoded({extended: true, limit: "50mb"}))
app.use(express.static("public"))
app.use(cookieParser())

          

import {errorHandler} from "./utils/ApiError.js"
import girirajRoutes from "./routes/index.routes.js";


app.use("/api/v2", girirajRoutes);

app.get('/', (req, res) => {
    res.status(httpStatus.OK).send({ status: 'Health Check :) Server is up and running' });
});

  app.use(errorHandler);


export { app }