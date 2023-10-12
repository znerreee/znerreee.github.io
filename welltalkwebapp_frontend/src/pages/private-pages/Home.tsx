import axios from "@/api/axios";
import { useEffect, useState } from "react";
import { AiOutlineHeart } from "react-icons/ai";
import { BsPersonCircle } from "react-icons/bs";
import { FaRegComment } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { RiImageAddFill } from "react-icons/ri";
import { MdPostAdd } from "react-icons/md";

type PostsProps = {
  id: number;
  title: string;
  content: string;
  photoContent: string;
  counselor: {
    id: number;
    firstName: string;
    lastName: string;
  };
};

const Home = () => {
  const [allPost, setAllPost] = useState<PostsProps[]>([]);
  const [myPost, setMyPost] = useState<PostsProps[]>([]);
  const [activeButton, setActiveButton] = useState("all");
  const [showPostForm, setShowPostForm] = useState<boolean>(false);
  const [imageFileName, setImageFileName] = useState<string>("");
  const [imageSrc, setImageSrc] = useState<string>("");
  const [counselor, setCounselor] = useState<any>({});
  const [showDeleteConfimration, setShowDeleteConfirmation] = useState<boolean>(false);
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  const [clickedPostToEdit, setClickedPostToEdit] = useState<number | null>(null);
  const [editedPost, setEditedPost] = useState<PostsProps | null>(null);
  const [editedImageSrc, setEditedImageSrc] = useState<string | null>(null);
  const [editedImageFileName, setEditedImageFileName] = useState<string>("");
  const [newPost, setNewPost] = useState<{
    title: string;
    content: string;
    photoData: File;
    photoContent: string; // Add this line
  }>({
    title: "",
    content: "",
    photoData: new File([], ""),
    photoContent: "", // Initialize with an empty string
  });

  const getCounselor = async () => {
    try {
      const username = localStorage.getItem("user");
      const response = await axios.get(`/users/username/${username}`);
      setCounselor(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getAllPosts = async () => {
    try {
      const response = await axios.get("/posts");
      const sortedPosts = response.data.sort((a: any, b: any) => b.id - a.id);
      console.log(response.data);
      setAllPost(sortedPosts);
    } catch (err) {
      console.error(err);
    }
  };

  const getMyPosts = async () => {
    const config = {
      headers: { Authorization: `${localStorage.getItem("token")}` },
    };
    try {
      const response = await axios.get("/myPosts", config);
      const sortedUserPosts = response.data.sort((a: any, b: any) => b.id - a.id);
      console.log(response.data);
      setMyPost(sortedUserPosts);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeButton === "all") {
      getAllPosts();
    } else {
      getMyPosts();
    }
    getCounselor();
  }, [activeButton]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setNewPost((prevPost) => ({
      ...prevPost,
      [name]: value,
    }));
    console.log(newPost);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setEditedImageFileName(file.name);

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageSrc = event.target?.result as string;
        setEditedImageSrc(imageSrc);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.preventDefault();
    const input = document.querySelector("input[type=file]") as HTMLInputElement;
    input.click();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // formData is used for posting with photos
    const formData = new FormData();
    formData.append("title", newPost.title);
    formData.append("content", newPost.content);
    formData.append("photoData", newPost.photoData);

    // Add photoContent to the formData if it exists
    if (newPost.photoContent) {
      formData.append("photoContent", newPost.photoContent);
    }

    // body is used for posting without photos
    const body = {
      title: newPost.title,
      content: newPost.content,
    };

    // headers is used for authorization
    const config = {
      headers: { Authorization: `${localStorage.getItem("token")}` },
    };

    try {
      if (newPost.photoData.name === "") {
        const response = await axios.post("/posts", body, config);
        console.log(response);
      } else {
        const response = await axios.post("/posts/photo", formData, config);
        console.log(response);
      }
      alert("Post created!");
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenPostForm = () => {
    setShowPostForm(true);
  };

  const handleClosePostForm = () => {
    setShowPostForm(false);
  };

  const handleOpenDeleteConfirmation = () => {
    setShowDeleteConfirmation(true);
  };
  const handleCloseDeleteConfirmation = () => {
    setShowDeleteConfirmation(false);
  };

  const handleDeletePost = async (id: number) => {
    const config = {
      headers: { Authorization: `${localStorage.getItem("token")}` },
    };
    try {
      const response = await axios.delete(`/posts/${id}`, config);
      console.log(response);
      alert("Post deleted!");
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false);
  };

  const handleUpdatePost = async () => {
    if (editedPost) {
      const config = {
        headers: { Authorization: `${localStorage.getItem("token")}` },
      };

      try {
        const response = await axios.put(`/posts/${editedPost.id}`, editedPost, config);
        console.log(response);
        alert("Post updated!");
        window.location.reload();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEditClick = (postId: number) => {
    const postToEdit = myPost.find((post) => post.id === postId);

    if (postToEdit) {
      setEditedPost(postToEdit);

      if (postToEdit.photoContent) {
        // Set editedImageSrc based on the post's photoContent
        setEditedImageSrc(`data:image/jpeg;base64,${postToEdit.photoContent}`);
        // Set editedImageFileName to a custom value or post's image file name
        setEditedImageFileName(`Image_${postToEdit.id}`);
      } else {
        // Reset editedImageSrc and editedImageFileName
        setEditedImageSrc(null);
        setEditedImageFileName("");
      }

      setShowEditForm(true);
    } else {
      console.error("Post not found for editing");
    }
  };

  return (
    <>
      <div className=" ml-72 top-20 absolute flex flex-col">
        <h1 className=" font-semibold">Welcome to Welltalk!</h1>
        <div className=" w-[1240px]">
          <div className=" px-5 flex justify-between">
            <nav className=" flex gap-2">
              <button
                className={`rounded-full my-6 p-2 text-xs ${
                  activeButton === "all" ? "bg-secondary text-white border-inherit" : "border-secondary border-2 bg-white text-secondary"
                }`}
                onClick={() => {
                  setActiveButton("all");
                }}
              >
                All Posts
              </button>
              <button
                className={`rounded-full my-6 text-xs p-2 ${
                  activeButton === "my" ? "bg-secondary text-white border-inherit" : "border-secondary border-2 bg-white text-secondary"
                }`}
                onClick={() => {
                  setActiveButton("my");
                }}
              >
                My Posts
              </button>
            </nav>
            <button onClick={handleOpenPostForm} className=" border my-6 text-white px-2 bg-tertiary rounded-lg flex items-center gap-1 hover:bg-opacity-90">
              <MdPostAdd />
              Add new Post
            </button>
          </div>

          {showPostForm && (
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-70 z-50">
              <div className="w-[550px] max-h-[500px] overflow-auto bg-white p-3 rounded-lg flex flex-col gap-3 relative">
                <button onClick={handleClosePostForm} className="text-tertiary hover:text-primary text-xl px-4 py-2 absolute top-0 right-0">
                  <IoMdClose />
                </button>
                <p className="text-xl font-bold text-center py-4">Create post</p>
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    name="title"
                    value={newPost.title}
                    onChange={handleInputChange}
                    className="w-full border-secondary border-2 rounded-md p-2 mb-2 outline-none"
                    placeholder="Title"
                    required
                  />
                  <textarea
                    name="content"
                    value={newPost.content}
                    onChange={handleInputChange}
                    className="w-full border-secondary border-2 resize-none rounded-md p-2 mb-2 outline-none"
                    placeholder={"What do you want to post today, " + counselor.firstName + "?"}
                    rows={4}
                    required
                  />
                  <div className="flex justify-between">
                    <label
                      htmlFor="imageUpload"
                      className="cursor-pointer border-secondary border-2 rounded-md p-2 text-sm outline-none flex items-center gap-1 text-tertiary"
                    >
                      <RiImageAddFill />
                      {imageSrc ? imageFileName : "Upload an Image"}
                    </label>
                    <input id="imageUpload" type="file" name="photoData" className="hidden" onChange={handleImageUpload} />
                  </div>
                  {imageSrc && (
                    <div className="mt-2">
                      <img src={imageSrc} alt="Uploaded Image" className="max-w-auto max-h-auto cursor-pointer" onClick={handleImageClick} />
                    </div>
                  )}

                  <button type="submit" className=" mt-5 rounded-full w-full bg-secondary border-inherit text-white p-2 outline-none">
                    Post
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeButton === "all" && (
            <div className=" pr-3 w-full flex flex-col items-center gap-4 h-[550px] scroll-smooth overflow-auto border-t-2 py-2 bg-gray-50">
              <div className=" bg-secondary bg-opacity-50 shadow p-3 rounded-lg w-[600px]">
                <input
                  type="text"
                  placeholder="Create a post"
                  className=" cursor-pointer w-full outline-none p-2 rounded-full bg-gray-200 hover:bg-gray-50 "
                  onClick={handleOpenPostForm}
                />
                <div onClick={handleOpenPostForm} className=" w-[70px] cursor-pointer mt-2 rounded-lg flex items-center gap-1 bg-secondary p-1 ">
                  <RiImageAddFill className=" text-white" />
                  <h1 className=" text-sm text-white">Photo</h1>
                </div>
              </div>
              {allPost.map((post) => (
                <div key={post.id} className=" w-[600px] rounded-lg bg-white border-2 shadow flex p-2 flex-col">
                  <div className=" flex items-center gap-2">
                    <BsPersonCircle size={20} className=" text-gray-500" />
                    <h1 className=" font-bold text-md">
                      {post.counselor.firstName} {post.counselor.lastName}
                    </h1>
                  </div>
                  <h2 className=" font-semibold mt-2">{post.title}</h2>
                  <p className=" mt-3">{post.content}</p>
                  {post.photoContent ? (
                    <img src={`data:image/jpeg;base64,${post.photoContent}`} alt="Posted Image" className=" shadow mt-3 max-w-auto max-h-auto cursor-pointer" />
                  ) : null}
                  <div className=" flex w-full justify-between items-center border-t border-b px-3 pb-2 border-gray-300 mt-3">
                    <div className=" flex items-center gap-4 mt-2">
                      <button className=" text-sm text-gray-500 hover:text-primary flex items-center gap-1">
                        <AiOutlineHeart />
                        <p>Like</p>
                      </button>
                      <button className=" text-sm text-gray-500 hover:text-primary flex items-center gap-1">
                        <FaRegComment />
                        <p>Comment</p>
                      </button>
                    </div>
                    <p className=" text-xs text-gray-400">21 Likes</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeButton === "my" && (
            <div className=" pr-3 w-full flex flex-col items-center gap-4 h-[500px] scroll-smooth overflow-auto border-t-2 py-2 bg-gray-50">
              <div className=" bg-secondary bg-opacity-50 shadow p-3 rounded-lg w-[600px]">
                <input
                  type="text"
                  placeholder="Create a post"
                  className=" cursor-pointer w-full outline-none p-2 rounded-full bg-gray-200 hover:bg-gray-50 "
                  onClick={handleOpenPostForm}
                />
                <div onClick={handleOpenPostForm} className=" w-[70px] cursor-pointer mt-2 rounded-lg flex items-center gap-1 bg-secondary p-1 ">
                  <RiImageAddFill className=" text-white" />
                  <h1 className=" text-sm text-white">Photo</h1>
                </div>
              </div>
              {myPost.map((post) => (
                <div key={post.id} className=" w-[600px] rounded-lg bg-white border-2 shadow flex p-2 flex-col">
                  <div className=" flex justify-between">
                    <div className=" flex items-center gap-2">
                      <BsPersonCircle size={20} className=" text-gray-500" />
                      <h1 className=" font-bold text-md">
                        {post.counselor.firstName} {post.counselor.lastName}
                      </h1>
                    </div>
                    <div className=" flex gap-2 text-xs">
                      <button onClick={() => handleEditClick(post.id)} className=" text-white bg-blue-500 px-2 rounded-lg">
                        Edit
                      </button>
                      {showEditForm && (
                        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-70 z-50">
                          <div className="w-[550px] max-h-[500px] overflow-auto bg-white p-3 rounded-lg flex flex-col gap-3 relative">
                            <button onClick={handleCloseEditForm} className="text-tertiary hover:text-primary text-xl px-4 py-2 absolute top-0 right-0">
                              <IoMdClose />
                            </button>
                            <p className="text-xl font-bold text-center py-4">Edit post</p>
                            <form onSubmit={handleUpdatePost}>
                              <input
                                type="text"
                                name="title"
                                value={editedPost?.title || ""}
                                onChange={handleInputChange}
                                className="w-full border-secondary border-2 rounded-md p-2 mb-2 outline-none"
                                placeholder="Title"
                                required
                              />
                              <textarea
                                name="content"
                                value={editedPost?.content || ""}
                                onChange={handleInputChange}
                                className="w-full border-secondary border-2 resize-none rounded-md p-2 mb-2 outline-none"
                                placeholder={"What do you want to post today, " + counselor.firstName + "?"}
                                rows={4}
                                required
                              />
                              <div className="flex justify-between">
                                <label
                                  htmlFor="imageUpload"
                                  className="cursor-pointer border-secondary border-2 rounded-md p-2 text-sm outline-none flex items-center gap-1 text-tertiary"
                                >
                                  <RiImageAddFill />
                                  {editedImageSrc ? editedImageFileName : "Upload an Image"}
                                </label>
                                <input id="imageUpload" type="file" name="photoData" className="hidden" onChange={handleImageUpload} />
                              </div>
                              {editedImageSrc && (
                                <div className="mt-2">
                                  <img
                                    src={`data:image/jpeg;base64,${post.photoContent}`}
                                    alt="Uploaded Image"
                                    className="max-w-auto max-h-auto cursor-pointer"
                                    onClick={handleImageClick}
                                  />
                                </div>
                              )}

                              <button type="submit" className=" mt-5 rounded-full w-full bg-secondary border-inherit text-white p-2 outline-none">
                                Confirm Edit
                              </button>
                            </form>
                          </div>
                        </div>
                      )}
                      <button onClick={handleOpenDeleteConfirmation} className=" text-white bg-red-500 px-2 rounded-lg">
                        Delete
                      </button>
                    </div>
                  </div>
                  <h2 className=" font-semibold mt-2">{post.title}</h2>
                  <p className=" mt-3">{post.content}</p>
                  {post.photoContent ? (
                    <img src={`data:image/jpeg;base64,${post.photoContent}`} alt="Posted Image" className=" shadow mt-3 max-w-auto max-h-auto cursor-pointer" />
                  ) : null}
                  <div className=" flex w-full justify-between items-center border-t border-b px-3 pb-2 border-gray-300 mt-3">
                    <div className=" flex items-center gap-4 mt-2">
                      <button className=" text-sm text-gray-500 hover:text-primary flex items-center gap-1">
                        <AiOutlineHeart />
                        <p>Like</p>
                      </button>
                      <button className=" text-sm text-gray-500 hover:text-primary flex items-center gap-1">
                        <FaRegComment />
                        <p>Comment</p>
                      </button>
                    </div>
                    <p className=" text-xs text-gray-400">21 Likes</p>
                  </div>
                  {showDeleteConfimration && (
                    <div className="fixed top-0 left-0 w-full h-screen flex items-center justify-center bg-gray-900 bg-opacity-70 z-50">
                      <div className="w-96 max-h-[500px] bg-white p-3 rounded-lg flex flex-col gap-3 relative">
                        <div className=" py-1">
                          <h1 className=" text-md font-semibold">Delete</h1>
                        </div>
                        <div className=" py-3 border-y bg-gray-50">
                          <p>Are you sure you want to delete this post?</p>
                        </div>
                        <div className=" flex items-center text-sm justify-between px-2 py-2">
                          <button
                            onClick={handleCloseDeleteConfirmation}
                            className=" py-2 px-3 bg-secondary text-white border shadow-md font-semibold rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className=" py-2 px-3  bg-red-500 text-white border shadow-md font-semibold rounded-lg "
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
