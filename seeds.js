const mongoose = require("mongoose");
const Campground = require("./models/campground");
const Comment   = require("./models/comment");
 
var seeds = [
    {
        name: "Cloud's Rest", 
        image: "https://farm4.staticflickr.com/3795/10131087094_c1c0a1c859.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
    },
    {
        name: "Desert Mesa", 
        image: "https://farm6.staticflickr.com/5487/11519019346_f66401b6c1.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
    },
    {
        name: "Canyon Floor", 
        image: "https://farm1.staticflickr.com/189/493046463_841a18169e.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
    }
];
 
//NEW SYNTAX CODE WITH Async/Await 

async function seedDB() {
	try {
		//Remove all campgrounds
		await Campground.deleteMany({});
		console.log("campgrounds removed!");

		await Comment.deleteMany({});
		console.log("comments removed!");

		 //add a few campgrounds
		for (const seed of seeds) {

			let campground = await Campground.create(seed); 
			console.log("campground created!");
			//create a comment
			let comment1 = await Comment.create(
				{
					text: "This place is great, but I wish there was internet",
					author: "Homer"
				}
			);
			console.log("First comment created!");
			campground.comments.push(comment1);
			campground.save();
			console.log("Comment added to campground!");
			
			//ADD ANOTHER Comment
			//create a comment
			let comment2 = await Comment.create(
				{
					text: "This place is AWESOME...Perfect for having chilled Beers :)",
					author: "Singh"
				}
			);
			console.log("Another comment created!");
			campground.comments.push(comment2);
			campground.save();
			console.log("Another Comment added to campground!");
		}
		//add a few comments
	} catch(err) {
		console.log("OH NOO Got Error: " + err.message);
	} 
   
}

module.exports = seedDB;
