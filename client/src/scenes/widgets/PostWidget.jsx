import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
  DeleteOutlined,
  EditOutlined,
  SendOutlined,
  CloseOutlined,
} from "@mui/icons-material";
import { Box, Divider, IconButton, Typography, useTheme, InputBase, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import FlexBetween from "components/FlexBetween";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import UserImage from "components/UserImage";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPost, setLogout, deletePost } from "state";
import { API_BASE_URL } from "config/api";

const PostWidget = ({
  postId,
  postUserId,
  name,
  description,
  location,
  picturePath,
  userPicturePath,
  likes,
  comments,
}) => {
  const [isComments, setIsComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(description);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user?._id);
  const isOwnPost = loggedInUserId === postUserId;

  const isLiked = Boolean(likes[loggedInUserId]);
  const likeCount = Object.keys(likes).length;

  const { palette } = useTheme();
  const main = palette.neutral.main;
  const medium = palette.neutral.medium;
  const primary = palette.primary.main;
  const neutralLight = palette.neutral.light;

  const patchLike = async () => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: loggedInUserId }),
    });

    if (response.status === 401) {
      dispatch(setLogout());
      return;
    }

    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comment`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: loggedInUserId, comment: newComment }),
    });

    if (response.status === 401) {
      dispatch(setLogout());
      return;
    }

    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
    setNewComment("");
  };

  const handleDeleteComment = async (commentId) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comment/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      dispatch(setLogout());
      return;
    }

    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
  };

  const handleEditPost = async () => {
    if (!editedDescription.trim()) return;

    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description: editedDescription }),
    });

    if (response.status === 401) {
      dispatch(setLogout());
      return;
    }

    if (response.ok) {
      const updatedPost = await response.json();
      dispatch(setPost({ post: updatedPost }));
      setIsEditing(false);
    }
  };

  const handleDeletePost = async () => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      dispatch(setLogout());
      return;
    }

    if (response.ok) {
      dispatch(deletePost({ postId }));
      setDeleteDialogOpen(false);
    }
  };

  return (
    <WidgetWrapper m="2rem 0">
      <FlexBetween>
        <Friend
          friendId={postUserId}
          name={name}
          subtitle={location}
          userPicturePath={userPicturePath}
        />

        {isOwnPost && (
          <FlexBetween gap="0.25rem">
            <IconButton size="small" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? (
                <CloseOutlined sx={{ color: medium }} />
              ) : (
                <EditOutlined sx={{ color: medium }} />
              )}
            </IconButton>
            <IconButton size="small" onClick={() => setDeleteDialogOpen(true)}>
              <DeleteOutlined sx={{ color: medium }} />
            </IconButton>
          </FlexBetween>
        )}
      </FlexBetween>

      {isEditing ? (
        <Box sx={{ mt: "1rem" }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            variant="outlined"
            size="small"
          />
          <Box sx={{ display: "flex", gap: "0.5rem", mt: "0.5rem", justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setIsEditing(false);
                setEditedDescription(description);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleEditPost}
              disabled={!editedDescription.trim()}
            >
              Save
            </Button>
          </Box>
        </Box>
      ) : (
        <Typography color={main} sx={{ mt: "1rem" }}>
          {description}
        </Typography>
      )}

      {picturePath && (
        <img
          width="100%"
          height="auto"
          alt="post"
          style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
          src={`${API_BASE_URL}/assets/${picturePath}`}
        />
      )}

      <FlexBetween mt="0.25rem">
        <FlexBetween gap="1rem">
          <FlexBetween gap="0.3rem">
            <IconButton onClick={patchLike}>
              {isLiked ? (
                <FavoriteOutlined sx={{ color: primary }} />
              ) : (
                <FavoriteBorderOutlined />
              )}
            </IconButton>
            <Typography>{likeCount}</Typography>
          </FlexBetween>

          <FlexBetween gap="0.3rem">
            <IconButton onClick={() => setIsComments(!isComments)}>
              <ChatBubbleOutlineOutlined />
            </IconButton>
            <Typography>{comments.length}</Typography>
          </FlexBetween>
        </FlexBetween>

        <IconButton>
          <ShareOutlined />
        </IconButton>
      </FlexBetween>

      {isComments && (
        <Box mt="0.5rem">
          {/* Add Comment Input */}
          <FlexBetween
            backgroundColor={neutralLight}
            borderRadius="9px"
            gap="0.5rem"
            padding="0.5rem 1rem"
            mb="0.5rem"
          >
            <InputBase
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
              sx={{ flex: 1 }}
            />
            <IconButton onClick={handleAddComment} disabled={!newComment.trim()}>
              <SendOutlined sx={{ color: primary }} />
            </IconButton>
          </FlexBetween>

          {/* Comments List */}
          {comments.map((comment, i) => (
            <Box key={comment._id || `${name}-${i}`}>
              <Divider />
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", p: "0.5rem 0" }}>
                {comment.userPicturePath && (
                  <UserImage image={comment.userPicturePath} size="35px" />
                )}
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight="500" fontSize="0.85rem" color={main}>
                    {comment.userName || "User"}
                  </Typography>
                  <Typography color={main} fontSize="0.85rem">
                    {typeof comment === "string" ? comment : comment.text}
                  </Typography>
                </Box>
                {(comment.userId === loggedInUserId || postUserId === loggedInUserId) && comment._id && (
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteComment(comment._id)}
                    sx={{ p: "0.25rem" }}
                  >
                    <DeleteOutlined sx={{ fontSize: "1rem", color: medium }} />
                  </IconButton>
                )}
              </Box>
            </Box>
          ))}
          <Divider />
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Post</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this post? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeletePost} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </WidgetWrapper>
  );
};

export default PostWidget;