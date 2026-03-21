import User from "../models/User.js";

/* READ */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password'); // Exclude password
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error("Get user error:", err.message);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const friends = await Promise.all(
      user.friends.map((friendId) => User.findById(friendId).select('-password'))
    );
    const formattedFriends = friends
      .filter(friend => friend !== null) // Filter out deleted users
      .map(({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      });
    res.status(200).json(formattedFriends);
  } catch (err) {
    console.error("Get user friends error:", err.message);
    res.status(500).json({ error: "Failed to fetch friends" });
  }
};

/* UPDATE */
export const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    
    // Authorization check - user can only modify their own friend list
    if (req.user.id !== id) {
      return res.status(403).json({ error: "Not authorized to modify this user's friends" });
    }

    // Prevent adding yourself as friend
    if (id === friendId) {
      return res.status(400).json({ error: "Cannot add yourself as a friend" });
    }

    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.friends.includes(friendId)) {
      // Remove friend - Fixed the bug (was: id !== id, now: odlFriendId !== id)
      user.friends = user.friends.filter((oldFriendId) => oldFriendId !== friendId);
      friend.friends = friend.friends.filter((oldFriendId) => oldFriendId !== id);
    } else {
      user.friends.push(friendId);
      friend.friends.push(id);
    }
    await user.save();
    await friend.save();

    const friends = await Promise.all(
      user.friends.map((friendId) => User.findById(friendId).select('-password'))
    );
    const formattedFriends = friends
      .filter(friend => friend !== null)
      .map(({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      });

    res.status(200).json(formattedFriends);
  } catch (err) {
    console.error("Add/remove friend error:", err.message);
    res.status(500).json({ error: "Failed to update friends" });
  }
};
