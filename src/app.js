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

          
import routes from './routes/index.routes.js'
import girirajRoutes from "./Giriraj-Admin/src/routes/index.routes.js";
import {errorHandler} from "./utils/ApiError.js"



//routes declaration
app.use("/api/v2", routes);
app.use("/api/v2/giriraj", girirajRoutes);

app.get('/', (req, res) => {
    res.status(httpStatus.OK).send({ status: 'Health Check :) Server is up and running' });
});

  app.use(errorHandler);


export { app }