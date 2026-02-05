# Exemple d'utilisation de text-animations.js

## Utilisation dans vos pages Astro

Ajoutez simplement les attributs `data-text-*` sur vos éléments HTML :

```html
<!-- Animation de caractères avec fade -->
<h1 data-text-split="chars" data-text-animation="fade">
  Bonjour le monde
</h1>

<!-- Animation de mots avec slide up -->
<p data-text-split="words" data-text-animation="slideUp" data-text-stagger="0.05">
  Ceci est un texte qui s'anime mot par mot
</p>

<!-- Animation de lignes avec scale -->
<div 
  data-text-split="lines" 
  data-text-animation="scale" 
  data-text-duration="0.8"
  data-text-trigger="load"
>
  Première ligne<br>
  Deuxième ligne<br>
  Troisième ligne
</div>
```

## Attributs disponibles

| Attribut | Valeurs possibles | Par défaut | Description |
|----------|------------------|------------|-------------|
| `data-text-split` | `chars`, `words`, `lines` | `chars` | Type de découpage du texte |
| `data-text-animation` | `fade`, `slideUp`, `slideDown`, `scale` | `fade` | Type d'animation |
| `data-text-stagger` | nombre (ex: `0.02`, `0.1`) | `0.02` | Délai entre chaque élément |
| `data-text-duration` | nombre (ex: `0.6`, `1.0`) | `0.6` | Durée de l'animation |
| `data-text-trigger` | `scroll`, `load` | `scroll` | Déclencheur de l'animation |

## Exemples concrets

### Titre principal avec caractères
```html
<h1 
  data-text-split="chars" 
  data-text-animation="slideUp" 
  data-text-stagger="0.03"
  data-text-trigger="load"
>
  Portfolio Interactif
</h1>
```

### Paragraphe avec mots
```html
<p 
  data-text-split="words" 
  data-text-animation="fade" 
  data-text-stagger="0.05"
>
  Développeur créatif spécialisé en animations web
</p>
```

### Citation avec lignes
```html
<blockquote 
  data-text-split="lines" 
  data-text-animation="slideUp" 
  data-text-duration="0.8"
>
  "Le code est de la poésie"<br>
  - Un développeur passionné
</blockquote>
```

## Intégration avec Barba.js

Les animations de texte sont automatiquement réinitialisées lors des transitions de page grâce à l'appel dans `afterEnter` des transitions.

## CSS optionnel

Pour éviter le flash de contenu, vous pouvez ajouter :

```css
[data-text-split] {
  visibility: visible; /* SplitText gère l'opacité */
}
```
