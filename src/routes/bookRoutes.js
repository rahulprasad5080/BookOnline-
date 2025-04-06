import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectRoute from "../middleware/middleware.js";

const router = express.Router();

//create book
router.post("/create", protectRoute, async (req, res) => {
    try {
        const { title, capation, image, rating } = req.body

        if (!image || !title || !capation || rating) {
            return res.status(400).json({ message: "Please Provide a All Fields " })
        }

        //upload the image the cloudnary
        const uploadImg = await cloudinary.uploader.upload(image)
        const imageUrl = uploadImg.secure_url

        //save the iamge in mongodb
        const newBook = new Book({
            author: req.user._id,
            capation,
            rating,
            title,
            image: imageUrl
        })

        await newBook.save()

        res.status(200).json(newBook)

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log(error);
    }
})

//get all book with pagination with infinite loading
router.post("/all", protectRoute, async (req, res) => {
    try {
        const page = req.query.page || 1
        const limit = req.query.limit || 10

        const skip = (page - 1) * limit

        const books = await Book.find().sort({ createdAt: -1 })//descending
            .skip(skip)
            .limit(limit)
            .populate("user", "username ProfilePicture")

        const total = await Book.countDocuments()
        res.send({
            books,
            currentPage: page,
            totalbooks: total,
            totalPages: Math.ceil(total / limit)

        })
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log(error);
    }
})

//get recommnetion by user 
router.get("/recomendation", protectRoute, async (req, res) => {
    try {

         const books = await Book.find({ author: req.user._id }).sort({ createdAt: -1 })
         res.json(books)
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log(error);

    }
})

//delete the book
router.delete("/delete/:id", protectRoute, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        if (!book) {
            return res.status(404).json({ message: "Book not found" })
        }

        //check if user  is the  creater of the book
        if (book.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "You are not authorized to delete this book" })
        }

        //delete iamge from cloudnary
        if (book.image && book.image.includes("cloudinary")) {
            try {
                const publicId = book.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);

            } catch (deleteError) {
                console.log("Error deleting image from Cloudinary:", deleteError);

            }
        }

        //delete the book
        await book.deleteOne()

        res.status(200).json({ message: "Book deleted successfully" })
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        console.log(error);

    }
})

export default router;
