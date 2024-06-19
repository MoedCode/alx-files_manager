import express from 'express';
import routes from './routes/index.js';
import bodyParser from 'body-parser'; // Corrected: Imported body-parser
// Express app
const app = express();
const PORT = process.env.PORT || 5000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
