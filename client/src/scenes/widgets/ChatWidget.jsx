import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  InputBase,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from "@mui/material";
import { Close, SendOutlined, ArrowBack } from "@mui/icons-material";
import { useSelector } from "react-redux";
import UserImage from "components/UserImage";
import FlexBetween from "components/FlexBetween";

const ChatWidget = ({ open, onClose, initialFriendId = null }) => {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  
  const token = useSelector((state) => state.token);
  const user = useSelector((state) => state.user);
  const friends = useSelector((state) => state.user?.friends || []);
  
  const messagesEndRef = useRef(null);
  const { palette } = useTheme();
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch messages with a friend
  const fetchMessages = useCallback(async (friendId) => {
    try {
      const response = await fetch(`http://localhost:3001/messages/${friendId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  }, [token]);

  // Send a message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedFriend) return;
    
    try {
      const response = await fetch("http://localhost:3001/messages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: selectedFriend._id,
          content: newMessage,
        }),
      });
      
      if (response.ok) {
        const message = await response.json();
        setMessages((prev) => [...prev, message]);
        setNewMessage("");
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Select a friend to chat with
  const selectFriend = useCallback((friend) => {
    setSelectedFriend(friend);
    fetchMessages(friend._id);
  }, [fetchMessages]);

  useEffect(() => {
    if (open) {
      if (initialFriendId) {
        const friend = friends.find((f) => f._id === initialFriendId);
        if (friend) {
          selectFriend(friend);
        }
      }
    }
  }, [open, initialFriendId, friends, selectFriend]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages every 3 seconds when chat is open
  useEffect(() => {
    let interval;
    if (open && selectedFriend) {
      interval = setInterval(() => {
        fetchMessages(selectedFriend._id);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [open, selectedFriend, fetchMessages]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 400 },
          backgroundColor: palette.background.default,
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <FlexBetween
          sx={{
            p: 2,
            backgroundColor: palette.background.alt,
            borderBottom: `1px solid ${palette.neutral.light}`,
          }}
        >
          {selectedFriend ? (
            <>
              <IconButton onClick={() => setSelectedFriend(null)}>
                <ArrowBack />
              </IconButton>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <UserImage image={selectedFriend.picturePath} size="35px" />
                <Typography fontWeight="500">
                  {selectedFriend.firstName} {selectedFriend.lastName}
                </Typography>
              </Box>
            </>
          ) : (
            <Typography variant="h5" fontWeight="500">
              Messages
            </Typography>
          )}
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </FlexBetween>

        {/* Content */}
        {selectedFriend ? (
          <>
            {/* Messages */}
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                p: 2,
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              {messages.map((msg) => {
                const isOwn = msg.senderId === user._id;
                return (
                  <Box
                    key={msg._id}
                    sx={{
                      alignSelf: isOwn ? "flex-end" : "flex-start",
                      maxWidth: "75%",
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: isOwn
                          ? palette.primary.main
                          : palette.neutral.light,
                        color: isOwn ? "white" : palette.neutral.dark,
                        borderRadius: "12px",
                        p: "0.5rem 1rem",
                      }}
                    >
                      <Typography fontSize="0.9rem">{msg.content}</Typography>
                    </Box>
                    <Typography
                      fontSize="0.7rem"
                      color={palette.neutral.medium}
                      sx={{ mt: 0.5, textAlign: isOwn ? "right" : "left" }}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </Box>
                );
              })}
              <div ref={messagesEndRef} />
            </Box>

            {/* Message Input */}
            <Box
              sx={{
                p: 2,
                backgroundColor: palette.background.alt,
                borderTop: `1px solid ${palette.neutral.light}`,
              }}
            >
              <FlexBetween
                sx={{
                  backgroundColor: palette.neutral.light,
                  borderRadius: "20px",
                  p: "0.5rem 1rem",
                }}
              >
                <InputBase
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  sx={{ flex: 1 }}
                />
                <IconButton onClick={sendMessage} disabled={!newMessage.trim()}>
                  <SendOutlined sx={{ color: palette.primary.main }} />
                </IconButton>
              </FlexBetween>
            </Box>
          </>
        ) : (
          /* Friends/Conversations List */
          <Box sx={{ flex: 1, overflowY: "auto" }}>
            <Typography sx={{ p: 2, fontWeight: "500" }}>
              Friends
            </Typography>
            <Divider />
            <List>
              {friends.map((friend) => (
                <ListItem
                  key={friend._id}
                  button
                  onClick={() => selectFriend(friend)}
                  sx={{
                    "&:hover": {
                      backgroundColor: palette.neutral.light,
                    },
                  }}
                >
                  <ListItemAvatar>
                    <UserImage image={friend.picturePath} size="45px" />
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${friend.firstName} ${friend.lastName}`}
                    secondary={friend.occupation || ""}
                  />
                </ListItem>
              ))}
              {friends.length === 0 && (
                <Typography sx={{ p: 2, textAlign: "center", color: palette.neutral.medium }}>
                  Add friends to start chatting!
                </Typography>
              )}
            </List>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default ChatWidget;
