import express from 'express';
import db from './db/db.js';
import model_porscheRoutes from './routes/model_porsche.route.js';

const app = express();
app.use(express.json());

// Connexion DB
db();

// Test route
app.use('/model_porsche', model_porscheRoutes);

app.listen(4000, () => {
  console.log('✅ Test server on port 4000');
  
  setTimeout(async () => {
    const res = await fetch('http://localhost:4000/model_porsche');
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Data:', data);
    process.exit(0);
  }, 2000);
});
