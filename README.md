# Vinted

## 1ère étape : connexion & inscription

### Sign Up

- URL : http://localhost:3000/user/signup
- Méthode HTTP : POST

### Exemple de requête :

```json
{
  "username": "JohnDoe",
  "email": "johndoe@lereacteur.io",
  "password": "azerty",
  "newsletter": true
}
```

### Exemple de réponse :

```json
{
  "_id": "5b4cdf774f53952a5f849635",
  "token": "bmaDNrycfhCkmXYKRdRUrzSkUAW-8LuxfdUyfStVNFS1fklp1t17nBkZrRdSNh7W",
  "account": {
    "username": "JohnDoe"
  }
}
```

### Erreurs

Vous devrez gérer les cas d'erreur suivants :

- l'email renseigné lors de l'inscription existe déjà dans la base de données
- le username n'est pas renseigné

## Log In

- URL : http://localhost:3000/user/login
- Méthode HTTP : POST

### Exemple de requête :

```json
{
  "email": "johndoe@lereacteur.io",
  "password": "azerty"
}
```

### Exemple de réponse :

```json
{
  "_id": "5b4cdf774f53952a5f849635",
  "token": "bmaDNrycfhCkmXYKRdRUrzSkUAW-8LuxfdUyfStVNFS1fklp1t17nBkZrRdSNh7W",
  "account": {
    "username": "JohnDoe"
  }
}
```

### Aide

Vous pouvez utiliser le model suivant :

```js
{
  email: String,
  account: {
    username: String,
    avatar: Object,
  },
  newsletter: Boolean,
  token: String,
  hash: String,
  salt: String,
}
```

## 2ème étape : poster une annonce

### Publish

Service web qui permettra de **poster une annonce**. Chaque annonce doit avoir une **référence** vers l'utilisateur qui la poste.

Ce dernier doit bien sûr être **authentifié** pour pouvoir poster une annonce !

- URL : http://localhost:3000/offer/publish
- Méthode HTTP : **'POST'**
- Headers : **'Authorization Bearer Token'**
- Body de type **'formdata'** ayant comme clefs :
  - title
  - description
  - price
  - condition
  - city
  - brand
  - size
  - color
  - picture (clef de type 'File')

Exemple de réponse :

```json
{
  "_id": "5f89a72435e128e99550837e",
  "product_name": "Air Max 90",
  "product_description": "Air Max 90, très peu portées",
  "product_price": 80,
  "product_details": [
    {
      "MARQUE": "Nike"
    },
    {
      "TAILLE": "44"
    },
    {
      "ÉTAT": "Neuf"
    },
    {
      "COULEUR": "Blue"
    },
    {
      "EMPLACEMENT": "Paris"
    }
  ],
  "owner": {
    "account": {
      "username": "JohnDoe",
      "avatar": {
        // ...
        // Informations sur l'avatar (si l'utilisateur en a un)
        // ...
        "secure_url": "https://res.cloudinary.com/lereacteur-apollo/image/upload/v1602491671/api/vinted/users/5f84151633ef6e7461b4debe/avatar.jpg"
      }
    },
    "_id": "5f84151633ef6e7461b4debe"
  },
  "product_image": {
    // ...
    // informations sur l'image du produit
    "secure_url": "https://res.cloudinary.com/lereacteur-apollo/image/upload/v1602856743/api/vinted/offers/5f89a72435e128e99550837e/preview.jpg"
    // ...
  }
}
```

### Aide :

Le model **'Offer'** :

```js
const mongoose = require("mongoose");

const Offer = mongoose.model("Offer", {
  product_name: String,
  product_description: String,
  product_price: Number,
  product_details: Array,
  product_image: Object,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = Offer;
```

### Bonus

- Créer un middleware isAuthenticated pour vérifier que le créateur de l'annonce possède bien un compte.
- Faire en sorte que l'image d'une annonce s'enregistre sur cloudinary dans un dossier ayant ce chemin : /vinted/offers/5f042da1639b1c3c02314f6f dans lequel on retrouve l'id de l'offre.
- Créer des routes pour permettre aux créateurs des annonces de pouvoir les modifier (méthode HTTP PUT) et les supprimer (méthode HTTP DELETE).
- Modifier votre route /signup pour permettre l'upload d'une photo de profil
- Faire en sorte que le titre, la description et le prix soient limités à :
  - description : 500 caractères
  - title : 50 caractères
  - price : 100000
