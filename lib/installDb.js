"use strict";

let mongoose = require('mongoose');
let conn = mongoose.connection;

let fs = require('fs');
let async = require('async');

require('../models/Article');
require('../models/User');

let Article = mongoose.model('Article');
let User = mongoose.model('User');

//Crear conexion con la base de datos y borrarla
function connectDb() {
    return new Promise(function (resolve, reject) {
        conn.on('error',console.log.bind(console, 'conecction error'));
        conn.once('open', function () {
            console.log('Conected to mongoDB');
        });
        resolve (mongoose.connect('mongodb://localhost:27017/nodepop',function(){
            mongoose.connection.db.dropDatabase();
            console.log(('Database nodepop deleted'));
        }));
    })
}

function readArticles() {
    return new Promise(function (resolve, reject) {
            fs.readFile(__dirname + '/../articlesData.json', 'utf8', function (err, data) {
                if (err) {
                    return reject (console.log('Error leyendo archivo de articulos', err));
                }
                try {
                    console.log('Leido fichero de articulos');
                    return resolve (JSON.parse(data));
                } catch (err) {
                    return reject (console.log('Error leyendo el json de articulos', err));
                }
            });
    });
}

function saveArticles(json) {
    return new Promise(function (resolve, reject) {
         async.each(json.articles, function iterator(article, callback) {
                Article.saveArticle(article, function (err, saved) {
                    if (err) {
                        console.log('Error salvando articulo en db nodepop', err);
                        return callback('Error', err);
                    }
                    console.log('Articulo salvado en la db', saved);
                    callback();
                })
            },function(err) {
             //Si algo falla en el iterador salta este error
             if (err) {
                 return reject (console.log('Algo ha fallado en el guardado de articulos en la db', err));
             } else {
                 return resolve(console.log('Todos los articles del archivo guardados en nodepopDB'));
             }
         });
    });
}

function readUsers(){
    return new Promise(function (resolve, reject) {
            fs.readFile(__dirname + '/../usersData.json', 'utf8', function (err, data) {
                if (err) {
                    return reject (console.log('Error leyendo archivo de usuarios', err));
                }
                try {
                    console.log('Leido fichero de users');
                    return resolve(JSON.parse(data));
                } catch (errJ) {
                    return reject (console.log('Error leyendo el json de users', errJ));
                }
            });
    })
}

function saveUsers(json) {
    return new Promise(function (resolve, reject) {
        async.each(json.users, function iterator(user, callback) {
            User.saveUser(user, function (err, saved) {
                if (err) {
                    console.log('Error salvando user en db nodepop', err);
                    return callback(err);
                }
                console.log('User salvado en la db', saved);
                callback();
            })
        },function(err) {
            //Si algo falla en el iterador salta este error
            if (err) {
                return reject (console.log('Algo ha fallado en el guardado de users en la db', err));
            } else {
                return resolve(console.log('Todos los users del archivo guardados en nodepopDB'));
            }
        });
    });
}

function closeConnection() {
    return new Promise(function (resolve, reject) {
        return resolve (mongoose.connection.close())
    })
}

connectDb()
    .then(readArticles)
    .then(saveArticles)
    .then(readUsers)
    .then(saveUsers)
    .then(closeConnection);