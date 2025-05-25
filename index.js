const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cuvfj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// MongoDB Client Config
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDb!");

    const db = client.db("gadgetAidDB");
    const servicesCollection = db.collection("services");

    // All services
    app.get("/services", async (req, res) => {
      const result = await servicesCollection.find().toArray();
      res.send(result);
    });

    // User-specific ManageService
    app.get("/my-services", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        return res.status(400).send({ error: "Email query is required" });
      }

      const result = await servicesCollection
        .find({ providerEmail: email })
        .toArray();
      res.send(result);
    });

    // Single service by ID
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const service = await servicesCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(service);
    });

    // Add new service
    app.post("/services", async (req, res) => {
      const newService = req.body;
      const result = await servicesCollection.insertOne(newService);
      res.send(result);
    });

    //Delete service
    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const result = await servicesCollection.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
      } catch (err) {
        console.log(err);
      }
    })

    app.get("/", (req, res) => {
      res.send("Gadget aid server is running");
    });

    app.listen(port, () => {
      console.log(`Gadget Aid server is running on port:  ${5000}`);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);
