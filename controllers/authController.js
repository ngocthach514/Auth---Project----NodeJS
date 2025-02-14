const jwt = require("jsonwebtoken");
const {
  signupScheme,
  signinScheme,
  acceptCodeScheme,
} = require("../middlewares/validator");
const { doHash, doHashValidation, hmacProcess } = require("../utils/hashing");
const User = require("../models/usersModel");
const transport = require("../middlewares/sendMail");

exports.signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    // check validate
    const { error, value } = signupScheme.validate({ email, password });
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }
    // check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User already exists" });
    }
    // hash password
    const hashedPassword = await doHash(password, 12);
    const newUser = new User({
      email,
      password: hashedPassword,
    });
    // return user has been created
    const result = await newUser.save();
    result.password = undefined;
    res.status(201).json({
      success: true,
      message: "Your account has been created successfully",
      result,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    // check validate
    const { error, value } = signinScheme.validate({ email, password });
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }
    // check existing user
    const existingUser = await User.findOne({ email }).select("+password");
    if (!existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User does not exist" });
    }
    // hash password and compere with password in database
    const result = await doHashValidation(password, existingUser.password);
    if (!result) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }
    // create new token
    const token = jwt.sign(
      {
        userID: existingUser.id,
        email: existingUser.email,
        verified: existingUser.verified,
      },
      process.env.TOKEN_SECRET,
      {
        expiresIn: "8h",
      }
    );

    res
      .cookie("Authentication", "Bearer " + token, {
        expires: new Date(Date.now() + 8 * 3600000),
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
      })
      .json({
        success: true,
        token,
        message: "Login successfully",
      });
  } catch (error) {
    console.log(error);
  }
};

exports.logout = async (req, res) => {
  res
    .clearCookie("Authentication")
    .status(200)
    .json({ success: true, message: "Logout successfully" });
};

exports.sendVerificationCode = async (req, res) => {
  const { email } = req.body;
  try {
    // check existing user
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }
    if (existingUser.verified) {
      return res
        .status(400)
        .json({ success: false, message: "You are already verified" });
    }
    // create new code
    const codeValue = Math.floor(Math.random() * 1000000).toString();
    let info = await transport.sendMail({
      from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
      to: existingUser.email,
      subject: "Verification Code",
      html: "<h1>" + codeValue + "</h1>",
    });

    if (info.accepted[0] === existingUser.email) {
      const hashedValue = hmacProcess(
        codeValue,
        process.env.NODE_CODE_SENDING_EMAIL_SECRET
      );
      existingUser.verificationCode = hashedValue;
      existingUser.verificationCodeValidation = Date.now();
      await existingUser.save();
      return res.status(200).json({ success: true, message: "Code sent" });
    }
    res.status(400).json({ success: true, message: "Code sent failed" });
  } catch (error) {
    console.log(error);
  }
};

exports.verifyVerificationCode = async (req, res) => {
  const { email, providedCode } = req.body;
  try {
    // check validate
    const { error, value } = acceptCodeScheme.validate({ email, providedCode });
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const codeValue = providedCode.toString();
    const existingUser = await User.findOne({ email }).select(
      "+verificationCode +verificationCodeValidation"
    );

    if (!existingUser) {
      res.status(401).json({ success: false, message: "User does not exist" });
    }

    if (existingUser.verified) {
      return res
        .status(400)
        .json({ success: false, message: "You are already verified" });
    }

    if (
      !existingUser.verificationCode ||
      !existingUser.verificationCodeValidation
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Something is wrong with the code" });
    }

    if (Date.now() - existingUser.verificationCodeValidation > 5 * 6 * 1000) {
      return res
        .status(400)
        .json({ success: false, message: "Code has been expired" });
    }

    const hashedCodeValue = hmacProcess(
      codeValue,
      process.env.NODE_CODE_SENDING_EMAIL_SECRET
    );

    if (hashedCodeValue === existingUser.verificationCode) {
      existingUser.verified = true;
      existingUser.verificationCode = undefined;
      existingUser.verificationCodeValidation = undefined;
      await existingUser.save();
      return res
        .status(200)
        .json({ success: true, message: "Your account has been verified" });
    }

    return res
      .status(400)
      .json({ success: false, message: "Unexpected occured" });
  } catch (error) {
    console.log(error);
  }
};
