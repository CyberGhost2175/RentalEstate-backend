import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        text: {
            type: String,
            required: true,
            unique: true,
        },
        typeOfPost: {
            type: String,
            required: true,
        },
        typeOfProperty:{
            type:String,
            required:true
        },
        viewsCount: {
            type: Number,
            default: 0,
        },
        price:{
            type: Number,
            required:true
        },
        countOfRooms:{
            type: Number,
            required:true
        },
        yearOfConstruction:{
            type:Number,
            required:true
        },
            totalArea:{
            type:Number,
            required:true
        },

        likesCount:{
            type: Number,
            default: 0,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        imageUrl: String,
    },
    {
        timestamps: true,
    },
);

export default mongoose.model('Post', PostSchema);
