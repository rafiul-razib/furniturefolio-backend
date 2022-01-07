const express = require ("express");
const cors = require ("cors");
// const bodyParser = require("body-parser");
const ObjectId = require("mongodb").ObjectId;
const SSLCommerzPayment = require('sslcommerz');
const { v4: uuidv4 } = require('uuid');
// const fileUpload = require ("express-fileupload")
const app = express();

const port = process.env.PORT || 5000;

require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
      const confirmedOrderCollection = database.collection("confirmedOrder");
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

    // GET api to get orders by id
    app.get('/orders/:orderId', async(req, res)=>{
        const id  = req.params.orderId;
        const query = {_id: ObjectId(id)};
        const result = await orderCollection.findOne(query);
        res.json(result);
    })

    // Payment 
    // app.get('/init', (req, res) => {
    //     const data = {
    //         total_amount: 100,
    //         currency: 'EUR',
    //         tran_id: 'REF123',
    //         success_url: "http://localhost:5000/ssl-payment-success",
    //         fail_url: `${process.env.ROOT}/ssl-payment-failure`,
    //         cancel_url: `${process.env.ROOT}/ssl-payment-cancel`,
    //         ipn_url: `${process.env.ROOT}/ssl-payment-ipn`,
    //         shipping_method: 'Courier',
    //         product_name: 'Computer.',
    //         product_category: 'Electronic',
    //         product_profile: 'general',
    //         cus_name: 'Customer Name',
    //         cus_email: 'cust@yahoo.com',
    //         cus_add1: 'Dhaka',
    //         cus_add2: 'Dhaka',
    //         cus_city: 'Dhaka',
    //         cus_state: 'Dhaka',
    //         cus_postcode: '1000',
    //         cus_country: 'Bangladesh',
    //         cus_phone: '01711111111',
    //         cus_fax: '01711111111',
    //         ship_name: 'Customer Name',
    //         ship_add1: 'Dhaka',
    //         ship_add2: 'Dhaka',
    //         ship_city: 'Dhaka',
    //         ship_state: 'Dhaka',
    //         ship_postcode: 1000,
    //         ship_country: 'Bangladesh',
    //         multi_card_name: 'mastercard',
    //         value_a: 'ref001_A',
    //         value_b: 'ref002_B',
    //         value_c: 'ref003_C',
    //         value_d: 'ref004_D'
    //     };
    //     const sslcommer = new SSLCommerzPayment(process.env.STORE_ID, process.env.STORE_PASSWORD,false) //true for live default false for sandbox
    //     sslcommer.init(data).then(data => {
    //         console.log(data)
    //         //process the response that got from sslcommerz 
    //         //https://developer.sslcommerz.com/doc/v4/#returned-parameters
    //         if(data?.GatewayPageURL){
    //             return res.status(200).redirect(data?.GatewayPageURL)
    //         }
    //         else{
    //             return res.status(400).json({
    //                 message: "SSL Session was not successful"
    //             })
                
    //         }
    //     });
    // })
    
    // app.post("/ssl-payment-success", async(req, res)=>{
    //     return res.status(200).json({
    //         data: req.body
    //     })
    // })
    // app.post("/ssl-payment-failure", async(req, res)=>{
    //     return res.status(400).json({
    //         data: req.body
    //     })
    // })
    // app.post("/ssl-payment-cancel", async(req, res)=>{
    //     return res.status(200).json({
    //         data: req.body
    //     })
    // })
    // app.post("/ssl-payment-ipn", async(req, res)=>{
    //     return res.status(200).json({
    //         data: req.body
    //     })
    // })

    // pHERO
    app.post('/init', async (req, res) => {
        console.log("hitting")
        const productInfo = {
            total_amount: req.body.price,
            currency: 'BDT',
            tran_id: uuidv4(),
            success_url: `${process.env.ROOT}/success`,
            fail_url: `${process.env.ROOT}/failure`,
            cancel_url: `${process.env.ROOT}/cancel`,
            ipn_url: `${process.env.ROOT}/ipn`,
            paymentStatus: 'pending',
            shipping_method: 'Courier',
            product_name: 'sofa',
            product_category: 'Electronic',
            product_profile: 'hatil',
            product_image: 'null',
            product_quantity: req.body.quantity,
            cus_name: req.body.name,
            cus_email: req.body.email,
            cus_add1: 'Dhaka',
            cus_add2: 'Dhaka',
            cus_city: 'Dhaka',
            cus_state: 'Dhaka',
            cus_postcode: '1000',
            cus_country: 'Bangladesh',
            cus_phone: req.body.phone,
            cus_fax: '01711111111',
            ship_name: req.body.name,
            ship_add1: 'Dhaka',
            ship_add2: 'Dhaka',
            ship_city: 'Dhaka',
            ship_state: 'Dhaka',
            ship_postcode: 1000,
            ship_country: 'Bangladesh',
            multi_card_name: 'mastercard',
            value_a: 'ref001_A',
            value_b: 'ref002_B',
            value_c: 'ref003_C',
            value_d: 'ref004_D'
        };

        // Insert order info
        const result = await confirmedOrderCollection.insertOne(productInfo);

        const sslcommer = new SSLCommerzPayment(process.env.STORE_ID, process.env.STORE_PASSWORD, false) //true for live default false for sandbox
        sslcommer.init(productInfo).then(data => {
            //process the response that got from sslcommerz 
            //https://developer.sslcommerz.com/doc/v4/#returned-parameters
            const info = { ...productInfo, ...data }
            // console.log(info.GatewayPageURL);
            if (info.GatewayPageURL) {
                res.json(info.GatewayPageURL)
            }
            else {
                return res.status(400).json({
                    message: "SSL session was not successful"
                })
            }

        });
    });
    app.post("/success", async (req, res) => {

        const result = await confirmedOrderCollection.updateOne({ tran_id: req.body.tran_id }, {
            $set: {
                val_id: req.body.val_id
            }
        })

        res.redirect(`${process.env.ROOT}/${req.body.tran_id}`)

    })
    app.post("/failure", async (req, res) => {
        const result = await confirmedOrderCollection.deleteOne({ tran_id: req.body.tran_id })

        res.redirect(`${process.env.ROOT}`)
    })
    app.post("/cancel", async (req, res) => {
        const result = await confirmedOrderCollection.deleteOne({ tran_id: req.body.tran_id })

        res.redirect(`${process.env.ROOT}`)
    })
    app.post("/ipn", (req, res) => {
        console.log(req.body)
        res.send(req.body);
    })
    app.post('/validate', async (req, res) => {
        const result = await confirmedOrderCollection.findOne({
            tran_id: req.body.tran_id
        })

        if (result.val_id === req.body.val_id) {
            const update = await confirmedOrderCollection.updateOne({ tran_id: req.body.tran_id }, {
                $set: {
                    paymentStatus: 'paymentComplete'
                }
            })
            console.log(update);
            res.send(update.modifiedCount > 0)

        }
        else {
            res.send("Chor detected")
        }

    })
    app.get('/confirmed-order/:tran_id', async (req, res) => {
        const id = req.params.tran_id;
        const result = await confirmedOrderCollection.findOne({ tran_id: id })
        res.json(result)
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