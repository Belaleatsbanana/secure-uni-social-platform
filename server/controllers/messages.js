import mongoose from "mongoose";
import Message from "../models/Message.js";
import User from "../models/User.js";

/* GET CONVERSATIONS LIST */
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all unique users the current user has chatted with
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(userId) },
            { receiverId: new mongoose.Types.ObjectId(userId) },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", new mongoose.Types.ObjectId(userId)] },
              "$receiverId",
              "$senderId",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
    ]);

    // Get user details for each conversation
    const conversationUserIds = messages.map((m) => m._id);
    const users = await User.find({ _id: { $in: conversationUserIds } })
      .select("firstName lastName picturePath")
      .lean();

    const conversations = messages.map((msg) => {
      const user = users.find((u) => u._id.toString() === msg._id.toString());
      return {
        friendId: msg._id,
        friendName: user ? `${user.firstName} ${user.lastName}` : "Unknown",
        friendPicturePath: user?.picturePath || "",
        lastMessage: msg.lastMessage.content,
        lastMessageTime: msg.lastMessage.createdAt,
        unread: msg.lastMessage.receiverId.toString() === userId && !msg.lastMessage.read,
      };
    });

    res.status(200).json(conversations);
  } catch (err) {
    console.error("Get conversations error:", err.message);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

/* GET MESSAGES BETWEEN TWO USERS */
export const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;

    // Verify friendship
    const user = await User.findById(userId);
    const isFriend = user.friends.some((f) => f._id?.toString() === friendId || f === friendId);
    
    if (!isFriend) {
      return res.status(403).json({ error: "You can only chat with friends" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .limit(100);

    // Mark messages as read
    await Message.updateMany(
      { senderId: friendId, receiverId: userId, read: false },
      { read: true }
    );

    res.status(200).json(messages);
  } catch (err) {
    console.error("Get messages error:", err.message);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

/* SEND MESSAGE */
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Message content is required" });
    }

    if (content.length > 2000) {
      return res.status(400).json({ error: "Message too long (max 2000 characters)" });
    }

    // Verify friendship
    const user = await User.findById(senderId);
    const isFriend = user.friends.some((f) => f._id?.toString() === receiverId || f === receiverId);
    
    if (!isFriend) {
      return res.status(403).json({ error: "You can only chat with friends" });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      content: content.trim(),
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    console.error("Send message error:", err.message);
    res.status(500).json({ error: "Failed to send message" });
  }
};
