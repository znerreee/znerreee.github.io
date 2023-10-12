import axios from "@/api/axios";
import { get } from "https";
import { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { PiNotePencilBold } from "react-icons/pi";

const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

type NotesProps = {
  id?: number;
  title: string;
  content: string;
};

const Notes = () => {
  const [showAddNote, setShowAddNote] = useState(false);
  const [userNotes, setUserNotes] = useState<NotesProps[]>([]);
  const [displayClickedNote, setDisplayClickedNote] = useState(false);
  const [clickedNoteId, setClickedNoteId] = useState<number | null>(null);
  const [newNote, setNewNote] = useState<NotesProps>({
    title: "",
    content: "",
  });

  //fetch user notes
  const fetchCurrentUserNotes = async () => {
    try {
      const config = {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      };
      const response = await axios.get("/myNotes", config);
      const sortedNotes = response.data.sort((a: any, b: any) => b.id - a.id);
      setUserNotes(sortedNotes);
      console.log(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCurrentUserNotes();
  }, []);

  const handleNoteClick = (noteId: number) => {
    setClickedNoteId(noteId);
    setDisplayClickedNote(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setNewNote((prevNote) => ({
      ...prevNote,
      [name]: value,
    }));
    console.log(newNote);
  };

  const handleNewNote = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const config = {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    };

    try {
      await axios.post("/notes", newNote, config);
      alert("Note created successfully");
      window.location.reload();
      setNewNote(newNote);
      console.log(newNote);
    } catch (error) {
      console.log(error);
    }
    closeAddNoteModal();
  };
  const openAddNoteModal = () => {
    setShowAddNote(true);
  };

  const closeAddNoteModal = () => {
    setShowAddNote(false);
  };

  return (
    <>
      <div className=" ml-72 top-20 flex absolute">
        <div className=" flex justify-between w-full absolute">
          <h1 className=" font-semibold">Notes</h1>
          <button
            onClick={openAddNoteModal}
            className=" py-2 flex items-center px-3 bg-tertiary shadow bg-opacity-90 rounded-full text-white gap-2 hover:bg-opacity-100"
          >
            <PiNotePencilBold size={15} />
            <p>Add a note</p>
          </button>
        </div>
        {showAddNote && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-70 z-50">
            <div className="w-[550px] max-h-[500px] overflow-auto bg-white p-3 rounded-lg flex flex-col gap-3 relative">
              <button className="text-tertiary hover:text-primary text-xl px-4 py-2 absolute top-0 right-0" onClick={closeAddNoteModal}>
                <IoMdClose />
              </button>
              <p className="text-xl font-bold text-center py-4">New note</p>
              <form onSubmit={handleNewNote}>
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  name="title"
                  value={newNote.title}
                  onChange={handleInputChange}
                  className="w-full border-secondary border-2 rounded-md p-2 mb-2 outline-none"
                  placeholder="Add title here"
                  required
                />
                <label htmlFor="content">Content</label>
                <textarea
                  name="content"
                  value={newNote.content}
                  onChange={handleInputChange}
                  className="w-full border-secondary border-2 resize-none rounded-md p-2 mb-2 outline-none auto-cols-auto"
                  placeholder="Add note content here..."
                  rows={4}
                  required
                />

                <button type="submit" className=" rounded-full w-full bg-secondary border-inherit text-white p-2 outline-none">
                  Create note
                </button>
              </form>
            </div>
          </div>
        )}

        <div className=" mt-12 border bg-gray-50 flex  overflow-y-auto">
          <div className="grid grid-cols-4 gap-2 flex-grow p-2 h-[600px] overflow-auto">
            {userNotes.map((note: any) => (
              <div
                key={note.id}
                onClick={() => handleNoteClick(note.id)}
                className=" p-4 rounded-md shadow border w-72 h-72 cursor-pointer"
                style={{ backgroundColor: getRandomColor() }}
              >
                <h2 className="text-lg font-semibold mb-2">{note.title}</h2>
                <p>{note.content}</p>
              </div>
            ))}
          </div>
          {displayClickedNote && (
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-70 z-50">
              <div className="h-[500px] bg-white w-[450px] overflow-auto rounded-lg">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-semibold p-4">Note</h1>
                  <button className="text-tertiary hover:text-primary text-xl px-4 py-2" onClick={() => setDisplayClickedNote(false)}>
                    <IoMdClose />
                  </button>
                </div>
                {userNotes
                  .filter((note: any) => note.id === clickedNoteId) // Filter for the clicked note
                  .map((note: any) => (
                    <div className="flex justify-between px-3 flex-col" key={note.id}>
                      <h1 className="text-2xl font-semibold">{note.title}</h1>

                      {note.id === clickedNoteId && (
                        <div>
                          <p>{note.content}</p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default Notes;
