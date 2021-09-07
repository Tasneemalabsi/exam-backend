'use strict';
const express = require('express');
const cors = require('cors');
const axios = require ('axios');
const server = express();
require('dotenv').config();
server.use(cors());
const mongoose = require ('mongoose');
server.use(express.json());
const PORT = `${process.env.PORT}`;

server.get('/getapidata',handleGettingApiData);
server.post('/adddata',handleAddingData);
server.get('/getuserdata',handleGettingData);
server.delete('/deletedata/:chocoID',handleDeletingData);
server.put('/updatedata/:chocoID',handleUpdatingData)

mongoose.connect(`${process.env.MONGO_LINK}`,{ useNewUrlParser: true, useUnifiedTopology: true });

async function handleGettingApiData (req,res) {
    let url ='https://ltuc-asac-api.herokuapp.com/allChocolateData'
    let chocoData = await axios.get(url);
    let arr=[];
    chocoData.data.map(item=>{
        let newChoco = new Chocolate (item.title,item.imageUrl);
        arr.push(newChoco)

    });
    res.send(arr);
}

const chocolateSchema = new mongoose.Schema({
    chocoName:String,
    chocoImg:String,
    email:String
  });

  const chocolateModel = mongoose.model('chocolate', chocolateSchema);

  function handleAddingData (req,res) {
      let {chocoName,chocoImg,email} =req.body;
      chocolateModel.create({chocoName,chocoImg,email});
      chocolateModel.find({email},(error,chocoData)=>{
         if (error) {
             console.log('error in adding the data',error);
         }
         else {
             res.send(chocoData)
         }
      })
  }

  function handleGettingData (req,res) {
      let email = req.query.email;
      chocolateModel.find({email},(error,chocoData)=>{
        if (error) {
            console.log('error in getting the data',error);
        }
        else {
            res.send(chocoData)
        }
     })
  }

  async function handleDeletingData (req,res) {
    let email = req.query.email;
    let chocoID=req.params.chocoID;
    await chocolateModel.remove({_id:chocoID}, (error,chocoData)=>{
        if (error) {
            console.log('error in deleting the data',error);
        }
        else {
            res.send(chocoData)
        }
  } )

  await chocolateModel.find({email},(error,chocoData)=>{
    if (error) {
        console.log('error in getting after deleting the data',error);
    }
    else {
        res.send(chocoData)
    }
 })
} 

async function handleUpdatingData (req,res) {
    let chocoID=req.params.chocoID;
    let {chocoName,chocoImg,email} =req.body;
    await chocolateModel.findOne({_id:chocoID},(error,chocoData)=>{
        chocoData.chocoName = chocoName;
        chocoData.chocoImg = chocoImg;
        chocoData.email=email;
        chocoData.save()
        .then(()=>{
            chocolateModel.find({email},(error,chocoData)=>{
                if (error) {
                    console.log('error in getting after deleting the data',error);
                }
                else {
                    res.send(chocoData)
                }
             })
        })
    })

     
}

class Chocolate {
    constructor (chocoName,chocoImg) {
        this.chocoName=chocoName;
        this.chocoImg=chocoImg;
    }
}

server.listen(PORT, ()=>{
    console.log(`listening to port ${PORT}`);
})