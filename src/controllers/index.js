import { User, Message, Conversation } from "../models";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config";
import { Op, where } from "sequelize";

export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      confirm_password,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !confirm_password
    ) {
      return res
        .status(400)
        .json({ message: "Missing required fields!" });
    }

    if (password !== confirm_password) {
      return res
        .status(400)
        .json({ message: "Password didn't match" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      phone,
      password: hashPassword,
    });

    return res
      .status(201)
      .json({ message: "User created successfully" });
  } catch (error) {
    console.log("Error registering user :", error);

    return res
      .status(500)
      .json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Missing required fields!" });
    }

    const findUser = await User.findOne({ where: { email } });

    if (!findUser) {
      return res
        .status(404).json({ message: "User not found!" })
    }

    const comparePassword = await bcrypt.compare(password, findUser.password);
    if (!comparePassword) {
      return res
        .status(500)
        .json({ message: "Internal Server Error" });
    }

    const token = await jwt.sign(
      {
        id: findUser.id,
        name: findUser.name,
        email: findUser.email,
        phone: findUser.phone,
      },
      config.jwt_secret_key,
      { expiresIn: "1d" }
    );

    return res
      .status(200)
      .json({ message: "Login successfully!", token });
  } catch (error) {
    console.log("Error login user : ", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const data = await User.findAll()
    return res
      .status(200)
      .json({ message: "Data Fetched successfully!", data });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error" });
  }
}

export const getAllMessages = async (req, res) => {
  try {
    const data = await Message.findAll()
    return res
      .status(200)
      .json({ message: "Data Fetched successfully!", data });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error" });
  }
}

export const getAllConversations = async (req, res) => {
  try {
    const data = await Conversation.findAll()
    return res
      .status(200)
      .json({ message: "Data Fetched successfully!", data });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error" });
  }
}

export const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;
    if (!senderId || !receiverId || !message) {
      return res.status(400).json({ message: "Missing required fields!" });
    }

    const checkSender = await User.findByPk(senderId);
    const checkReceiver = await User.findByPk(receiverId);

    if (!checkSender || !checkReceiver) {
      return res.status(404).json({ message: "User not exits!" });
    }

    let conversation = await Conversation.findOne({ where: { userId1: senderId, userId2: receiverId } });

    if (!conversation) {
      conversation = await Conversation.findOne({ where: { userId1: receiverId, userId2: senderId } });
    }

    if (!conversation) {
      conversation = await Conversation.create({ userId1: senderId, userId2: receiverId })
    }

    await Message.create({ conversationId: conversation.id, senderId, message })
    return res.status(201).json({ message: "Message sent successfully!" })

  } catch (error) {
    return res.status(500).json({ message: "Something went wrong!", error: error.message })
  }
}

export const getConversationMessages = async (req, res) => {
  try {
    const { userId1, userId2 } = req.query;

    let conversation = await Conversation.findOne({
      where: {
        [Op.or]: [{ userId1, userId2 }, { userId1: userId2, userId2: userId1 }]
      }
    })
    if (!conversation) {
      return res.status(200).json([])
    }
    const messages = await Message.findAll({
      where: {
        conversationId: conversation.id
      }, include: [
        { model: User, as: "sender", attributes: ["id", "name"] }
      ],
      order: [["id", "ASC"]]
    })
    return res.status(200).json(messages)
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong!", error: error.message })
  }
}

export const getUserByEmail = async(req,res) => {
  try {
    const {email} = req.query;
    if(!email){
      return res.status(400).json({ message: "Missing required fields!"})
    }
    const data = await User.findOne({where:{email}})
    return res.status(200).json({ message: "User fetched successfully!", data })
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong!", error: error.message })
  }
}