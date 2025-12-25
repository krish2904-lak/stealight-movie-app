import { useState } from "react";

function SearchBar({ onSearch }) {
  const [text, setText] = useState("");

  return (
    <input
      className="search"
      placeholder="Search movies..."
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onSearch(e.target.value);
      }}
    />
  );
}

export default SearchBar;
