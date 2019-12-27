const mongoose = require("mongoose");
const Comment = require('./comment');

//SETUP Campground Schema
const campgroundSchema = new mongoose.Schema({
	name: String,
	price: String,
	image: String,
	description: String,
	createdAt: { type: Date, default: Date.now },
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
});

//PRE HOOK to Delete comments made on deleted campground (triggered by findOneAndDelete() method)
campgroundSchema.pre("findOneAndDelete", { query: true }, async function() {
	const docToDelete = await this.model.findOne(this.getQuery());
	await Comment.deleteMany({
		_id: {
			$in: docToDelete.comments
		}
	});
	console.log(" ...removing associated comments on Campground");
	
});

module.exports = mongoose.model("Campground", campgroundSchema);
