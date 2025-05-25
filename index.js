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
    const bookingsCollection = db.collection("bookings");

    // All services
    app.get("/services", async (req, res) => {
      const result = await servicesCollection.find().toArray();
      res.send(result);
    });

    // Manage Service by user
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

    // Update service
    app.put("/services/:id", async (req, res) => {
      const id = req.params.id;
      const updatedService = req.body;

      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          name: updatedService.name,
          price: updatedService.price,
          area: updatedService.area,
          description: updatedService.description,
          image: updatedService.image,
        },
      };
      const result = await servicesCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    //Delete service
    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const result = await servicesCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res.send(result);
      } catch (err) {
        console.log(err);
      }
    });

    // Add booking
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    });

    // Get all booking
    app.get("/all-bookings", async (req, res) => {
      const result = await bookingsCollection.find().toArray();
      res.send(result);
    });
    
    // Update booking status
    app.patch("/all-bookings/:id", async (req, res) => {
      const id = req.params.id;
      const { status } = req.body;

      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: { status: status },
      };

      const result = await bookingsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Get booking by email
    app.get("/bookings", async (req, res) => {
      const email = req.query.userEmail;
      const result = await bookingsCollection
        .find({ userEmail: email })
        .toArray();
      res.send(result);
    });



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
