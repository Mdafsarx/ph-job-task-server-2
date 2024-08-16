const express = require('express');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors')



const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json())
app.use(
    cors({
        origin: [
            "http://localhost:5173",
        ],
        credentials: true
    })
);




app.get('/', (req, res) => {
    res.send('The server is running')
})
// data-base mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PAS}@cluster0.zgmhkd0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        // collection
        const Products = client.db("Twist").collection('Products')

        //    api's
        app.get('/Products', async (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 6;
            const skip = (page - 1) * limit;

            const search = req.query.search || ''
            const category = req.query.category || ''
            const brand = req.query.brand || ''
            const price = req.query.price || ''
            console.log(price)
            const [minPrice, maxPrice] = price.split('-').map(Number);

            let query = {};
            if (search) {
                query = {
                    productName: { $regex: search, $options: "i" }
                }
            } else if (category) {
                query = { category: category }
            } else if (brand) {
                query = { brand: brand }
            } else if (price) {
                if (!isNaN(minPrice) && !isNaN(maxPrice)) {
                    // gte and lte buja klk
                    query = { price: { $gte: minPrice, $lte: maxPrice } };
                }
            }


            const totalProducts = await Products.countDocuments(query);
            const totalPages = Math.ceil(totalProducts / limit);

            const result = await Products.find(query).skip(skip).limit(limit).toArray();
            res.send({ result, totalPages })
        })



        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    finally { }
}







run().catch(console.dir);
app.listen(port, () => {
    console.log('Server is running on 3000')
})