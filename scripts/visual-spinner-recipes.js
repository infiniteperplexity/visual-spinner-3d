recipes = {};
recipes.add = function(build) {recipes[build.movename] = build;}
recipes.add({movename: "Extension", build: "flower", spin: INSPIN, petals: 0, orient: THREE, entry: THREE, duration: 1, extend: 1, direction: CLOCKWISE});
recipes.add({movename: "Point Isolation", mode: BOX, build: "flower", spin: INSPIN, petals: 0, orient: THREE, entry: THREE, duration: 1, extend: 1, direction: CLOCKWISE});	
recipes.add({movename: "One-Petal In-Spin Flower", build: "flower", spin: INSPIN, petals: 1, orient: THREE, entry: THREE, duration: 1, extend: 1, direction: CLOCKWISE, mode: DIAMOND});	
recipes.add({movename: "Two-Petal In-Spin Flower", build: "flower", spin: INSPIN, petals: 2, orient: THREE, entry: THREE, duration: 1, extend: 1, direction: CLOCKWISE, mode: DIAMOND});	
recipes.add({movename: "Four-Petal In-Spin Flower", build: "flower", spin: INSPIN, petals: 4, orient: THREE, entry: THREE, duration: 1, extend: 1, direction: CLOCKWISE, mode: DIAMOND});	
recipes.add({movename: "Three-Petal Anti-Spin Flower", build: "flower", spin: ANTISPIN, petals: 3, orient: THREE, entry: THREE, duration: 1, extend: 1, direction: CLOCKWISE, mode: DIAMOND});	
recipes.add({movename: "Four-Petal Anti-Spin Flower", build: "flower", spin: ANTISPIN, petals: 4, orient: THREE, entry: THREE, duration: 1, extend: 1, direction: CLOCKWISE, mode: DIAMOND});	
recipes.add({movename: "Pendulum", build: "pendulum", entry: SIX, duration: 1, extend: 1, direction: CLOCKWISE});	
recipes.add({movename: "1.5", build: "onepointfive", entry: SIX, duration: 1, extend: 1, direction: CLOCKWISE});