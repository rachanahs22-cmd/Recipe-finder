import axios from 'axios';
import localApi from './axios'; // Import configured axios instance

const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY ? import.meta.env.VITE_SPOONACULAR_API_KEY.replace(/"/g, '') : null;
const SPOONACULAR_BASE = 'https://api.spoonacular.com/recipes';
const MEALDB_BASE = import.meta.env.VITE_MEALDB_BASE_URL || 'https://www.themealdb.com/api/json/v1/1';

// Normalizer for TheMealDB
const normalizeMealDB = (meal) => {
    // Extract ingredients
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const name = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (name && name.trim()) {
            ingredients.push({
                name: name,
                amount: measure, // TheMealDB stores amount as string "1 cup", so we put it here
                unit: '',
                original: `${measure} ${name}`
            });
        }
    }

    // Split instructions
    const steps = meal.strInstructions.split(/\r\n|\n|\./).filter(s => s.trim().length > 5).map((s, i) => ({
        number: i + 1,
        step: s.trim(),
        ingredients: [],
        equipment: []
    }));

    return {
        id: parseInt(meal.idMeal), // MealDB IDs are usually 5 digits, safe to parse
        title: meal.strMeal,
        image: meal.strMealThumb,
        readyInMinutes: 30, // Default estimate
        servings: 2, // Default
        instructions: meal.strInstructions,
        analyzedInstructions: [{ name: "", steps }],
        extendedIngredients: ingredients,
        ingredients: ingredients, // Map for compatibility
        source: 'TheMealDB'
    };
};

// Fetch from TheMealDB
const fetchTheMealDB = async (query) => {
    try {
        console.log(`Fetching from TheMealDB: ${query}`);
        const url = query
            ? `${MEALDB_BASE}/search.php?s=${query}`
            : `${MEALDB_BASE}/search.php?s=`; // Random/empty search usually returns selection or we can use random.php loop

        const { data } = await axios.get(url);
        if (!data.meals) return [];
        return data.meals.map(normalizeMealDB);
    } catch (error) {
        console.error("TheMealDB Error:", error);
        return [];
    }
};

export const searchRecipes = async (query, filters = {}) => {
    const filterMock = (q, offset = 0, number = 10) => {
        console.log('Searching Mock Data for:', q);
        let results = mockRecipes;
        if (q && q.trim().length > 0) {
            const lowerQ = q.toLowerCase();
            results = results.filter(r => r.title.toLowerCase().includes(lowerQ));
        }
        return {
            results: results.slice(offset, offset + number),
            totalResults: results.length,
            offset
        };
    };

    let results = [];

    // 1. Try Spoonacular if Key exists
    if (API_KEY && API_KEY !== 'your_api_key_here') {
        try {
            const response = await axios.get(`${SPOONACULAR_BASE}/complexSearch`, {
                params: {
                    apiKey: API_KEY,
                    query,
                    number: 20,
                    offset: filters.offset || 0,
                    addRecipeInformation: true,
                }
            });
            return response.data;
        } catch (error) {
            console.error("Spoonacular failed, trying fallback...", error);
        }
    }

    // 2. Try TheMealDB (Free, Robust)
    if (!filters.offset || filters.offset === 0) {
        const mealDBResults = await fetchTheMealDB(query);
        results = [...results, ...mealDBResults];

        // 2b. ALSO Fetch Local DB Results (Smart Text Search)
        try {
            const { data: localData } = await localApi.get(`/recipes${query ? `?search=${encodeURIComponent(query)}` : ''}`);
            results = [...results, ...localData.map(r => ({ ...r, id: r._id }))]; // Normalize ID
        } catch (err) {
            console.error("Local search failed", err);
        }
    }

    // 3. Add Mock Data if needed or if results are empty
    if (results.length < 5) {
        const mockRes = filterMock(query, 0, 50).results;
        results = [...results, ...mockRes];
    }

    // De-duplicate by ID just in case
    const uniqueResults = Array.from(new Map(results.map(item => [item.id, item])).values());

    return {
        results: uniqueResults,
        totalResults: uniqueResults.length,
        offset: 0
    };
};

