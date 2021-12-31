const express = require ("express");
const cors = require ("cors");
const ObjectId = require("mongodb").ObjectId;
// const fileUpload = require ("express-fileupload")
const app = express();

const port = process.env.PORT || 5000;

require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());
// app.use(fileUpload());

const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gnvic.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
      await client.connect();
      const database = client.db("furniture-folio");
      const furnitureCollection = database.collection("products");
      const orderCollection = database.collection("order");
      console.log("database connected")
      // create a document to insert

    //   POST api to post product
    app.post('/add-product', async(req, res)=>{
        console.log(req.body)
        const product = req.body;
        console.log(product);
        const result = await furnitureCollection.insertOne(product);
        res.json(result)
    })

    //   POST api to post order
    app.post('/order', async(req, res)=>{
        const order = req.body;
        console.log(order);
        const result = await orderCollection.insertOne(order)
        res.json(result)
    })

    // GET api to get orders by email
    app.get('/order/:email', async(req, res)=>{
        const email = req.params.email;
        const query = {email: email};
        const cursor = orderCollection.find(query);
        const result = await cursor.toArray()
        res.json(result)
    })

    // DELETE api to cancel order
    app.delete('/order/delete/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const result = await orderCollection.deleteOne(query);
        res.json(result)
    })

    // DELETE api to delete product
    app.delete('/products/delete/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const result = await furnitureCollection.deleteOne(query);
        res.json(result)
    })
 

  
     
    //   GET api to get all products
    app.get('/all-products', async(req, res)=>{
        const cursor = furnitureCollection.find({});
        const result = await cursor.toArray()
        res.json(result)
    })

    //  GET api to get details
    app.get('/details/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const result = await furnitureCollection.findOne(query);
        res.json(result);
    })
    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);


app.get('/', (req, res)=>{
    res.send("Hello furniture-folio")
});

app.listen(port, ()=>{
    console.log("Listening to the port", port)
})