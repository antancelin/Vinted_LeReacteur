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