export const getRecipeInformation = async (id) => {
    // 0. Check Local Backend (Mongo ID format: 24 hex chars)
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
        try {
            const { data } = await localApi.get(`/recipes/${id}`);
            return data;
        } catch (error) {
            console.error("Local recipe fetch failed", error);
            // Don't throw immediately, let it fall through just in case, but usually this is it.
        }
    }
    // 1. Check Mock
    const mockFound = mockRecipes.find(r => r.id === parseInt(id));
    if (mockFound) return mockFound;

    // 2. Check TheMealDB (ID is usually 5 digits, Spoonacular is 6-7 digits)
    // MealDB IDs are strings in response but we parsed to int. 
    // If we clicked a MealDB result, we need to fetch details.
    try {
        const { data } = await axios.get(`${MEALDB_BASE}/lookup.php?i=${id}`);
        if (data.meals && data.meals.length > 0) {
            return normalizeMealDB(data.meals[0]);
        }
    } catch (e) { /* Ignore */ }

    // 3. Check Spoonacular
    if (API_KEY && API_KEY !== 'your_api_key_here') {
        try {
            const response = await axios.get(`${SPOONACULAR_BASE}/${id}/information`, {
                params: { apiKey: API_KEY }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching recipe info", error);
        }
    }

    throw new Error("Recipe not found");
};

export const getRecipeAIAnalysis = async (query) => {
    try {
        // Query our local backend which calls Gemini
        const { data } = await localApi.get(`/ai/search?query=${encodeURIComponent(query)}`);
        return data;
    } catch (error) {
        console.error("AI Analysis Failed:", error);
        return null;
    }
};

const mockRecipes = [
    {
        id: 101,
        title: 'Classic Spaghetti Carbonara',
        image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=500&q=80',
        readyInMinutes: 25,
        servings: 4,
        instructions: '<p>Cook pasta. Fry pancetta. Whisk eggs and cheese. Combine off heat.</p>',
        analyzedInstructions: [
            {
                name: "",
                steps: [
                    { number: 1, step: "Cook spaghetti in boiling salted water until al dente.", ingredients: [], equipment: [] },
                    { number: 2, step: "Fry pancetta in a pan until crisp.", ingredients: [], equipment: [] },
                    { number: 3, step: "Whisk eggs and parmesan cheese together in a bowl.", ingredients: [], equipment: [] },
                    { number: 4, step: "Drain pasta and toss with pancetta.", ingredients: [], equipment: [] },
                    { number: 5, step: "Remove from heat and quickly mix in the egg mixture to create a creamy sauce.", ingredients: [], equipment: [] }
                ]
            }
        ],
        ingredients: [{ name: 'Spaghetti', amount: 400, unit: 'g' }, { name: 'Eggs', amount: 4, unit: '' }]
    },
    {
        id: 102,
        title: 'Creamy Chicken Curry',
        image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=500&q=80',
        readyInMinutes: 40,
        servings: 4,
        instructions: '<p>Sauté onions and spices. Add chicken and cook. Stir in coconut milk.</p>',
        analyzedInstructions: [
            {
                name: "",
                steps: [
                    { number: 1, step: "Sauté onions, garlic, and ginger until fragrant.", ingredients: [], equipment: [] },
                    { number: 2, step: "Add curry spices and cook for another minute.", ingredients: [], equipment: [] },
                    { number: 3, step: "Add chicken pieces and brown on all sides.", ingredients: [], equipment: [] },
                    { number: 4, step: "Stir in coconut milk and simmer for 20 minutes.", ingredients: [], equipment: [] },
                    { number: 5, step: "Serve hot with rice.", ingredients: [], equipment: [] }
                ]
            }
        ],
        ingredients: [{ name: 'Chicken', amount: 500, unit: 'g' }, { name: 'Coconut Milk', amount: 400, unit: 'ml' }]
    },
    {
        id: 103,
        title: 'Homemade Pepperoni Pizza',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80',
        readyInMinutes: 60,
        servings: 8,
        instructions: '<p>Roll dough. Add sauce and cheese. Top with pepperoni. Bake at 400F.</p>',
        analyzedInstructions: [
            {
                name: "",
                steps: [
                    { number: 1, step: "Preheat oven to 400°F (200°C).", ingredients: [], equipment: [] },
                    { number: 2, step: "Roll out the pizza dough on a floured surface.", ingredients: [], equipment: [] },
                    { number: 3, step: "Spread tomato sauce evenly over the dough.", ingredients: [], equipment: [] },
                    { number: 4, step: "Sprinkle mozzarella cheese and top with pepperoni slices.", ingredients: [], equipment: [] },
                    { number: 5, step: "Bake for 15-20 minutes until crust is golden.", ingredients: [], equipment: [] }
                ]
            }
        ],
        ingredients: [{ name: 'Dough', amount: 1, unit: 'ball' }, { name: 'Pepperoni', amount: 100, unit: 'g' }]
    },
    {
        id: 104,
        title: 'Fresh Garden Salad',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=80',
        readyInMinutes: 10,
        servings: 2,
        instructions: '<p>Chop vegetables. Toss with dressing. Serve cold.</p>',
        analyzedInstructions: [
            {
                name: "",
                steps: [
                    { number: 1, step: "Wash and chop lettuce, tomatoes, and cucumbers.", ingredients: [], equipment: [] },
                    { number: 2, step: "Place all vegetables in a large salad bowl.", ingredients: [], equipment: [] },
                    { number: 3, step: "Drizzle with olive oil and vinegar dressing.", ingredients: [], equipment: [] },
                    { number: 4, step: "Toss well to combine.", ingredients: [], equipment: [] },
                    { number: 5, step: "Serve immediately.", ingredients: [], equipment: [] }
                ]
            }
        ],
        ingredients: [{ name: 'Lettuce', amount: 1, unit: 'head' }, { name: 'Tomatoes', amount: 2, unit: '' }]
    },
    {
        id: 105,
        title: 'Grilled Salmon with Asparagus',
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a7270028d?auto=format&fit=crop&w=500&q=80',
        readyInMinutes: 20,
        servings: 2,
        instructions: '<p>Season salmon. Grill for 4 mins per side. Grill asparagus.</p>',
        analyzedInstructions: [
            {
                name: "",
                steps: [
                    { number: 1, step: "Season salmon fillets with salt, pepper, and lemon juice.", ingredients: [], equipment: [] },
                    { number: 2, step: "Preheat grill to medium-high heat.", ingredients: [], equipment: [] },
                    { number: 3, step: "Grill salmon for 4-5 minutes per side.", ingredients: [], equipment: [] },
                    { number: 4, step: "Toss asparagus in olive oil and grill for 3-4 minutes.", ingredients: [], equipment: [] },
                    { number: 5, step: "Serve salmon alongside asparagus.", ingredients: [], equipment: [] }
                ]
            }
        ],
        ingredients: [{ name: 'Salmon Fillet', amount: 2, unit: '' }, { name: 'Asparagus', amount: 1, unit: 'bunch' }]
    },
    {
        id: 106,
        title: 'Beef Tacos',
        image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=500&q=80',
        readyInMinutes: 30,
        servings: 4,
        instructions: '<p>Cook beef with spices. Warm tortillas. Assemble with toppings.</p>',
        analyzedInstructions: [
            {
                name: "",
                steps: [
                    { number: 1, step: "Brown ground beef in a skillet over medium heat.", ingredients: [], equipment: [] },
                    { number: 2, step: "Add taco seasoning and a splash of water.", ingredients: [], equipment: [] },
                    { number: 3, step: "Simmer until sauce thickens.", ingredients: [], equipment: [] },
                    { number: 4, step: "Warm taco shells in the oven.", ingredients: [], equipment: [] },
                    { number: 5, step: "Fill shells with beef and top with cheese, lettuce, and salsa.", ingredients: [], equipment: [] }
                ]
            }
        ],
        ingredients: [{ name: 'Ground Beef', amount: 500, unit: 'g' }, { name: 'Taco Shells', amount: 12, unit: '' }]
    },
    {
        id: 107,
        title: 'Berry Smoothie Bowl',
        image: 'https://images.unsplash.com/photo-1577805947697-b98438db0745?auto=format&fit=crop&w=500&q=80',
        readyInMinutes: 5,
        servings: 1,
        instructions: '<p>Blend berries and yogurt. Pour into bowl. Top with granola.</p>',
        analyzedInstructions: [
            {
                name: "",
                steps: [
                    { number: 1, step: "Place frozen berries and yogurt in a blender.", ingredients: [], equipment: [] },
                    { number: 2, step: "Blend until smooth and creamy.", ingredients: [], equipment: [] },
                    { number: 3, step: "Pour mixture into a serving bowl.", ingredients: [], equipment: [] },
                    { number: 4, step: "Top with granola, fresh fruit, and honey.", ingredients: [], equipment: [] }
                ]
            }
        ],
        ingredients: [{ name: 'Mixed Berries', amount: 1, unit: 'cup' }, { name: 'Yogurt', amount: 1, unit: 'cup' }]
    },
    {
        id: 108,
        title: 'Mushroom Risotto',
        image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=500&q=80',
        readyInMinutes: 45,
        servings: 4,
        instructions: '<p>Sauté mushrooms. Cook rice via absorption method with broth. Stir in butter.</p>',
        analyzedInstructions: [
            {
                name: "",
                steps: [
                    { number: 1, step: "Sauté mushrooms in butter until golden.", ingredients: [], equipment: [] },
                    { number: 2, step: "Add arborio rice and toast for 1 minute.", ingredients: [], equipment: [] },
                    { number: 3, step: "Gradually add hot broth, one ladle at a time, transforming stirring constantly.", ingredients: [], equipment: [] },
                    { number: 4, step: "Cook until rice is creamy and tender.", ingredients: [], equipment: [] },
                    { number: 5, step: "Stir in parmesan cheese and butter before serving.", ingredients: [], equipment: [] }
                ]
            }
        ],
        ingredients: [{ name: 'Arborio Rice', amount: 2, unit: 'cup' }, { name: 'Mushrooms', amount: 200, unit: 'g' }]
    },
    {
        id: 109,
        title: 'Classic Cheeseburger',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
        readyInMinutes: 20,
        servings: 2,
        instructions: '<p>Grill beef patty. Melt cheese. Assemble with lettuce, tomato, and bun.</p>',
        analyzedInstructions: [
            {
                name: "",
                steps: [
                    { number: 1, step: "Season the beef patty with salt and pepper.", ingredients: [], equipment: [] },
                    { number: 2, step: "Grill the patty over medium-high heat for 3-4 minutes per side.", ingredients: [], equipment: [] },
                    { number: 3, step: "Place a slice of cheese on the patty during the last minute of cooking to melt.", ingredients: [], equipment: [] },
                    { number: 4, step: "Toast the bun lightly.", ingredients: [], equipment: [] },
                    { number: 5, step: "Assemble the burger with lettuce, tomato, and your favorite sauces.", ingredients: [], equipment: [] }
                ]
            }
        ],
        ingredients: [{ name: 'Beef Patty', amount: 2, unit: '' }, { name: 'Cheese', amount: 2, unit: 'slices' }, { name: 'Bun', amount: 2, unit: '' }]
    }
];
