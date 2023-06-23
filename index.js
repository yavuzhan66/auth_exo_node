const express = require('express');
const mysql = require('mysql');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();

app.use(express.urlencoded({extended : true}));

const connexion = mysql.createConnection({

host : 'localhost',
user: 'root',
password:'',
database:'auth_exo_node',

});

createConnection.connect((err) => {
    if (err){
        console.log("erreur de connection");
    }else{
        console.log("connexion réussie")
    }
} );


app.set('view engine', 'ejs');


app.use(
    session({
        secret : 'secret',
        resave : true,
        saveUninitialized : true
    })
);


const requireHome = (req, res, next) => {
    if (!req.session.userId) {
      res.redirect('/home');
    } else {
      next();
    }
};


app.get('/', requireHome, (req, res) => {
    const isAdmin = req.session.isAdmin;
    const username = req.session.username;
    res.render('home' , {isAdmin , username});
});

app.get('/home', (req, res) => {
    res.render('home');
})


app.post('/home' , (req , res) => {
    const {username , password , role } = req.body;
    const checkUserQuery = 'SELECT COUNT(*) AS count FROM users WHERE username = ? ';
    connection.query(checkUserQuery, [username], (err, results) => {
        if(err) throw err;
        const count = results[0].count;
        if(count > 0) {
            res.redirect('/register?error=user_exists');
        } else {
            // hash mdp 
            bcrypt.hash(password, 10, (err, hashedpassword) => {
                if(err) throw err;
                // insert users dans bdd 
                const insertUserQuery = 'INSERT INTO users(username , password , role) VALUES (? , ? , ?)';
                connection.query(insertUserQuery, [username , hashedpassword , role] , (err, results) => {
                    if(err) throw err;
                    res.redirect('/home');
                });
            });
        }

    });

});

// login

app.get('/home', (req, res) => {
    res.render('home');
})

app.post('/home' , (req, res) => {
    const {username , password} = req.body;
    // recup les informations du users 
    const getUserQuery = 'SELECT id , username , password , role FROM users WHERE username = ? ';
    connection.query(getUserQuery, [username], (err, results) => {
        if(err) throw err;

        if(results.length === 1) {
            const user = results[0];
            
            // verif le mdp 

            bcrypt.compare(password, user.password, (err, isMatch ) => {
                if(err) throw err;

                if(isMatch) {
                    req.session.userId = user.id;
                    req.session.username = user.username;
                    req.session.isAdmin = user.role === 'admin';
                    res.redirect('/');
                } else {
                    res.redirect('/home');
                }
            }); 
        } else {
            res.redirect('/home');
        }
    });

});

app.get('/dashboard', (req, res) => {
    req.session.destroy();
    res.redirect('/dashboard');
});





// server

const port = 8080;
app.listen(port, () => {
    console.log("marche bien ")
})