import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const baseUrl = `http://${window.location.hostname}:3838`;

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`${baseUrl}/files`);
      setFiles(response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      await axios.post(`${baseUrl}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchFiles();
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const downloadFile = async (filename) => {
    try {
      const response = await axios.get(`${baseUrl}/download/${filename}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <div className="App">
      <h1>File Manager</h1>

      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Upload File</button>

      <h2>File List</h2>
      <ul>
        {files.map((file) => (
          <li key={file.Key}>
            {file.Key}
            <button onClick={() => downloadFile(file.Key)}>Download</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
