// ecouteur d'evenement de l'HTML
document.addEventListener('DOMContentLoaded', () => {
    const list_id = document.getElementById('list-id');
    const ajout_recette = document.getElementById('nouv-recette');
    const details = document.getElementById('details');
    const btn_modif = document.getElementById('modif-button');
    const btn_maj = document.getElementById('maj-button');
    const btn_annule = document.getElementById('annule-button');

    let recipes = []; //liste recettes
    let id_recipe = ""; // nom de la recette que l'on regarde en detail
    let creation = 0; // date creation de la recette que l'on regarde en detail

    // affichage de la liste des recettes
    function affichage() {
        axios.get('http://localhost:3000/api/recipes').then(response => { // requete recupere liste recettes
            recipes = response.data;
            list_id.innerHTML = '';
            recipes.forEach((recipe, index) => {
                const list = document.createElement('li');
                list.classList.add('recipe-item');
                //affichage des recettes + bouton Voir details et Supprimer la recette
                list.innerHTML = `
                    <h3>${recipe.name}</h3>
                    <p>${recipe.description}</p>
                    <button class="details-button" data-index="${index}" style="width: 150px; height: 30px;">Voir les détails</button>
                    <button class="delete-button" data-index="${index}" style="width: 150px; height: 30px;">Supprimer la recette</button>`;
                list_id.appendChild(list); //ajout a HTML
            });

            const btn_detail = document.querySelectorAll('.details-button'); //bouton Voir Details
            btn_detail.forEach(button => {
                button.addEventListener('click', (event) => {
                    const index = event.target.dataset.index;
                    affich_details(recipes[index].name);
                });
            });

            const btn_delete = document.querySelectorAll('.delete-button'); // bouton Supprimer recette
            btn_delete.forEach((button) => {
                button.addEventListener('click', (event) => {
                    const index = event.target.dataset.index;
                    supprimerRecette(recipes[index].name, index);
                });
            });
        })
        .catch(error => {
            console.error('Error Get liste recettes :', error);
        });
    }

    // Supprimer une recette
    function supprimerRecette(nom,index) {
        axios.delete('http://localhost:3000/api/recipes/'+nom) //requete
            .then(response => {
                recipes.splice(index, 1);
            })
            .catch(error => {
                console.error('Error delete '+nom+' :', error);
            });
        affichage(); //met a jour l'affichage des recettes
    }

    // affichage des details
    function affich_details(nom) {
        id_recipe = nom; // stock nom de la recette que l'on regarde
        axios.get('http://localhost:3000/api/recipes/'+nom) //requete
            .then(response => {
                const recipe = response.data; // recupere donnee de la recette
                creation = recipe.createdAt; // stock date de creation (sert pour mise a jour)
                // affiche details
                document.getElementById('name-details').value = recipe.name;
                document.getElementById('description-details').value = recipe.description;
                document.getElementById('ingredients-details').value = recipe.ingredients.join('\n');
                document.getElementById('instructions-details').value = recipe.instructions;
                details.style.display = 'block';
                // affiche ou non les boutons
                btn_modif.style.display = 'block';
                btn_maj.style.display = 'none';
                btn_annule.style.display = 'none';
                // Ne pas modifier = lecture seulement
                document.getElementById('name-details').readOnly = true;
                document.getElementById('description-details').readOnly = true;
                document.getElementById('ingredients-details').readOnly = true;
                document.getElementById('instructions-details').readOnly = true;
            })
            .catch(error => {
                console.error('Error Get recette '+nom+' :', error);
            });
    }

    // Bouton Modifier
    function modif_details() {
        // enelever la lecture seulement
        document.getElementById('name-details').readOnly = false;
        document.getElementById('description-details').readOnly = false;
        document.getElementById('ingredients-details').readOnly = false;
        document.getElementById('instructions-details').readOnly = false;
        // change l'affichage des boutons
        btn_modif.style.display = 'none';
        btn_maj.style.display = 'block';
        btn_annule.style.display = 'block';
    }

    // Bouton annuler = reviens comme avant
    function annule_modif() {
        affich_details(id_recipe);
    }

    // Mise a jour des donnees de la recette
    function maj_modif() {
        // recupere nouvelles valeurs
        const name = document.getElementById('name-details').value;
        const description = document.getElementById('description-details').value;
        const ingredients = document.getElementById('ingredients-details').value.split('\n');
        const instructions = document.getElementById('instructions-details').value;
        annule_modif(); // remet l'affichage standart
        // nouvelle recette mise a jour
        const maj_recette = {
            name,
            description,
            ingredients,
            instructions,
            createdAt: creation,
            updatedAt: Date.now()
        };

        axios.put('http://localhost:3000/api/recipes/'+id_recipe, maj_recette) //requete pour mettre a jour le json
            .then(response => {
                affich_details(response.data.name);
                affichage();
            })
            .catch(error => {
                console.error('Error mise à jour recette '+id_recipe+' :', error);
            });
        
    }

    // Ajout d'une recette
    ajout_recette.addEventListener('submit', (event) => { // Probleme si meme name que deja existant = A TRAITER
        event.preventDefault();
        // recupere les valeurs
        const name = document.getElementById('name').value;
        const description = document.getElementById('description').value;
        const ingredients = document.getElementById('ingredients').value.split(',');
        const instructions = document.getElementById('instructions').value;
        const new_recette = {
            name,
            description,
            ingredients,
            instructions,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        axios.post('http://localhost:3000/api/recipes', new_recette) // requete ajout de la nouvelle recette
            .then(response => {
                recipes.push(response.data);
                ajout_recette.reset();
                affichage();
            })
            .catch(error => {
                console.error('Error ajout de la recette :', error);
            });
    });

    btn_modif.addEventListener('click', modif_details);
    btn_maj.addEventListener('click', maj_modif);
    btn_annule.addEventListener('click', annule_modif);

    affichage();
});
