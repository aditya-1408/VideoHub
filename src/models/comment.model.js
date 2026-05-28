import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
 
const commentSchema = new Schema(
  {
    content:{
        type:String,
        required:true
    }     ,
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video",
        
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    }

  },{timestamps:true})

  commentSchema.plugin(mongooseAggregatePaginate); // plugin is used to add pagination functionality to the commentSchema, allowing for efficient retrieval of comment documents in a paginated manner. in simpler terms, it allows you to fetch comments in chunks (pages) rather than all at once, which can improve performance and user experience when dealing with a large number of comments.
  export const Comment = mongoose.model("Comment", commentSchema);