const express = require("express")
require("dotenv").config();
const handlebars = require("express-handlebars")
const helpers = require("handlebars-helpers")
const app = express()
const Mongoose = require("mongoose")
const session = require("express-session")
const FileStore = require("session-file-store")(session)
var cors = require('cors')

console.log(process.env.url)
const MongoDB_URI=process.env.url;
Mongoose.set("strictQuery", true);
Mongoose.connect(
  MongoDB_URI ,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)
const database = Mongoose.connection

app.engine(
  "handlebars",
  handlebars({
    defaultLayout: "main",
    helpers: helpers(),
  })
)
app.set("view engine", "handlebars")
app.use(express.static(__dirname + "/views/public"));
app.use(require("cookie-parser")())
app.use(
  session({
    secret: "eaji8tmE>!}A'sK",
    store: new FileStore({
      path: "./sessions",
    }),
    resave: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 1,
    },
    saveUninitialized: true,
  })
)


app.use(express.json())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
const corsOption = {  
    origin:'*',
    optionsSuccessStatus:200,
}
app.use(cors(corsOption))

app.use("/signup",require("./routers/signup.js")(database));
app.use("/login", require("./routers/login.js")(database));
app.use("/", require("./routers/index.js")(database));
app.use('/error',require('./routers/errMonitoring.js')(database))
app.use('/performance',require('./routers/permonitoring.js')(database))
app.use('/showerrors',require('./routers/showerror.js')(database))
app.use('/showperformance',require('./routers/showperformance.js')(database,cors))

database.once("open", () => {
  require("./models/userModel.js");
  require("./models/projectModel.js");
  require('./models/performanceModel.js');
  require('./models/errorsModel.js')
  app.listen(process.env.PORT||3000);
});
