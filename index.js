import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";


env.config();
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
})

db.connect(function(err,db){
  if(err) console.log({"Error at connection":err});
  else console.log("Connected");
})

const app = express();
const port = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "Buy milk", date:"" },
  { id: 2, title: "Finish homework",date:"" },
];


let monthArr = ['January','February','March','April','May','June','July','August','September','October','November','December'];

let dayArr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

var year = new Date().getFullYear();
var monthIndex = new Date().getMonth();
var month = monthArr[monthIndex];
var dayIndex = new Date().getDay();
var day = dayArr[dayIndex];
var date = new Date().getDate();

async function getItems(){
  const result = await db.query("SELECT * FROM items order by id ASC;");
  console.log("Getting all the item from items table");
  console.log(result.rows);
  return result.rows;
}

app.get("/", async (req, res) => {
  items = await getItems();
  const today = date+"-"+day+"-"+month+"-"+year;
  res.render("index.ejs", {
    listTitle: today,
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  const itemDate = date+" "+day+" "+month+" "+year;
  try{
    await db.query("INSERT INTO items (title,date) VALUES($1,$2)",[item,itemDate]);
    items.push({ title: item });
    res.redirect("/");

  }catch(err){
    console.log("Error at inserting new item");
    console.log(err);
  }
});

app.post("/edit", async (req, res) => {
  try{
    const updateTitle = req.body.updatedItemTitle;
    const updateTitleId = req.body.updatedItemId;
    await db.query(`UPDATE items SET title = $1 WHERE id = $2`,[updateTitle,updateTitleId]);
  }catch(err){
    console.log("Error at updating the item");
    console.log(err);
  }
  res.redirect("/");

});

app.post("/delete", async (req, res) => {
  try{
    const deleteTitleId = req.body.deleteItemId
    await db.query(`DELETE FROM items WHERE id = ${deleteTitleId}`);
  }catch(err){
    console.log("Error at deleting the item");
    console.log(err);
  }
  res.redirect("/");
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
