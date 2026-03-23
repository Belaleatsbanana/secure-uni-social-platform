import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts, setLogout } from "state";
import PostWidget from "./PostWidget";
import { API_BASE_URL } from "config/api";

const PostsWidget = ({ userId, isProfile = false }) => {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts);
  const token = useSelector((state) => state.token);

  const getPosts = async () => {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401) {
      dispatch(setLogout());
      return;
    }

    const data = await response.json();
    dispatch(setPosts({ posts: Array.isArray(data) ? data : [] }));
  };

  const getUserPosts = async () => {
    const response = await fetch(
      `${API_BASE_URL}/posts/${userId}/posts`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.status === 401) {
      dispatch(setLogout());
      return;
    }

    const data = await response.json();
    dispatch(setPosts({ posts: Array.isArray(data) ? data : [] }));
  };

  useEffect(() => {
    if (isProfile) {
      getUserPosts();
    } else {
      getPosts();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {Array.isArray(posts) &&
        posts.map(
          ({
            _id,
            userId,
            firstName,
            lastName,
            description,
            location,
            picturePath,
            userPicturePath,
            likes,
            comments,
          }) => (
            <PostWidget
              key={_id}
              postId={_id}
              postUserId={userId}
              name={`${firstName} ${lastName}`}
              description={description}
              location={location}
              picturePath={picturePath}
              userPicturePath={userPicturePath}
              likes={likes}
              comments={comments}
            />
          )
        )}
    </>
  );
};

export default PostsWidget;