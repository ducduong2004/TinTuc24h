import { useState } from "react";

interface Props {
  onSubmit: (content: string) => void;
}

const CommentForm: React.FC<Props> = ({ onSubmit }) => {
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSubmit(content);
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        className="w-full border rounded p-2"
        placeholder="Viết bình luận..."
      />
      <button className="mt-2 px-4 py-1 bg-blue-600 text-white rounded">
        Gửi
      </button>
    </form>
  );
};

export default CommentForm;
