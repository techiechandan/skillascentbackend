require('dotenv').config();
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors');
const express = require('express');
const app = express();


// importing routes
const appRoutes = require('./routes/appRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

// db connection
const DbConnection = require('./DbConnection');
DbConnection();

const PORT = process.env.PORT || 5000

app.use(cors({
    origin:'https://skillascent.netlify.app',
    credentials:true,
}));


app.use(bodyParser.json({limit:"500mb"}));
app.use(bodyParser.urlencoded({extended: true,parameterLimit:100000,limit:"500mb"}));
app.use(cookieParser());



// Routes
app.use('',appRoutes);
app.use('/user',userRoutes);
app.use('/admin',adminRoutes);



app.listen(PORT,()=>{
    console.log(`Listing on port ${PORT}`);
});