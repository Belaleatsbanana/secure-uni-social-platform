import mongoose from "mongoose";

const userIds = [
  new mongoose.Types.ObjectId(),
];

export const users = [
  {
    _id: userIds[0],
    firstName: "noura",
    lastName: "abdulfattah",
    email: "noura@gmail.com",
    password: "$2b$12$Rfnc.3x6Nndm9Yo2Pp7fieJ38.pqGP6NYWkqaBGao5MD.0gfoV9JC",
    picturePath: "noura.jpeg",
    friends: [],
    location: "Shorouk, Egypt",
    occupation: "Software Engineer",
    viewedProfile: 14561,
    impressions: 888822,
    createdAt: 1115211422,
    updatedAt: 1115211422,
    __v: 0,
  }
];

export const posts = [
  {
    _id: new mongoose.Types.ObjectId(),
    userId: userIds[0],
    firstName: "noura",
    lastName: "abdulfattah",
    location: "Shorouk, Egypt",
    description: "Some really long random description",
    picturePath: "",
    userPicturePath: "p3.jpeg",
    likes: new Map([
      [userIds[0], true],
    ]),
    comments: [
      "random comment",
      "another random comment",
      "yet another random comment",
    ],
  }
];
