var url = "http://localhost:8000/api/" //url de l'api
//CONTENU DE LA PAGE
var htmlLogin = //Formulaire de connexion
    '<input type="text" placeholder="Identifiant" id="username">'+
    '<input type="password" placeholder="Mot de passe" id="password">'+
    '<span id="err"></span>'+
    '<button id="login">Connexion</button>';

//CHARGEMENT DE LA PAGE : SET LE CONTENU DE LA PAGE EN FONCTION DE L'AUTHENTIFICATION DE L'UTILISATEUR
$(document).ready(function () {
    if (checkCookie("user")) {
        htmlProduct()
    }else {
        $("#content").html(htmlLogin)
    }
});

// --- DEBUT DES FONCTIONS POUR LA GESTION DES COOKIES ---
function checkCookie(cname) {
    var cookie = getCookie(cname);
    if (cookie != "") {
        console.log("true")
        return true;
    } else {
        console.log("false")
        return false;
    }
}
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function setCookie(cname, cvalue, exhour) {
    var d = new Date();
    d.setTime(d.getTime() + (exhour  * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
// --- FIN DES FONCTIONS POUR LA GESTION DES COOKIES ---

// --------------------------------------------------------------------------------------------------
// PARTIE IDENTIFICATION
// --------------------------------------------------------------------------------------------------

// REQUETE D'IDENTIFICATION POUR L'API, PERMET DE RECUPERER LE TOKEN
function getToken(username, password, callback){
    $.ajax({
        type: "POST",
        url: url + "login_check",
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            "username" : username, 
            "password" : password
        }),
        success: function (msg) {
            callback(null, msg.token)
        },
        error: function() {
            // console.log(msg.responseText)
            callback(new Error("Identification échoué"));
        }
    
    });
}

// SOUMET L'IDENTIFICATION AU CLICK DE L'UTISATEUR
$("#content").on("click","#login", function () {
    var password = $("#password").val();
    var username = $("#username").val();

    getToken(username, password, function(err, data){
        if (err) {
            //authentification échoué : remise du même formulaire avec pseudo utilisé
            $("#content").html(htmlLogin);
            $("#err").html(err);
            $("#username").val(username)
        }else{
            // authentification réussi : création d'un cookie user avec une durée de vie en heure
            var user = {
                username: username,
                token: data
            }; 
            setCookie("user", JSON.stringify(user), 6)
            htmlProduct()
        }
    })
    
})

// --------------------------------------------------------------------------------------------------
// PARTIE PRODUITS
// --------------------------------------------------------------------------------------------------

// REQUETES POUR OBTENIR LES VILLES, TAGS ET CATEGORIES
function getCities() {
    return $.ajax({
        type: "GET",
        url: url + "cities",
        headers: {
            'Content-Type': 'application/json'
        },
    });
}
function getTags(callback) {
    return $.ajax({
        type: "GET",
        url: url + "tags",
        headers: {
            'Content-Type': 'application/json'
        },
    });
}
function getCategories(callback) {
    return $.ajax({
        type: "GET",
        url: url + "categories",
        headers: {
            'Content-Type': 'application/json'
        },
    });
}
//Formulaire d'ajout d'un produit
function htmlProduct() {

    //obtentions des villes / tags / catégories
    $.when(
        getCities(), getCategories(), getTags()
    ).done(function (cities, categories, tags) {
        //input  : titre / description / image
        var html =
        '<h1>Mettre un produit en ligne</h1>' +
            '<input type="text" placeholder="Titre" id="title">' +
            '<input type="text" placeholder="Description" id="description">' +
            '<input type="text" placeholder="Image" id="image">' ;

        // menu déroulant des villes
        html += '<select id="city">';
        cities[0]["hydra:member"].forEach(city => {
            html += '<option value="' + city.id + '">' + city.name + '</option>'
        });
        html += '</select>';

        // menu déroulant des catégories
        html += '<select id="category">';
        categories[0]["hydra:member"].forEach(category => {
            html += '<option value="' + category.id + '">' + category.name + '</option>'
        });
        html += '</select>';

        // menu déroulant des catégories
        html += '<div>';
        tags[0]["hydra:member"].forEach(tag => {
            html += '<input type="checkbox" name="tag' + tag.id + '" value = "' + tag.id + '" />'+
                    '<label for="tag' + tag.id + '">' + tag.name + '</label>'
        });
        html += '</div>';

        // bouton de validation
        html += '<button id="newProduct">Mettre en ligne</button>';

        $("#content").html(html)
    });


    return true;
}




















//... en cours :

$("#content").on("click", "#newProduct", function () {
    var title = $("#title").val();
    var description = $("#description").val();
    var image = $("#image").val();
    var token = JSON.parse(getCookie("user")).token;
    console.log(title, description, image)
    $.ajax({
        type: "POST",
        url: url + "products",
        headers: {
            'Authorization': 'BEARER ' + token,
        },

        success: function (msg) {
            console.log(msg)
            token = msg;
        },
            data: JSON.stringify({
                "title": title,
                "description": description,
                "image": image,
                "city": city,
                "tags": tags,
                "category": category
            }),
        error: function (msg) {
            console.log(msg.responseText)
        },
    });

})


//   "title": "Lit 2 places",
//   "description": "test",
//   "image": "url de l'image",


//   "city": "/api/cities/1",
//   "tags": [
//     "/api/tags/6"
//   ],
//   "category": "/api/categories/1",


//dans symfony : ref - updateAt - delettedAt - user