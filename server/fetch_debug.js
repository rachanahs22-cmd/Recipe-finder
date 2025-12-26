const http = require('http');

http.get('http://127.0.0.1:5000/api/recipes/debug/dump', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const db = JSON.parse(data);
        const vinu = db.users.find(u => u.name === 'Vinutha');
        if (!vinu) { console.log('User Vinutha not found'); return; }

        console.log(`Vinutha ID: ${vinu._id}`);
        const myRecipes = db.recipes.filter(r => r.user === vinu._id);
        console.log(`Recipes owned by Vinutha: ${myRecipes.length}`);
        myRecipes.forEach(r => console.log(`- ${r.title}`));

        const otherRecipes = db.recipes.filter(r => r.user !== vinu._id);
        console.log(`Other recipes: ${otherRecipes.length}`);
        otherRecipes.forEach(r => console.log(`- ${r.title} (User: ${r.user})`));
    });
}).on('error', err => console.log(err.message));
