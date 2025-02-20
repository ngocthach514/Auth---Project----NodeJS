const express = require("express");
const postsController = require("../controllers/postsController");
const { identifier } = require("../middlewares/identification");
const router = express.Router();

router.get("/all-posts", postsController.getAllPosts);
router.get("/details-post", postsController.getDetailPost);
router.post("/create-post", identifier, postsController.createPost);
router.put("/update-post", identifier, postsController.updatePost);
router.delete("/delete-post", identifier, postsController.deletePost);
module.exports = router;
