import express from 'express';
import routes from './routes/index.js';
// Express app
const app  = express();
const PORT = process.env.PORT || 5000;

app.use(routes);



server = app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
})

