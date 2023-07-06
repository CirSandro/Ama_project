const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());

const fs = require("fs");

function readUsersFromJSONFile(JSON_filename) { // Liste des recettes dans le fichier JSON
    const content = fs.readFileSync(JSON_filename, (err) => {
        if (err) {
        console.error(err);
        return;
        }
    });
    return JSON.parse(content).recipes;
}

function writeUsersToJSONFile(JSON_filename, recipes) { // Met a jour la liste des recette dans le JSON
    const usersJSON = JSON.stringify({ recipes: recipes });
    fs.writeFileSync(JSON_filename, usersJSON, (err) => {
        if (err) {
        console.error(err);
        return;
        }
    });
}

const server = app.listen(3000, () => {
    console.log("Server running on port 3000");
});

// Get liste recettes
app.get('/api/recipes', (req, res) => {
    let recipes = readUsersFromJSONFile('recipes.json');
    res.status(200);
    res.send(recipes);
});

// Post ajouter nouvelle recette
app.post('/api/recipes', (req, res) => {
    const { name, description, ingredients, instructions } = req.body;
    const createdAt = Date.now();
    const updatedAt = createdAt;
    const new_recipe = {
        "name" : name,
        "description" : description,
        "ingredients" : ingredients,
        "instructions" : instructions,
        "createdAt" : createdAt,
        "updatedAt" : updatedAt,
    };
    let recipes = readUsersFromJSONFile('recipes.json');
    recipes.push(new_recipe);
    writeUsersToJSONFile('recipes.json',recipes);
    res.status(200);
    res.send(new_recipe);
});

// Get info sur recette id
app.get('/api/recipes/:id', (req, res) => { //id = name ici
    const id = req.params.id;
    let recipes = readUsersFromJSONFile('recipes.json');
    let i = 0;
    while(recipes[i] && recipes[i].name != id) { //attention si grande liste
        i++;
    }
    if (!recipes[i]) {
        res.status(404);
        res.send({message : `No recipe with id: ${id} found`});
    }
    else {
        res.status(200);
        res.send(recipes[i]);
    }
});

// Put met a jour recette id
app.put('/api/recipes/:id', (req, res) => {
    const id = req.params.id;
    let recipes = readUsersFromJSONFile('recipes.json');
    let i = 0;
    while(recipes[i] && recipes[i].name != id) {
        i++;
    }
    if (!recipes[i]) {
        res.status(404);
        res.send({message : `No recipe with id: ${id} found`});
    }
    else {
        const { name, description, ingredients, instructions } = req.body;
        recipes[i].name = name;
        recipes[i].description = description;
        recipes[i].ingredients = ingredients;
        recipes[i].instructions = instructions;
        recipes[i].updatedAt = Date.now();
        writeUsersToJSONFile('recipes.json',recipes);
        res.status(200);
        res.send(recipes[i]);
    }
});

// Delete supprime recette id
app.delete('/api/recipes/:id', (req, res) => {
    const id = req.params.id;
    let i = 0;
    let recipes = readUsersFromJSONFile('recipes.json');
    while(recipes[i] && recipes[i].name != id) {
        i++;
    }
    if (!recipes[i]) {
        res.status(404);
        res.send({message : `No recipe with id: ${id} found`});
    }
    else {
        recipes.splice(i,1);
        let supp = recipes[i];
        writeUsersToJSONFile('recipes.json',recipes);
        res.status(200);
        res.send(supp);
    }
});
