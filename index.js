import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";

const app = express();
const port = 3000;
const URL = "https://openlibrary.org/search.json?q="
const imgURL ="https://covers.openlibrary.org/b/isbn/"
let bookArray=[];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.get("/",async(req,res)=>{
res.render("index.ejs");
});

app.post("/check",async(req,res)=>{
  bookArray=[];
  try
  {

    const bookName = req.body.bookSearch;
    const result = await axios.get(URL+bookName);
    for(let i=0;i<10;i++){
      let bookOb= new Object();
      bookOb.id = i+1;
      bookOb.bookTitle= result.data.docs[i].title;
      bookOb.bookDate = result.data.docs[i].publish_date[0];
      bookOb.imgData = imgURL+result.data.docs[i].isbn[1]+"-S.jpg";
      bookOb.bookAuthor=result.data.docs[i].author_name[0];
      bookArray.push(bookOb);
    }
    console.log(bookArray);
    res.render("index.ejs",{bookInfo:bookArray});
  }
  catch(err)
  {
    console.log(err);
  }


})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });