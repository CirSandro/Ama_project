
document.addEventListener('DOMContentLoaded', () => {
    const list_id = document.getElementById('list-id');
    const ajout_recette = document.getElementById('nouv-recette');
    const details = document.getElementById('details');
    const btn_modif = document.getElementById('modif-button');
    const btn_maj = document.getElementById('maj-button');
    const btn_annule = document.getElementById('annule-button');

    let recipes = [];
    let id_recipe = "";
    let creation = 0;

    function affichage() {
        axios.get('http://localhost:3000/api/recipes').then(response => {
            recipes = response.data;
            list_id.innerHTML = '';
            recipes.forEach((recipe, index) => {
                const list = document.createElement('li');
                list.classList.add('recipe-item');
                list.innerHTML = `
                    <h3>${recipe.name}</h3>
                    <p>${recipe.description}</p>
                    <button class="details-button" data-index="${index}" style="width: 150px; height: 30px;">Voir les détails</button>
                    <button class="delete-button" data-index="${index}" style="width: 150px; height: 30px;">Supprimer la recette</button>`;
                list_id.appendChild(list);
            });
            const btn_detail = document.querySelectorAll('.details-button');
            btn_detail.forEach(button => {
                button.addEventListener('click', (event) => {
                    const index = event.target.dataset.index;
                    affich_details(recipes[index].name);
                });
            });
            const btn_delete = document.querySelectorAll('.delete-button');
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

    function supprimerRecette(nom,index) {
        axios.delete('http://localhost:3000/api/recipes/'+nom)
            .then(response => {
                recipes.splice(index, 1);
            })
            .catch(error => {
                console.error('Error delete '+nom+' :', error);
            });
        affichage();
    }

    function affich_details(nom) {
        id_recipe = nom;
        axios.get('http://localhost:3000/api/recipes/'+nom)
            .then(response => {
                const recipe = response.data;
                creation = recipe.createdAt;
                document.getElementById('name-details').value = recipe.name;
                document.getElementById('description-details').value = recipe.description;
                document.getElementById('ingredients-details').value = recipe.ingredients.join('\n');
                document.getElementById('instructions-details').value = recipe.instructions;
                details.style.display = 'block';
                btn_modif.style.display = 'block';
                btn_maj.style.display = 'none';
                btn_annule.style.display = 'none';
                document.getElementById('name-details').readOnly = true;
                document.getElementById('description-details').readOnly = true;
                document.getElementById('ingredients-details').readOnly = true;
                document.getElementById('instructions-details').readOnly = true;
            })
            .catch(error => {
                console.error('Error Get recette '+nom+' :', error);
            });
    }

    function modif_details() {
        document.getElementById('name-details').readOnly = false;
        document.getElementById('description-details').readOnly = false;
        document.getElementById('ingredients-details').readOnly = false;
        document.getElementById('instructions-details').readOnly = false;
        btn_modif.style.display = 'none';
        btn_maj.style.display = 'block';
        btn_annule.style.display = 'block';
    }

    function annule_modif() {
        affich_details(id_recipe);
    }

    function maj_modif() {
        const name = document.getElementById('name-details').value;
        const description = document.getElementById('description-details').value;
        const ingredients = document.getElementById('ingredients-details').value.split('\n');
        const instructions = document.getElementById('instructions-details').value;
        annule_modif();
        const maj_recette = {
            name,
            description,
            ingredients,
            instructions,
            createdAt: creation,
            updatedAt: Date.now()
        };

        axios.put('http://localhost:3000/api/recipes/'+id_recipe, maj_recette)
            .then(response => {
                affich_details(response.data.name);
                affichage();
            })
            .catch(error => {
                console.error('Error mise à jour recette '+id_recipe+' :', error);
            });
        
    }

    ajout_recette.addEventListener('submit', (event) => {
        event.preventDefault();
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

        axios.post('http://localhost:3000/api/recipes', new_recette)
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
