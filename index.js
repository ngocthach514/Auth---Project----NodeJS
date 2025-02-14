const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { default: mongoose } = require('mongoose');

const authRouter = require('./routers/authRouter');

const app = express();
app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
mongoose
    .connect(process.env.URL_MONGODB)
    .then(() => {
        console.log('Database connected successfully');
    })
    .catch((err => {
        console.log(err);
        
    }));

app.use('/api/auth',authRouter);

app.get('/', (req, res) => {
    res.json({massage: "Hello World!"});
});
app.listen(process.env.PORT, ()=> {
    console.log("listening on port " + process.env.PORT);
});