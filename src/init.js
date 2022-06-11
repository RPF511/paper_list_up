import "dotenv/config";

import app from "./server";

const PORT = 4000;

const handleListening = () => 
    console.log(`server listening on Port http://localhost:${PORT}`);

app.listen(PORT, handleListening);