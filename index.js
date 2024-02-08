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

async function bookStored()
{
  const result = await db.query("Select * from books");
  const items = result.rows;
  return items;
}


app.get("/",async(req,res)=>{
try{
const items = await bookStored();
res.render("index.ejs",{data:items});
}
catch(err){
console.log(err);
}
});

app.post("/check",async(req,res)=>{
  bookArray=[];
  try
  {

    const bookName = req.body.bookSearch;
    const result = await axios.get(URL+bookName);
    for(let i=0;i<3;i++){
      let bookOb= new Object();
      bookOb.id = i+1;
      bookOb.bookTitle= result.data.docs[i].title;
      bookOb.bookDate = result.data.docs[i].publish_date[0];
      bookOb.imgData = imgURL+result.data.docs[i].isbn[1]+"-S.jpg";
      bookOb.bookAuthor=result.data.docs[i].author_name[0];
      bookOb.isbn=result.data.docs[i].isbn[1];
      bookArray.push(bookOb);
    }
    res.render("index.ejs",{bookInfo:bookArray});
  }
  catch(err)
  {
    console.log(err);
    const items = await bookStored();
    res.render("index.ejs",{data:items,err:"BOOK NOT FOUND"});
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
  const img = imgURL+req.body.isbn+"-M.jpg"
  const rating = req.body.rating;

  try{
    await db.query("Insert into books (title,description,isbn,rating,imgaddr) values ($1,$2,$3,$4,$5)",[title,description,isbn,rating,img]);
    res.redirect("/");
  }
  catch(err){
    console.log (err)
  }


})

app.post("/edit",async(req,res)=>{
  const upRating = req.body.updatedRating;
  const upDescription = req.body.updatedItemDescription;
  const upId = req.body.updatedItemId;

  try{
    await db.query("UPDATE books SET rating = ($1),description = ($2) where id = ($3)",[upRating,upDescription,upId]);
    res.redirect("/");
  }
  catch(err)
  {
    console.log(err);
  }
});

app.post("/delete",async(req,res)=>{
  const deleteId = req.body.deleteItemId;
  try{
    await db.query("DELETE from books where id = ($1)",[deleteId]);
    res.redirect("/");
  }
  catch(err){
    console.log(err)
  }
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });