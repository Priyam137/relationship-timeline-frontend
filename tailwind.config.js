import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [timeline, setTimeline] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newMemory, setNewMemory] = useState({
    year: "",
    title: "",
    photo: "",
    memory: "",
    file: null,
  });

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/memories")
      .then((res) => setTimeline(res.data))
      .catch((err) => {
        console.error("Error fetching:", err);
        alert("Failed to fetch memories from backend");
      });
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();

    let imageUrl = "";
    if (newMemory.file) {
      const formData = new FormData();
      formData.append("image", newMemory.file);

      try {
        const uploadRes = await axios.post(
          "http://localhost:5000/api/upload",
          formData
        );
        imageUrl = uploadRes.data.imageUrl;
      } catch (err) {
        alert("❌ Failed to upload image.");
        return;
      }
    }

    const memoryToSave = {
      ...newMemory,
      photo: imageUrl,
    };

    axios
      .post("http://localhost:5000/api/memories", memoryToSave)
      .then((res) => {
        setTimeline([res.data, ...timeline]);
        setNewMemory({
          year: "",
          title: "",
          photo: "",
          memory: "",
          file: null,
        });
        setShowForm(false);
        alert("✅ Memory added successfully!");
      })
      .catch(() => {
        alert("❌ Failed to add memory. Server error!");
      });
  };

  return (
    <div className="min-h-screen bg-pink-100 py-10 px-4">
      <h1 className="text-4xl font-bold text-center text-pink-600 mb-6">
        💖 Our Love Timeline
      </h1>

      <div className="flex justify-center mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-6 rounded-lg shadow"
        >
          {showForm ? "Close Form" : "+ Add Memory"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="max-w-md mx-auto bg-white rounded-lg p-6 shadow mb-10 space-y-4"
        >
          <input
            type="text"
            placeholder="Year"
            value={newMemory.year}
            onChange={(e) =>
              setNewMemory({ ...newMemory, year: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded"
            required
          />

          <input
            type="text"
            placeholder="Title"
            value={newMemory.title}
            onChange={(e) =>
              setNewMemory({ ...newMemory, title: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded"
            required
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setNewMemory({ ...newMemory, file: e.target.files[0] })
            }
            className="w-full p-2 border border-gray-300 rounded"
          />

          <textarea
            placeholder="Write your memory..."
            value={newMemory.memory}
            onChange={(e) =>
              setNewMemory({ ...newMemory, memory: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded"
            rows="3"
            required
          />

          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg w-full"
          >
            Save Memory
          </button>
        </form>
      )}

      {/* Timeline Section */}
      <div className="space-y-24 max-w-5xl mx-auto relative">
        {timeline.map((memory, index) => {
          const isEven = index % 2 === 0;
          return (
            <div
              key={index}
              className={`flex flex-col md:flex-row items-center gap-6 relative ${
                isEven ? "md:flex-row" : "md:flex-row-reverse"
              }`}
            >
              {/* Vertical Connector */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-full bg-pink-300 z-0 hidden md:block"></div>

              {/* Image Card */}
              <div className="w-full md:w-1/2 flex justify-center md:justify-center">
                <div className="bg-white p-2 rounded-lg shadow border w-16 h-16 flex items-center justify-center z-10">
                  <img
                    src={`http://localhost:5000${memory.photo}`}
                    alt={memory.title}
                    className="w-10 h-10 object-cover rounded-md"
                  />
                </div>
              </div>

              {/* Description Card */}
              <div className="w-full md:w-1/2 flex justify-center md:justify-center">
                <div className="bg-white p-4 rounded-lg shadow border max-w-md w-full z-10">
                  <h3 className="text-lg font-bold text-pink-700">
                    {memory.title}{" "}
                    <span className="text-gray-500 text-sm">({memory.year})</span>
                  </h3>
                  <p className="text-gray-700 mt-1">{memory.memory}</p>
                  {memory.createdAt && (
                    <p className="text-sm text-gray-500 mt-2">
                      🕒 Added on: {new Date(memory.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
