require('dotenv').config()
const express =require('express')
const cors = require('cors') 
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express() 
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())
 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pb63j1a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const foodCollection = client.db('restaurantFood').collection('food');
    const orderCollection = client.db('restaurantFood').collection('Order')
    const anotherCollection = client.db('restaurantFood').collection('another')


 
    
    // food collection functionality
    app.get('/food',async(req,res)=>{
        const cursor = foodCollection.find();
        const result = await cursor.toArray()
        res.send(result)
    }) 

    app.get('/foodCount', async (req, res) => {
      const { page = 1, limit = 5 } = req.query; // Default values
      const skip = (page - 1) * limit; // Calculate how many items to skip
  
      const cursor = foodCollection.find(); // Get the cursor for all products
      const result = await cursor.skip(skip).limit(parseInt(limit)).toArray(); // Apply pagination
  
      const totalItems = await foodCollection.countDocuments(); // Total documents count
      const totalPages = Math.ceil(totalItems / limit); // Calculate total pages
  
      res.send({
          data: result,
          totalItems,
          totalPages,
          currentPage: parseInt(page),
      });
  }); 

    app.get('/food/:id',async(req,res)=>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id)}
      const result = await foodCollection.findOne(query);
      res.send(result)
    })


    // order collection functionality
    app.post('/order',async(req,res)=>{
      const order = req.body;
      console.log(order)
      const result =await orderCollection.insertOne(order)
      res.send(result)
    })

    app.get('/order',async(req,res)=>{
      const cursor = orderCollection.find();
      const result =await cursor.toArray()
      res.send(result)

    }) 

    app.get('/order/:email',async(req,res)=>{
      const email = req.params.email; 
      const query = {email : email};
      const result = await orderCollection.find(query).toArray()
      res.send(result)

    })

    app.get('/orderupdate/:id',async(req,res)=>{
      const id =req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await orderCollection.findOne(query)
      res.send(result)
    })

    app.put('/orderupdate/:id',async(req,res)=>{
      const id =req.params.id;
      const filter = {_id: new ObjectId(id)}
      const option = {upsert : true}
      const orderUpdate = req.body;
      const order ={
        $set:{
          foodName: orderUpdate.foodName,
          img : orderUpdate.img,
          price: orderUpdate.price,
          buyerName: orderUpdate.buyerName,
          email: orderUpdate.email,
          quantity: orderUpdate.quantity,
          date: orderUpdate.date
        }
      } 
      const result = await orderCollection.updateOne(filter,order,option)
      res.send(result)
    })

    app.delete('/order/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await orderCollection.deleteOne(query)
      res.send(result)
    })
    

    // another collection functionality
    app.post('/another',async(req,res)=> {
      const items = req.body;
      const result = await anotherCollection.insertOne(items)
      res.send(result)
    })

    app.get('/another',async(req,res)=>{
      const cursor = anotherCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

     
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send('server running')
})

app.listen(port,()=>{
    console.log(`server side is running is on port${port}`)
})