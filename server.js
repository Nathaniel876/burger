var express = require("express");

var app = express();

var PORT = process.env.PORT || 8080;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var exphbs = require("express-handlebars");
app.use(express.static(__dirname + '/public'));
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "burgers_db"
});

connection.connect(function (err) {
    if (err) {
        console.error("error connecting: " + err.stack);
        return;
    }

    console.log("connected as id " + connection.threadId);
});

// Start our server so that it can begin listening to client requests.
app.listen(PORT, function () {
    // Log (server-side) when our server has started
    console.log("Server listening on: http://localhost:" + PORT);
});

app.get("/", function (req, res) {
    connection.query("SELECT * FROM burgers", function (err, data) {
        if (err) throw err;
        var burgerArray = [];
        for (var i = 0; i < data.length; i++) {
            var obj = {
                id: data[i].id,
                burger_name: data[i].burger_name,
                devoured: data[i].devoured
            }
            burgerArray.push(obj);
        }
        res.render("index", { specials: burgerArray });

    });
});

// Create a new todo
app.post("/burgers", function (req, res) {
    connection.query("INSERT INTO burgers (burger_name)VALUES (?)", [req.body.burger_name], function (err, result) {
        if (err) {
            return res.status(500).end();
        }
    // Send back the ID of the new todo
        res.json({ id: result.id });
        console.log({ id: result.id });
    });
});

// Update a todo
app.put("/burgers/:id", function(req, res) {
    connection.query("UPDATE burgers SET devoured = 1 WHERE id = ?", [req.params.id], function(err, result) {
      if (err) {
       
        return res.status(500).end();
      }
      else if (result.changedRows === 0) {
     
        return res.status(404).end();
      }
      res.status(200).end();
  
    });
  });


// Post route -> back to home
app.post("/", function (req, res) {
    connection.query("INSERT INTO burgers (burger_name) VALUES (?)", [req.body.burgerName], function (err, result) {
        if (err) throw err;
        res.redirect("/");
    });
});
