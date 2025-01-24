import Post from "../models/Posts.js";
import * as dotenv from "dotenv";
import { createError } from "../error.js";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get all posts
export const getAllPosts = async(req, res, next) => {
    try {
        const posts = await Post.find({});
        return res.status(200).json({ success: true, data: posts });
    } catch (error) {
        const status = error.status || 500;
        const message =
            (error.response &&
                error.response.data &&
                error.response.data.error &&
                error.response.data.error.message) ||
            error.message ||
            "An unexpected error occurred";
        return next(createError(status, message));
    }
};

// Create new post
export const createPost = async(req, res, next) => {
    try {
        const { name, prompt, photo } = req.body;

        // Ensure 'photo' is provided
        if (!photo) {
            throw createError(400, "Photo is required");
        }

        // Upload photo to Cloudinary
        const photoUrl = await cloudinary.uploader.upload(photo);

        // Create a new post in the database
        const newPost = await Post.create({
            name,
            prompt,
            photo: photoUrl.secure_url,
        });

        return res.status(200).json({ success: true, data: newPost });
    } catch (error) {
        const status = error.status || 500;
        const message =
            (error.response &&
                error.response.data &&
                error.response.data.error &&
                error.response.data.error.message) ||
            error.message ||
            "An unexpected error occurred";

        console.error("Error creating post:", error); // For debugging purposes
        return next(createError(status, message));
    }
};