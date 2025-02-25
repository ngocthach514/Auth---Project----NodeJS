const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { default: mongoose } = require('mongoose');

const authRouter = require('./routers/authRouter');
const postsRouter = require('./routers/postsRouter');

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
app.use('/api/posts',postsRouter);
app.listen(process.env.PORT, ()=> {
    console.log("listening on port " + process.env.PORT);
});