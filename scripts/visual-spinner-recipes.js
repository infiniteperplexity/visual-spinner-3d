recipes = {};
recipes.add = function(build) {recipes[build.movename] = build;}
recipes.add({movename: "Extension", build: "flower", spin: INSPIN, petals: 0});
recipes.add({movename: "Point Isolation", mode: BOX, build: "flower", spin: INSPIN, petals: 0});	
recipes.add({movename: "One-Petal In-Spin Flower", build: "flower", spin: INSPIN, petals: 1});	
recipes.add({movename: "Two-Petal In-Spin Flower", build: "flower", spin: INSPIN, petals: 2});	
recipes.add({movename: "Four-Petal In-Spin Flower", build: "flower", spin: INSPIN, petals: 4});	
recipes.add({movename: "Three-Petal Anti-Spin Flower", build: "flower", spin: ANTISPIN, petals: 3});	
recipes.add({movename: "Four-Petal Anti-Spin Flower", build: "flower", spin: ANTISPIN, petals: 4});	
recipes.add({movename: "Pendulum", build: "pendulum"});	
recipes.add({movename: "1.5", build: "onepointfive"});	