import { User, Message, Conversation } from "../models/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/index.js";
import { Op, where } from "sequelize";
import { Group } from "../models/group.js";
import { GroupMember } from "../models/group-member.js";

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
    const { senderId, receiverId, groupId, message } = req.body;

    if (!senderId || !message || (!receiverId && !groupId)) {
      return res.status(400).json({ message: "Missing required fields!" });
    }
    const sender = await User.findByPk(senderId);

    if (!sender) {
      return res.status(404).json({ message: "Sender not found!" });
    }

    if (groupId) {
      const group = await Group.findByPk(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found!" });
      }

      const isMember = await GroupMember.findOne({
        where: { groupId, userId: senderId },
      });

      if (!isMember) {
        return res.status(403).json({ message: "You are not a group member!" });
      }

      const msg = await Message.create({
        groupId,
        senderId,
        message,
      });

      return res.status(201).json({
        message: "Group message sent successfully!",
        data: msg,
      });
    }

    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found!" });
    }

    let conversation = await Conversation.findOne({
      where: { userId1: senderId, userId2: receiverId },
    });

    if (!conversation) {
      conversation = await Conversation.findOne({
        where: { userId1: receiverId, userId2: senderId },
      });
    }

    if (!conversation) {
      conversation = await Conversation.create({
        userId1: senderId,
        userId2: receiverId,
      });
    }

    const msg = await Message.create({
      conversationId: conversation.id,
      senderId,
      message,
    });

    return res.status(201).json({
      message: "Message sent successfully!",
      data: msg,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong!",
      error: error.message,
    });
  }
};

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

export const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Missing required fields!" })
    }
    const data = await User.findOne({ where: { email } })
    return res.status(200).json({ message: "User fetched successfully!", data })
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong!", error: error.message })
  }
}

export const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    const createdBy = req.user.id
    console.log("cretaedny",createdBy);
    
    if (!name || !Array.isArray(members) || !createdBy) {
      return res.status(400).json({ message: "Missing required fields!" })
    }
    const newGroup = await Group.create({ name, createdBy })
    await GroupMember.create({ groupId: newGroup.id, userId: createdBy, role: "admin" })

    if (members.length) {
      const groupmembers = members.map(userId => ({
        groupId: newGroup.id,
        userId,
        role: "member"
      }))
      await GroupMember.bulkCreate(groupmembers)
    }
    return res.status(201).json({ message: "Group member created successfully!" })
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong!", error: error.message })
  }
}

export const addMembersToGroup = async (req, res) => {
  try {
    const { groupId, userId } = req.body;
const adminId = req.user.id;
    if (!groupId || !userId) {
      return res.status(400).json({ message: "Missing required fields!" })
    }
    const isAdmin = await GroupMember.findOne({ where: { groupId, userId: adminId, role: "admin" } })
    if (!isAdmin) {
      return res.status(403).json({ message: "Only admin can add members!" })
    }
    const alreadyExist = await GroupMember.findOne({ where: { groupId, userId } })
    if (alreadyExist) {
      return res.status(400).json({ message: "User already added to group!" })
    }
    await GroupMember.create({ groupId, userId, role: "member" })
    return res.status(200).json({ message: "Member added successfully!" })
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong!", error: error.message })
  }
}

export const getMyGroups =async(req,res) =>{
  try {
    const userId = req.user.id
    const groups = await Group.findAll({include:[{model:GroupMember,as:"members",where:{userId},attributes:["role"],include:[{model:User,as:"user",attributes:["id","name","email"]}],required:true}]})
    return res.status(200).json({ message: "Data fetched successfully!", data:groups})
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong!", error: error.message })
  }
}

export const getGroupMembers =async(req,res) =>{
  try {
    const {groupId} = req.query
    const members = await GroupMember.findAll({where:{groupId},include:[{model:User,as:"user",attributes:["id","name","email"]}]})
    return res.status(200).json({ message: "Data fetched successfully!", data:members})
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong!", error: error.message })
  }
}

export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.query;
    const userId = req.user.id;

    if (!groupId|| !userId) {
      return res.status(400).json({ message: "GroupId is required!" });
    }

    const isMember = await GroupMember.findOne({
      where: { groupId, userId },
    });

    if (!isMember) {
      return res.status(403).json({ message: "Access denied!" });
    }

    const messages = await Message.findAll({
      where: { groupId },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    return res.status(200).json({
      message: "Messages fetched successfully!",
      data: messages,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong!",
      error: error.message,
    });
  }
};
