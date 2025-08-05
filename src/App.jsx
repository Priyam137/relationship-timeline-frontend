import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [timeline, setTimeline] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [liveTime, setLiveTime] = useState("");

  const [newMemory, setNewMemory] = useState({
    year: "",
    title: "",
    photo: "",
    memory: "",
    file: null,
  });

  const BASE_URL = import.meta.env.VITE_BASE_URL; // 🔁 Change this after deployment

  const startDate = new Date("2025-06-05T06:00:00");

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/memories`)
      .then((res) => {
        const sorted = res.data.sort(
          (a, b) => new Date(b.year) - new Date(a.year)
        );
        setTimeline(sorted);
      })
      .catch((err) => {
        console.error("Error fetching:", err);
        alert("Failed to fetch memories from backend");
      });
  }, []);

  useEffect(() => {
    const updateCounter = () => {
      const now = new Date();
      let diff = now - startDate;

      const seconds = Math.floor(diff / 1000) % 60;
      const minutes = Math.floor(diff / (1000 * 60)) % 60;
      const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;

      let years = now.getFullYear() - startDate.getFullYear();
      let months = now.getMonth() - startDate.getMonth();
      let days = now.getDate() - startDate.getDate();

      if (days < 0) {
        months--;
        days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      }
      if (months < 0) {
        years--;
        months += 12;
      }

      setLiveTime(
        `${years}y ${months}m ${days}d ${hours}h ${minutes}m ${seconds}s`
      );
    };

    updateCounter();
    const interval = setInterval(updateCounter, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleEdit = (memory) => {
    setShowForm(true);
    setIsEditing(true);
    setEditId(memory._id);
    setNewMemory({
      year: memory.year,
      title: memory.title,
      photo: memory.photo,
      memory: memory.memory,
      file: null,
    });
  };

  const handleAddOrEdit = async (e) => {
    e.preventDefault();

    let imageUrl = newMemory.photo;

    if (newMemory.file) {
      const formData = new FormData();
      formData.append("image", newMemory.file);

      try {
        const uploadRes = await axios.post(`${BASE_URL}/api/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = uploadRes.data.imageUrl;
      } catch (err) {
        console.error("Upload error:", err);
        alert("❌ Failed to upload image.");
        return;
      }
    }

    const memoryToSave = {
      year: newMemory.year,
      title: newMemory.title,
      photo: imageUrl,
      memory: newMemory.memory,
    };

    try {
      if (isEditing) {
        const res = await axios.put(
          `${BASE_URL}/api/memories/${editId}`,
          memoryToSave
        );
        const updated = timeline.map((item) =>
          item._id === editId ? res.data : item
        );
        const sorted = updated.sort(
          (a, b) => new Date(b.year) - new Date(a.year)
        );
        setTimeline(sorted);
        alert("✏️ Memory updated!");
      } else {
        const res = await axios.post(`${BASE_URL}/api/memories`, memoryToSave);
        const sorted = [res.data, ...timeline].sort(
          (a, b) => new Date(b.year) - new Date(a.year)
        );
        setTimeline(sorted);
        alert("✅ Memory added!");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("❌ Failed to save memory.");
    }

    setNewMemory({
      year: "",
      title: "",
      photo: "",
      memory: "",
      file: null,
    });
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
  };

  return (
    <div className="app-container">
      <h1 className="timeline-title animated-title">
        💖 Kriti <span className="heart">❤️</span> Priyam: A Timeline of Us💓
      </h1>

      <div className="counter-box">
        <h3>⏳ Together Since 🫂</h3>
        <p>{liveTime}</p>
        <p>Kriti♾️Priyam</p>
      </div>

      <div className="button-container">
        <button
          onClick={() => {
            setShowForm(!showForm);
            setIsEditing(false);
            setNewMemory({
              year: "",
              title: "",
              photo: "",
              memory: "",
              file: null,
            });
          }}
          className="toggle-btn"
        >
          {showForm ? "Close Form" : "+ Add Memory"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddOrEdit} className="form-container">
          <input
            type="date"
            placeholder="Date"
            value={newMemory.year}
            onChange={(e) =>
              setNewMemory({ ...newMemory, year: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Title"
            value={newMemory.title}
            onChange={(e) =>
              setNewMemory({ ...newMemory, title: e.target.value })
            }
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setNewMemory({ ...newMemory, file: e.target.files[0] })
            }
          />
          <textarea
            placeholder="❤️Our memory..."
            value={newMemory.memory}
            onChange={(e) =>
              setNewMemory({ ...newMemory, memory: e.target.value })
            }
            rows="3"
            required
          />
          <button type="submit" className="save-btn">
            {isEditing ? "Update Memory" : "Save Memory"}
          </button>
        </form>
      )}

      <div className="timeline-wrapper">
        {timeline.map((memory, index) => {
          const isEven = index % 2 === 0;
          return (
            <div
              key={index}
              className={`timeline-card ${isEven ? "left" : "right"}`}
            >
              <div className="image-card">
                <img src={memory.photo} alt={memory.title} />
              </div>
              <div className="description-card">
                <h3>{memory.title}</h3>
                <p className="year">({memory.year})</p>
                <p>{memory.memory}</p>
                {memory.createdAt && (
                  <p className="timestamp">
                    🕒 Added on:{" "}
                    {new Date(memory.createdAt).toLocaleString()}
                  </p>
                )}
                <div className="button-group">
                  <button
                    onClick={() => handleEdit(memory)}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <footer className="footer">
        Made with <span className="footer-heart">❤️</span> by KRITI & PRIYAM
        <p>
          Not an ending, <br />
          just the first page of our forever.♾️❤️
        </p>
      </footer>
    </div>
  );
}

export default App;
