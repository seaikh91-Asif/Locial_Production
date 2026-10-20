import fs from "fs"; 
import imagekit from "../configs/imagekit.js";
import Post from "../src/models/Post.js";

// Add Post 
export const addPost = async (req, res) => {
    try {
        const { userId } = req.auth(); // Assuming this is from Clerk or similar
        const { content, post_type } = req.body; 
        const images = req.files;

        let image_urls = [];

        // Use optional chaining in case req.files is undefined
        if (images?.length) {
            image_urls = await Promise.all(
                images.map(async (image) => {
                    const fileBuffer = fs.readFileSync(image.path);
                    
                    // The standard ImageKit SDK method is imagekit.upload()
                    const response = await imagekit.upload({
                        file: fileBuffer,
                        fileName: image.originalname,
                        folder: "posts", 
                    });

                    // Build the optimized URL
                    const optimizedUrl = imagekit.url({
                        src: response.url,
                        transformation: [
                            { quality: 'auto' }, 
                            { format: 'webp' },
                            { width: 1280 }
                        ],
                    });
                    
                    // Return the generated URL string directly
                    return optimizedUrl;
                })
            );
        }

        await Post.create({
            user: userId,
            content, 
            image_urls, // Now matches the variable initialized above
            post_type
        });
        
        res.json({success: true, message: "Post created Successfully"}); 

    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message }); 
    }
};