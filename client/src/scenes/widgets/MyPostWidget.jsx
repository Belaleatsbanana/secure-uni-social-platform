import {
  EditOutlined,
  DeleteOutlined,
  AttachFileOutlined,
  GifBoxOutlined,
  ImageOutlined,
  MicOutlined,
  MoreHorizOutlined,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  Typography,
  InputBase,
  useTheme,
  Button,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import FlexBetween from "components/FlexBetween";
import Dropzone from "react-dropzone";
import UserImage from "components/UserImage";
import WidgetWrapper from "components/WidgetWrapper";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts, setLogout } from "state";

const MyPostWidget = ({ picturePath }) => {
  const dispatch = useDispatch();
  const [isImage, setIsImage] = useState(false);
  const [image, setImage] = useState(null);
  const [post, setPost] = useState("");

  const { palette } = useTheme();
  const { _id } = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  const mediumMain = palette.neutral.mediumMain;
  const medium = palette.neutral.medium;

  const handlePost = async () => {
    if (!post.trim()) return;

    const cleanPost = post
      .trim()
      .replace(/[<>]/g, "")
      .replace(/\s+/g, " ");

    const formData = new FormData();
    formData.append("userId", _id);
    formData.append("description", cleanPost);

    if (image) {
      formData.append("picture", image);
      formData.append("picturePath", image.name);
    }

    const response = await fetch("http://localhost:3001/posts", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (response.status === 401) {
      dispatch(setLogout());
      return;
    }

    const posts = await response.json();
    dispatch(setPosts({ posts }));
    setImage(null);
    setPost("");
  };

  return (
    <WidgetWrapper>
      <FlexBetween gap="1rem" alignItems="center">
        <UserImage image={picturePath} />
        <InputBase
          placeholder="Share something with SafeCampus..."
          onChange={(e) => setPost(e.target.value)}
          value={post}
          sx={{
            width: "100%",
            backgroundColor: palette.neutral.light,
            borderRadius: "2rem",
            padding: "0.9rem 1.5rem",
            boxShadow: "inset 0 1px 4px rgba(0,0,0,0.06)",
            border: "1px solid rgba(0,0,0,0.05)",
          }}
        />
      </FlexBetween>

      {isImage && (
        <Box
          border={`1px solid ${medium}`}
          borderRadius="0.75rem"
          mt="1rem"
          p="1rem"
          sx={{
            backgroundColor: "rgba(63, 163, 77, 0.03)",
          }}
        >
          <Dropzone
            acceptedFiles=".jpg,.jpeg,.png"
            multiple={false}
            onDrop={(acceptedFiles) => {
              const file = acceptedFiles[0];
              if (!file) return;

              if (file.size > 5 * 1024 * 1024) {
                alert("Image must be smaller than 5MB");
                return;
              }

              setImage(file);
            }}
          >
            {({ getRootProps, getInputProps }) => (
              <FlexBetween gap="1rem">
                <Box
                  {...getRootProps()}
                  border={`2px dashed ${palette.primary.main}`}
                  p="1rem"
                  width="100%"
                  borderRadius="0.75rem"
                  sx={{
                    "&:hover": { cursor: "pointer" },
                    transition: "0.2s",
                    backgroundColor: "rgba(255,255,255,0.5)",
                  }}
                >
                  <input {...getInputProps()} />
                  {!image ? (
                    <Typography color={mediumMain}>Add Image Here</Typography>
                  ) : (
                    <FlexBetween>
                      <Typography>{image.name}</Typography>
                      <EditOutlined />
                    </FlexBetween>
                  )}
                </Box>

                {image && (
                  <IconButton
                    onClick={() => setImage(null)}
                    sx={{
                      width: "15%",
                      backgroundColor: "rgba(0,0,0,0.04)",
                      borderRadius: "0.75rem",
                    }}
                  >
                    <DeleteOutlined />
                  </IconButton>
                )}
              </FlexBetween>
            )}
          </Dropzone>
        </Box>
      )}

      <Divider sx={{ margin: "1.25rem 0" }} />

      <FlexBetween>
        <FlexBetween gap="0.35rem" onClick={() => setIsImage(!isImage)}>
          <ImageOutlined sx={{ color: mediumMain }} />
          <Typography
            color={mediumMain}
            sx={{ "&:hover": { cursor: "pointer", color: medium } }}
          >
            Image
          </Typography>
        </FlexBetween>

        {isNonMobileScreens ? (
          <>
            <FlexBetween gap="0.35rem">
              <GifBoxOutlined sx={{ color: mediumMain }} />
              <Typography color={mediumMain}>Clip</Typography>
            </FlexBetween>

            <FlexBetween gap="0.35rem">
              <AttachFileOutlined sx={{ color: mediumMain }} />
              <Typography color={mediumMain}>Attachment</Typography>
            </FlexBetween>

            <FlexBetween gap="0.35rem">
              <MicOutlined sx={{ color: mediumMain }} />
              <Typography color={mediumMain}>Audio</Typography>
            </FlexBetween>
          </>
        ) : (
          <FlexBetween gap="0.35rem">
            <MoreHorizOutlined sx={{ color: mediumMain }} />
          </FlexBetween>
        )}

        <Button
          disabled={!post.trim()}
          onClick={handlePost}
          sx={{
            color: "#fff",
            background: "linear-gradient(90deg, #1F4E79, #3FA34D)",
            borderRadius: "3rem",
            padding: "0.6rem 1.5rem",
            fontWeight: "bold",
            boxShadow: "0 6px 16px rgba(31, 78, 121, 0.25)",
            "&:hover": {
              background: "linear-gradient(90deg, #163a5c, #33873f)",
            },
            "&.Mui-disabled": {
              background: "#bfc7d1",
              color: "#fff",
            },
          }}
        >
          POST
        </Button>
      </FlexBetween>
    </WidgetWrapper>
  );
};

export default MyPostWidget;