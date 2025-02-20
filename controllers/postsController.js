const Post = require("../models/postsModel");
const { cretePostSchema } = require("../middlewares/validator");
exports.getAllPosts = async (req, res) => {
  const { page } = req.query;
  const postsPerPage = 10;

  try {
    let pageNum = 0;
    if (page <= 1) {
      pageNum = 0;
    } else {
      pageNum = page - 1;
    }
    const result = await Post.find()
      .sort({ createdAt: -1 })
      .skip(pageNum * postsPerPage)
      .limit(postsPerPage)
      .populate({
        path: "userID",
        select: "email",
      });
    res.status(200).json({ success: true, message: "posts", data: result });
  } catch (error) {
    console.log(error);
  }
};

exports.createPost = async (req, res) => {
  const { title, description } = req.body;
  const { userID } = req.user;
  try {
    const { error, value } = cretePostSchema.validate({
      title,
      description,
      userID,
    });
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const result = await Post.create({
      title,
      description,
      userID,
    });
    res.status(201).json({
      success: true,
      message: "posts created successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getDetailPost = async (req, res) => {
  const { _id } = req.query;
  try {
    // check exis post
    const existingPost = await Post.findOne({ _id }).populate({
      path: "userID",
      select: "email",
    });
    if (!existingPost) {
      return res
        .status(404)
        .json({ success: false, message: "Post Unavailable" });
    }
    res
      .status(200)
      .json({ success: true, message: "details post", data: existingPost });
  } catch (error) {
    console.log(error);
  }
};

exports.updatePost = async (req, res) => {
  const _id = req.query;
  const { title, description } = req.body;
  const { userID } = req.user;
  try {
    const { error, value } = cretePostSchema.validate({
      title,
      description,
      userID,
    });
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const existingPost = await Post.findOne({ _id });
    // check existing post
    if (!existingPost) {
      return res
        .status(404)
        .json({ success: false, message: "Post Unavailable" });
    }
    // check user
    if (existingPost.userID.toString() !== userID) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    // update data from user
    existingPost.title = title;
    existingPost.description = description;
    // save new data
    const result = await existingPost.save();
    res.status(201).json({
      success: true,
      message: "posts updated successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.deletePost = async (req, res) => {
  const _id = req.query;
  const { userID } = req.user;
  try {
    const existingPost = await Post.findOne({ _id });
    // check existing post
    if (!existingPost) {
      return res
        .status(404)
        .json({ success: false, message: "Post already Unavailable" });
    }
    // check user
    if (existingPost.userID.toString() !== userID) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    // delete post
    await Post.deleteOne(_id);
    res.status(201).json({
      success: true,
      message: "posts deleted successfully"
    });
  } catch (error) {
    console.log(error);
  }
};
