const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express();

app.use(cors())
app.use(express.json())

const port= process.env.PORT || 5000;

const URI ="mongodb+srv://tester1:123@cluster0.mio55fa.mongodb.net/ArtList"


const connectToDB = async () => {
    try {
        await mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB Server');
        app.listen(port, () => {
            console.log("Server is running on port " + port);
        });
    } catch (err) {
        console.error('Error Connecting to MongoDB ', err);
    }
};

connectToDB();

const Schema = mongoose.Schema

const artSchema = new Schema({
    artName: { type: String },
    serial: { type: Number },
    src:{type: String, required:true},
    alt: { type: String },
    bids: [{user:{ type: String, required:true},
            bid:{type: Number, required: true}}]
}, { versionKey: false });


const ArtModel = mongoose.model("artrecords", artSchema)

const router = express.Router();

app.use('/api/art', router)

router.route('/')
    .get(async(req, res) => {
        await ArtModel.find()
            .then((arts) => res.json(arts))
            .catch((err) => res.status(400).json('error:' + err))
    })

//add /save art

router.route('/')
    .post((req, res) => {
        ArtModel.create({
            
            artName: req.body.artName,
            serial: req.body.serial,
            src: req.body.src,
            alt: req.body.alt,
            bids:req.body.bids
        })
            .then((art) => {
                res.json("new art added");
                console.log("new art added: " + art.data);
            })
            .catch((err) => res.status(400).json('error:' + err))

    });


//get arts by id

router.route('/:id')
    .get(async (req, res) => {
        await ArtModel.findById(req.params.id)
            .then((art) => {
                if(art!=null){
                    res.json(art);     
                } else {
                    res.status(404).json("Art Not Found")
                }
                console.log("find art id: " + req.params.id);
            })
            .catch((err) => {
                res.status(400).json("error" + err);
                console.error("error: ", err.message);
            })
    })

// update art by id
router.route('/:id')
    .post(async (req, res) => {
        await ArtModel.findByIdAndUpdate(req.params.id)
            .then((newArt) => {
                newArt.artName = req.body.artName,
                newArt.serial =req.body.serial,
                newArt.src = req.body.src,
                newArt.alt = req.body.alt
                newArt.bids =  req.body.bids
                
                newArt.save()
                    .then(() => res.json("art updated"))
                    .catch((err) => res.status(400).json("error: " + err))
            })
            .catch((err) => {
                res.status(400).json("error" + err);
                console.error("error: ", err.message);
            })
    })


// delete art by id
router.route('/:id')
    .delete(async (req, res) => {
        await ArtModel.findByIdAndDelete(req.params.id)
            .then(() => {
                res.json("art deleted");
                console.log("deleted id: " + req.params.id);
            })
            .catch((err) => {
                res.status(400).json("error" + err);
                console.error("error: ", err.message)
            })
    })

router.route('/add')
  .post(async (req, res) => {
    const { artId, bidInfor } = req.body;
    try {
      // Find the user by userId
      const artItem = await ArtModel.findById(artId);
      if (!artItem) {
        return res.status(404).json("art Item not found");
      }
      // Add the order history items to the user
      artItem.bids.push(...bidInfor);
      await user.save();
      res.json("New Bids added to user successfully");
    } catch (err) {
      res.status(400).json("Error adding Bid: " + err);
    }
  });



