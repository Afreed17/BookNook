import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";

const app = express();
const port = 3000;
const URL = "https://openlibrary.org/search.json?q="
const imgURL ="https://covers.openlibrary.org/b/isbn/"
let bookArray=[];

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "BookNook",
  password: "afreedafu17",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.get("/",async(req,res)=>{
try{
const result = await db.query("Select * from books");
const items = result.rows;
res.render("index.ejs",{data:items});
}
catch(err){

}
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
      bookOb.isbn=result.data.docs[i].isbn[1];
      bookArray.push(bookOb);
    }
    console.log(bookArray);
    res.render("index.ejs",{bookInfo:bookArray});
  }
  catch(err)
  {
    console.log(err);
  }


});

app.post("/add",async(req,res)=>{
  const bookTitle = req.body.booktitle;
  const bookIsbn = req.body.bookisbn;
  res.render("add.ejs",{title:bookTitle,isbn:bookIsbn});
});

app.post("/addData",async(req,res)=>{
  const title = req.body.Booktitle;
  const description = req.body.description;
  const isbn = req.body.isbn;
  const rating = req.body.rating;

  try{
    await db.query("Insert into books (title,description,isbn,rating) values ($1,$2,$3,$4)",[title,description,isbn,rating]);
    res.redirect("/");
  }
  catch(err){
    console.log (err)
  }


})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });