// // components/CommentSection.tsx
// import React, { useEffect, useState } from "react";
// import { commentApi } from "../services/api";
// import type { Comment } from "../types/CommentType";

// interface Props {
//   articleId: string;
// }

// const CommentSection: React.FC<Props> = ({ articleId }) => {
//   const [comments, setComments] = useState<Comment[]>([]);
//   const [content, setContent] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const loadComments = async () => {
//     try {
//       const res = await commentApi.getByArticle(articleId);
//       console.log("COMMENT RESPONSE:", res.data);
//       setComments(res.data);
//     } catch (e) {
//       console.error(e);
//     }
//   };


//   // update khi đổi bài báo
//   useEffect(() => {
//     loadComments();
//   }, [articleId]);

//   const submitComment = async () => {
//     if (!content.trim()) return;

//     try {
//       setLoading(true);
//       await commentApi.add(articleId, content);
//       setContent("");
//       loadComments(); // reload list
//     } catch (e) {
//       setError("Bạn cần đăng nhập để bình luận");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="mt-10">
//       <h3 className="text-xl font-bold mb-4">
//         ({comments.length})
//       </h3>

//       {/* Input */}
//       <div className="mb-4">
//         <textarea
//           value={content}
//           onChange={(e) => setContent(e.target.value)}
//           placeholder="Viết bình luận..."
//           className="w-full border rounded-lg p-3 focus:outline-none focus:ring"
//           rows={3}
//         />
//         <button
//           onClick={submitComment}
//           disabled={loading}
//           className="mt-2 px-4 py-2 bg-[#78b43d] text-white rounded hover:bg-[#3c811e]"
//         >
//           Gửi bình luận
//         </button>
//         {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
//       </div>

//       {/* List */}
//       <div className="space-y-4">
//         {comments.map((c) => (
//           <div key={c.id} className="border rounded-lg p-3">
//             <div className="text-sm text-gray-500 mb-1">
//               {c.userName} ·{" "}
//               {new Date(c.createdAt).toLocaleString("vi-VN")}
//             </div>
//             <div>{c.content}</div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default CommentSection;
