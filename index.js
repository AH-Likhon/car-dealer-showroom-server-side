const express = require('express');
const app = express();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
// const admin = require("firebase-admin");
require('dotenv').config();
const { MongoClient } = require('mongodb');

const port = process.env.PORT || 5000;


// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q3g5t.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// async function verifyToken(req, res, next) {
//     if (req.headers?.authorization?.startsWith('Bearer ')) {
//         const token = req.headers.authorization.split(' ')[1];

//         try {
//             const decodedUser = await admin.auth().verifyIdToken(token);
//             req.decodedEmail = decodedUser.email;
//         }
//         catch {

//         }
//     }

//     next();
// }

async function run() {
    try {
        await client.connect();
        // console.log('Databse Connected');
        const database = client.db('car_showroom');
        const carsCollection = database.collection('cars');
        const reviewsCollection = database.collection('reviews');
        const ordersCollection = database.collection('orders');
        const usersCollection = database.collection('users');

        // app.get('/appointments', verifyToken, async (req, res) => {
        //     const email = req.query.email;
        //     const date = req.query.date;
        //     const query = { email: email, date: date };
        //     const cursor = appointmentsCollection.find(query);
        //     const appointments = await cursor.toArray();
        //     res.json(appointments);
        // })



        app.get("/allCars", async (req, res) => {
            const result = await carsCollection.find({}).toArray();
            // console.log(req.body);
            res.send(result);
        });

        // insert new car
        app.post('/allCars', async (req, res) => {
            const car = req.body;
            const result = await carsCollection.insertOne(car);
            console.log(result);
            res.json(result);
        });

        app.delete("/allCars/:id", async (req, res) => {
            console.log(req.params.id);
            const result = await carsCollection.deleteOne({
                _id: ObjectId(req.params.id),
            });
            res.send(result);
        });

        app.get("/reviews", async (req, res) => {
            const result = await reviewsCollection.find({}).toArray();
            // console.log(req.body);
            res.send(result);
        });

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.json(result);
        });

        // find single car
        app.get('/allCars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const car = await carsCollection.findOne(query);
            // console.log('Find with id', id);
            res.send(car);
        });

        // get my orders
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = ordersCollection.find(query);
            const result = await cursor.toArray();
            // console.log(result);
            res.json(result);
        });


        //get all orders
        app.get("/allOrders", async (req, res) => {
            const result = await ordersCollection.find({}).toArray();
            // console.log(req.body);
            res.send(result);
        });




        // app.get('/orders/:email', async (req, res) => {
        //     const email = req.params.email;
        //     const query = { email: email };
        //     const result = await ordersCollection.find(query).toArray();
        //     console.log(req.params.email);
        //     res.json(result);
        // })


        // find single order
        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const car = await ordersCollection.findOne(query);
            // console.log('Find with id', id);
            res.send(car);
        });

        // insert orders
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            // console.log(result);
            res.json(result);
        });

        // Delete/remove my single order
        app.delete("/orders/:id", async (req, res) => {
            console.log(req.params.id);
            const result = await ordersCollection.deleteOne({
                _id: ObjectId(req.params.id),
            });
            res.send(result);
        });

        // app.put('/orders/:id', async (req, res) => {
        //     const order = req.body;
        //     console.log('put', order);
        //     const filter = { status: order.status };
        //     const options = { upsert: true };
        //     const updateDoc = { $set: order };
        //     const result = await ordersCollection.updateOne(filter, updateDoc, options);
        //     res.json(result);
        // })

        // update orders
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updateOrder = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updateOrder.status,
                },
            };
            const result = await ordersCollection.updateOne(filter, updateDoc, options);

            console.log('Updating id', id);
            // console.log(req.body);
            res.json(result);
        })



        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });


        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            console.log('put', result);
            res.json(result);
        })



        // app.put('/users/admin', verifyToken, async (req, res) => {
        //     const user = req.body;
        //     const requester = req.decodedEmail;
        //     if (requester) {
        //         const requesterAccount = await usersCollection.findOne({ email: requester });
        //         if (requesterAccount.role === 'admin') {
        //             const filter = { email: user.email };
        //             const updateDoc = { $set: { role: 'admin' } };
        //             const result = await usersCollection.updateOne(filter, updateDoc);
        //             res.json(result);
        //         }
        //     } else {
        //         res.status(403).json({ message: "You don't have access to make an admin" });
        //     }
        // })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Car Dealership Showroom!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})