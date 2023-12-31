import axios from "@/api/axios";
import { useEffect, useState, useRef } from "react";
import { AiOutlineHeart } from "react-icons/ai";
import { BsPersonCircle } from "react-icons/bs";
import { FaRegComment } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { RiDeleteBin5Line, RiImageAddFill } from "react-icons/ri";
import { MdOutlineModeEdit, MdPostAdd } from "react-icons/md";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import CounselorLayout from "@/components/Layout";
import useFetchUser from "@/hooks/useFetchUser";
import useLoading from "@/hooks/useLoading";

type PostsProps = {
  id: number;
  title: string;
  content: string;
  photoContent: string;
  photoData: File;
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
  const [imageSrc, setImageSrc] = useState("");
  const [showPostOptions, setShowPostOptions] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  const [newPost, setNewPost] = useState<{ title: string; content: string; photoData: File }>({
    title: "",
    content: "",
    photoData: new File([], ""),
  });
  const [editingPost, setEditingPost] = useState<{ title: string; content: string; photoData: File }>({
    title: "",
    content: "",
    photoData: new File([], ""),
  });

  const postOptionsRef = useRef<HTMLDivElement>(null);

  const { user } = useFetchUser();

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
  }, [activeButton]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setNewPost((prevPost) => ({
      ...prevPost,
      [name]: value,
    }));
    console.log(newPost);
  };

  const handleUpdateInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setEditingPost((prevPost) => ({
      ...prevPost,
      [name]: value,
    }));
    console.log(editingPost);
  };

  const handleEditImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setEditingPost((prevPost) => ({
        ...prevPost,
        photoData: file,
      }));

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageSrc = event.target?.result as string;
        setImageSrc(imageSrc);
      };
      reader.readAsDataURL(file);
      setImageFileName(file.name);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewPost((prevPost) => ({
        ...prevPost,
        photoData: file,
      }));

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageSrc = event.target?.result as string;
        setImageSrc(imageSrc);
      };
      reader.readAsDataURL(file);
      setImageFileName(file.name);
    }
  };

  const handleImageClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.preventDefault();
    const input = document.querySelector("input[type=file]") as HTMLInputElement;
    input.click();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    //formData is used for posting with photos
    const formData = new FormData();
    formData.append("title", newPost.title);
    formData.append("content", newPost.content);
    formData.append("photoData", newPost.photoData);
    console.log(newPost.photoData);

    //body is used for posting without photos
    const body = {
      title: newPost.title,
      content: newPost.content,
    };

    //headers is used for authorization
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
        setNewPost({
          title: "",
          content: "",
          photoData: new File([], ""),
        });
      }
      alert("Post created!");
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenOptions = (postId: number) => {
    setShowPostOptions(postId);
    console.log(postId);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (postOptionsRef.current && !postOptionsRef.current.contains(event.target as Node)) {
        setShowPostOptions(null);
      }
    };

    if (showPostOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPostOptions]);

  const handleOpenConfirmDelete = (postId: number) => {
    myPost.find((post) => post.id === postId);
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleOpenPostForm = () => {
    setShowPostForm(true);
  };

  const handleClosePostForm = () => {
    setShowPostForm(false);
  };

  const handleDeletePost = async (id: number) => {
    const config = {
      headers: { Authorization: `${localStorage.getItem("token")}` },
    };
    try {
      const response = await axios.delete(`/posts/${id}`, config);
      console.log(response);
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEditForm = (postId: number) => {
    const post = myPost.find((post) => post.id === postId);
    if (post) {
      setEditingPost({
        title: post.title,
        content: post.content,
        photoData: new File([], ""),
      });
      setShowEditForm(true);
      console.log(post);
    }
  };

  const handleCloseEditForm = () => {
    setEditingPost({
      title: "",
      content: "",
      photoData: new File([], ""),
    });
    setShowEditForm(false);
  };

  const handleEditPost = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    //formData is used for posting with photos
    const formData = new FormData();
    formData.append("title", editingPost.title);
    formData.append("content", editingPost.content);
    formData.append("photoData", editingPost.photoData);
    console.log(editingPost.photoData);

    //body is used for posting without photos
    const body = {
      title: editingPost.title,
      content: editingPost.content,
    };

    //headers is used for authorization
    const config = {
      headers: { Authorization: `${localStorage.getItem("token")}` },
    };

    try {
      let response;
      const postId = myPost.find((post) => post.id === showPostOptions)?.id;
      if (editingPost?.photoData?.name === "") {
        // Update post without photo
        response = await axios.put(`/posts/${postId}`, body, config);
      } else {
        // Update post with photo
        response = await axios.put(`/posts/photo/${postId}`, formData, config);
        console.log(response);
        setEditingPost({
          title: "",
          content: "",
          photoData: new File([], ""),
        });
      }
      console.log(response);
      alert("Post updated!");
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className=" flex justify-center py-4 w-full">
        <nav className=" flex gap-2 w-3/4">
          <button
            className={`rounded-full h-10 p-2 text-xs ${
              activeButton === "all" ? "bg-secondary text-white border-inherit" : "border-secondary border-2 bg-white text-secondary"
            }`}
            onClick={() => {
              setActiveButton("all");
            }}
          >
            All Posts
          </button>
          <button
            className={`rounded-full text-xs p-2 ${
              activeButton === "my" ? "bg-secondary text-white border-inherit" : "border-secondary border-2 bg-white text-secondary"
            }`}
            onClick={() => {
              setActiveButton("my");
            }}
          >
            My Posts
          </button>
        </nav>
        {/* <button onClick={handleOpenPostForm} className=" border h-10 text-white px-2 bg-tertiary rounded-lg flex items-center gap-1 hover:bg-opacity-90">
          <MdPostAdd />
          Add new Post
        </button> */}
      </div>

      {/* Conditionally displays the form to create a new post */}
      {showPostForm && (
        <div className="fixed inset-0 w-full flex items-center justify-center bg-gray-900 bg-opacity-70 z-10">
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
                placeholder={"What do you want to post today, " + user?.firstName + "?"}
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

      {/* Conditionally displays all the posts */}
      {activeButton === "all" && (
        <div className=" w-full flex flex-col items-center gap-4 scroll-smooth border-t-2 py-2 bg-gray-50">
          <div className=" bg-secondary bg-opacity-50 shadow p-3 rounded-lg w-3/4">
            <input
              type="text"
              placeholder="Create a post"
              className=" cursor-pointer outline-none w-full p-2 rounded-full bg-gray-200 hover:bg-gray-50 "
              onClick={handleOpenPostForm}
            />
            <div onClick={handleOpenPostForm} className=" w-[70px] cursor-pointer mt-2 rounded-lg flex items-center gap-1 bg-secondary p-1 ">
              <RiImageAddFill className=" text-white" />
              <h1 className=" text-sm text-white">Photo</h1>
            </div>
          </div>
          {allPost.length > 0 ? (
            <>
              {allPost.map((post) => (
                <div key={post.id} className="w-3/4 rounded-lg bg-white shadow flex flex-col">
                  <div className=" flex flex-col px-3 pt-3 gap-2">
                    <div className=" flex gap-2 items-center">
                      <BsPersonCircle size={20} className=" text-gray-500" />
                      <h1 className=" font-bold text-md">
                        {post.counselor.firstName} {post.counselor.lastName}
                      </h1>
                    </div>
                    <h2 className=" font-semibold">{post.title}</h2>
                    <p className=" text-justify pb-2">{post.content}</p>
                  </div>
                  <span className=" w-full border-t border-b flex justify-center">
                    {post.photoContent ? (
                      <img src={`data:image/jpeg;base64,${post.photoContent}`} alt="Posted Image" className=" max-w-full max-h-auto cursor-pointer " />
                    ) : null}
                  </span>
                  <p className=" text-xs text-gray-400 px-2 py-1">21 Likes</p>
                  <div className=" flex justify-between items-center border-t border-gray-200 px-3">
                    <div className=" flex items-center gap-4 py-2">
                      <button className=" text-sm text-gray-500 hover:text-primary flex items-center gap-1">
                        <AiOutlineHeart />
                        <p>Like</p>
                      </button>
                      <button className=" text-sm text-gray-500 hover:text-primary flex items-center gap-1">
                        <FaRegComment />
                        <p>Comment</p>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="p-20">
              <h1 className="text-lg text-gray-400 font-semibold p-2">No posts. Try creating one.</h1>
            </div>
          )}
        </div>
      )}

      {/* Conditionally displays the user's posts */}
      {activeButton === "my" && (
        <div className=" w-full flex flex-col items-center gap-4 scroll-smooth border-t-2 py-2 bg-gray-50">
          <div className=" bg-secondary bg-opacity-50 shadow p-3 rounded-lg w-3/4">
            <input
              type="text"
              placeholder="Create a post"
              className=" cursor-pointer outline-none w-full p-2 rounded-full bg-gray-200 hover:bg-gray-50 "
              onClick={handleOpenPostForm}
            />
            <div onClick={handleOpenPostForm} className=" w-[70px] cursor-pointer mt-2 rounded-lg flex items-center gap-1 bg-secondary p-1 ">
              <RiImageAddFill className=" text-white" />
              <h1 className=" text-sm text-white">Photo</h1>
            </div>
          </div>
          {myPost.length > 0 ? (
            <>
              {myPost.map((post) => (
                <div key={post.id} className=" w-3/4 rounded-lg bg-white shadow flex flex-col">
                  <div className=" flex px-3 pt-3 gap-2 justify-between">
                    <div className=" flex gap-2 items-center">
                      <BsPersonCircle size={20} className=" text-gray-500" />
                      <h1 className=" font-bold text-md">
                        {post.counselor.firstName} {post.counselor.lastName}
                      </h1>
                    </div>
                    <div className="relative flex items-center">
                      <HiOutlineDotsHorizontal onClick={() => handleOpenOptions(post.id)} className="text-gray-500 cursor-pointer" />
                      {showPostOptions === post.id && (
                        <div ref={postOptionsRef} key={post.id} className="absolute right-0 top-5 bg-white shadow border rounded-md px-2 py-2">
                          <div className="text-sm text-tertiary cursor-pointer flex items-center gap-1 p-1 mb-2 rounded-lg border-inherit hover:bg-blue-500 hover:text-white">
                            <MdOutlineModeEdit size={15} />
                            <p onClick={() => handleOpenEditForm(post.id)} className=" flex gap-1">
                              <span>Edit</span>
                              <span>post</span>
                            </p>
                          </div>

                          {/* Conditionally displays the form to update post */}
                          {showEditForm && post.id && (
                            <div key={post.id} className="fixed inset-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-70 z-10">
                              <div className="w-[550px] max-h-[500px] overflow-auto bg-white p-3 rounded-lg flex flex-col gap-3 relative">
                                <button onClick={handleCloseEditForm} className="text-tertiary hover:text-primary text-xl px-4 py-2 absolute top-0 right-0">
                                  <IoMdClose />
                                </button>
                                <p className="text-xl font-bold text-center py-4">Update post</p>
                                <form onSubmit={handleEditPost}>
                                  <input
                                    type="text"
                                    name="title"
                                    value={editingPost.title}
                                    onChange={handleUpdateInputChange}
                                    className="w-full border-secondary border-2 rounded-md p-2 mb-2 outline-none"
                                    placeholder="Title"
                                    required
                                  />
                                  <textarea
                                    name="content"
                                    value={editingPost.content}
                                    onChange={handleUpdateInputChange}
                                    className="w-full border-secondary border-2 resize-none rounded-md p-2 mb-2 outline-none"
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
                                    <input id="imageUpload" type="file" name="photoData" className="hidden" onChange={handleEditImageUpload} />
                                  </div>
                                  <div className="mt-2">
                                    <img
                                      src={imageSrc ? imageSrc : `data:image/jpeg;base64,${post.photoContent}`}
                                      alt="Uploaded Image"
                                      className="max-w-auto max-h-auto cursor-pointer"
                                      onChange={() => window.location.reload()}
                                      onClick={handleImageClick}
                                    />
                                  </div>

                                  <button type="submit" className=" mt-5 rounded-full w-full bg-secondary border-inherit text-white p-2 outline-none">
                                    Update
                                  </button>
                                </form>
                              </div>
                            </div>
                          )}

                          <p className="w-full border"></p>
                          <div className=" cursor-pointer text-sm text-tertiary flex items-center gap-1 p-1 mt-2 rounded-lg hover:bg-red-500 hover:text-white">
                            <RiDeleteBin5Line size={15} />
                            <p onClick={() => handleOpenConfirmDelete(post.id)} className=" flex gap-1">
                              <span>Delete</span>
                              <span>post</span>
                            </p>

                            {/* Conditionally displays the delete confirmation modal */}
                            {showDeleteModal && (
                              <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-10">
                                <div className="bg-white rounded-lg p-4 flex flex-col">
                                  <h1 className=" text-black font-semibold text-lg">Delete</h1>
                                  <p className=" text-gray-500  border-t border-b py-4 px-1 my-3">Are you sure you want to delete this post?</p>
                                  <div className="flex justify-end mt-4">
                                    <button onClick={handleCancelDelete} className="text-sm text-gray-500 hover:text-primary mr-2">
                                      Cancel
                                    </button>
                                    <button onClick={() => handleDeletePost(post.id)} className="text-sm text-red-500 hover:text-red-700">
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className=" px-3 py-2">
                    <h2 className=" font-semibold">{post.title}</h2>
                    <p className=" text-justify pt-2">{post.content}</p>
                  </span>
                  <span className=" w-full border-t border-b flex justify-center">
                    {post.photoContent ? (
                      <img src={`data:image/jpeg;base64,${post.photoContent}`} alt="Posted Image" className=" max-w-full max-h-auto cursor-pointer" />
                    ) : null}
                  </span>
                  <p className=" text-xs text-gray-400 px-2 py-1">21 Likes</p>
                  <div className=" flex justify-between items-center border-t border-gray-200 px-3">
                    <div className=" flex items-center gap-4 py-2">
                      <button className=" text-sm text-gray-500 hover:text-primary flex items-center gap-1">
                        <AiOutlineHeart />
                        <p>Like</p>
                      </button>
                      <button className=" text-sm text-gray-500 hover:text-primary flex items-center gap-1">
                        <FaRegComment />
                        <p>Comment</p>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="p-20">
              <h1 className="text-lg text-gray-400 font-semibold p-2">You have no posts. Try creating one.</h1>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Home;
