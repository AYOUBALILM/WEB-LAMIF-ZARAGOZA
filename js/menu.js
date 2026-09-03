// ========================================
// LA MIF - Menú oficial (carta real)
// ========================================

window.LaMIF_MENU = [
    {
        cat: 'burgers',
        label: 'Hamburguesas',
        emoji: '🍔',
        note: 'Precio solo | en menú (patatas fritas + bebida)',
        supplements: 'Extras: +carne 2€ · +queso 1€ · +huevo 0,50€ · +bacon 1€ · +Salsa President 1€',
        items: [
            { n: 'Cheese Burger', d: 'Hamburguesa (50g), cheddar, salsa al gusto, ensaladas al gusto', a: 4, m: 6, b: 'Con queso' },
            { n: 'Double Cheese', d: '2 hamburguesas (50g), cheddar, salsa al gusto, ensaladas al gusto', a: 5, m: 7 },
            { n: 'Bacon Cheese', d: 'Hamburguesa (50g), cheddar, bacon, salsa al gusto, ensaladas al gusto', a: 5, m: 7 },
            { n: 'Fish Burger', d: 'Pescado empanado, cheddar, salsa al gusto, ensaladas al gusto', a: 5, m: 7 },
            { n: 'Chicken Burger', d: 'Pollo empanado, cheddar, salsa al gusto, ensaladas al gusto', a: 5, m: 7 },
            { n: 'Triple Cheese', d: '3 hamburguesas (50g), cheddar, salsa al gusto, ensaladas al gusto', a: 7, m: 9, b: 'Triple' },
            { n: 'Big Burger', d: '2 hamburguesas (50g), cheddar, salsa al gusto, ensaladas al gusto', a: 7, m: 9, b: 'Popular' },
            { n: 'Snatch Burger', d: 'Hamburguesa (100g), cheddar, salsa al gusto, ensaladas al gusto', a: 8, m: 10, b: 'Nueva' },
            { n: 'Country Burger', d: 'Hamburguesa (100g), bacon, huevo, cheddar, salsa al gusto, ensaladas al gusto', a: 8, m: 10 },
            { n: 'Boursin Burger', d: 'Hamburguesa (100g), rösti, queso, boursin, salsa al gusto, ensaladas al gusto', a: 8, m: 10 },
            { n: 'Raclette Burger', d: 'Hamburguesa (100g), queso raclette, rösti, salsa al gusto, ensaladas al gusto', a: 9, m: 11 },
            { n: 'Cordon Bleu Burger', d: 'Hamburguesa (50g), cordon bleu, cheddar, salsa al gusto, ensaladas al gusto', a: 9, m: 11 },
            { n: 'Especial Volcano', d: 'Hamburguesa (100g), cheddar, salsa al gusto, ensaladas al gusto', a: 9, m: 11, b: 'Especial' },
            { n: 'Duo.1', d: 'Cheese Burger + Double Cheese, salsa al gusto, ensaladas al gusto', a: null, m: 10 },
            { n: 'Duo.2', d: 'Cheese Burger + Croque Monsieur, salsa al gusto, ensaladas al gusto', a: null, m: 10 }
        ]
    },
    {
        cat: 'sandwiches',
        label: 'Sandwiches',
        emoji: '🥪',
        note: 'Precio solo | en menú (patatas fritas + bebida)',
        items: [
            { n: 'Filete de Pollo', d: 'Filete de pollo, cheddar, salsa al gusto, ensaladas al gusto', a: 7, m: 9 },
            { n: 'Kebab', d: 'Kebab, cheddar, salsa al gusto, ensaladas al gusto', a: 7, m: 9 },
            { n: 'Tandoori', d: 'Tandoori, cheddar, salsa al gusto, ensaladas al gusto', a: 7, m: 9 },
            { n: 'Merguez', d: 'Merguez, cheddar, salsa al gusto, ensaladas al gusto', a: 7, m: 9 },
            { n: 'Americano', d: '2 steaks (50g), cheddar, salsa al gusto, ensaladas al gusto', a: 7, m: 9 },
            { n: 'Must', d: '2 steaks (50g), huevo, pavo, cheddar, salsa al gusto, ensaladas al gusto', a: 8, m: 10 },
            { n: 'Filete Boursin', d: 'Filete de pollo, cheddar, boursin, salsa al gusto, ensaladas al gusto', a: 8, m: 10 },
            { n: 'Cordon Bleu', d: '2 cordon bleu, cheddar, salsa al gusto, ensaladas al gusto', a: 9, m: 11, b: 'Favorito' },
            { n: 'Raclette', d: 'Filete de pollo, 2 steaks (50g), raclette, cheddar, rösti, salsa al gusto, ensaladas al gusto', a: 9, m: 11 },
            { n: 'Wrap Chicken', d: 'Pollo empanado, cheddar, rösti, cebolla frita, salsa al gusto, ensaladas al gusto', a: 9, m: 11 },
            { n: 'Wrap Falafel', d: 'Falafel, cheddar, rösti, cebolla frita, salsa al gusto, ensaladas al gusto', a: 9, m: 10 },
            { n: 'Buket Solo', d: '4 tenders, 4 wings, 1 patatas fritas, 1 bebida', a: null, m: 10, b: 'Para compartir' }
        ]
    },
    {
        cat: 'tacos',
        label: 'Tacos o Bowls',
        emoji: '🌯',
        note: 'Precio solo | en menú. Elige entre las carnes: Tandoori, Filete Escalope, Steak Ternera, Kebab, Merguez, Tenders, Cordon Bleu, Nuggets, Falafel',
        items: [
            { n: '1 Carne', d: 'Tacos o bowl con 1 carne a elegir', a: 7, m: 9 },
            { n: '2 Carnes', d: 'Tacos o bowl con 2 carnes a elegir', a: 8, m: 10 },
            { n: '3 Carnes', d: 'Tacos o bowl con 3 carnes a elegir', a: 9, m: 11 },
            { n: 'Rey de la Comida', d: 'Cordon bleu, tandoori, mozzarella, salsa champiñón, salsa de queso, salsa argelina', a: 12, m: null, b: 'Especial' }
        ]
    },
    {
        cat: 'platos',
        label: 'Platos',
        emoji: '🍽️',
        note: 'Precio solo | en menú (patatas fritas, arroz, salsa champiñón, ensaladas y bebida)',
        items: [
            { n: 'Filete Francés César', d: 'Escalope filete, patatas fritas, arroz, salsa champiñón, ensaladas, bebida', a: 12, m: 14 },
            { n: 'Chicken Tandoori', d: 'Chicken tandoori, patatas fritas, arroz, salsa champiñón, ensaladas, bebida', a: 12, m: 14 },
            { n: 'Kebab', d: 'Kebab, patatas fritas, arroz, salsa champiñón, ensaladas, bebida', a: 12, m: 14 },
            { n: 'Merguez', d: 'Merguez, patatas fritas, arroz, salsa champiñón, ensaladas, bebida', a: 12, m: 14 },
            { n: 'Cordon Bleu', d: 'Cordon bleu, patatas fritas, arroz, salsa champiñón, ensaladas, bebida', a: 12, m: 14 },
            { n: 'Plato del Chef', d: 'Sorpresa del chef', a: 12, m: 14, b: 'Sorpresa' }
        ]
    },
    {
        cat: 'ensaladas',
        label: 'Ensaladas',
        emoji: '🥗',
        items: [
            { n: 'Verdura', d: 'Ensaladas al gusto', a: 5, m: null },
            { n: 'César', d: 'Ensaladas, pollo, queso', a: 7, m: null },
            { n: 'Cabra Tostado', d: 'Ensaladas, queso de cabra gratinado, pan tostado', a: 7, m: null },
            { n: 'Cordon Bleu', d: 'Ensaladas, cordon bleu, queso', a: 8, m: null }
        ]
    },
    {
        cat: 'croques',
        label: 'Croques',
        emoji: '🥖',
        items: [
            { n: 'Croque Mr', d: 'El clásico croque con queso fundido', a: 5, m: null },
            { n: 'Croque Cabra', d: 'Croque con queso de cabra gratinado', a: 6, m: null },
            { n: 'Croque Steak', d: 'Croque con steak a elegir y queso fundido', a: 6, m: null }
        ]
    },
    {
        cat: 'extras',
        label: 'Extras',
        emoji: '🍟',
        items: [
            { n: 'Patatas fritas', d: 'Crujientes y caseras', a: 2.5, m: null },
            { n: 'Patatas con cheddar', d: 'Suplemento sobre patatas fritas', a: 1, m: null },
            { n: '4 Nuggets', d: 'Crujientes de pollo', a: 3, m: null },
            { n: '4 Aros de cebolla', d: 'Dorados y crujientes', a: 3, m: null },
            { n: '4 Mozza', d: 'Palitos de mozzarella', a: 3, m: null },
            { n: '4 Jalapeños', d: 'Con queso', a: 3, m: null },
            { n: '4 Wings', d: 'Alitas de pollo', a: 3, m: null },
            { n: '4 Rösti', d: 'Crujientes de patata', a: 3, m: null },
            { n: '4 Tenders', d: 'Tiras de pollo empanadas', a: 4, m: null }
        ]
    }
];