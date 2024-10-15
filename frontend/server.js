const express = require('express');
const path = require('path');
const app = express();

// Serve only the static files from the browser folder inside dist/frontend
app.use(express.static(path.join(__dirname, 'dist', 'frontend', 'browser')));

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'dist', 'frontend', 'browser', 'index.html'));
});

// Start the app by listening on the default port
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});
