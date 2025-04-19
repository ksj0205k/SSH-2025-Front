import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const server = "localhost"; // 서버 주소
const port = "8080";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  // 게시글 데이터 불러오기
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://${server}:${port}/posts/${id}`);
        if (!response.ok) throw new Error("게시물 불러오기 실패");
        const data = await response.json();

        // 댓글 계층 구조 재구성
        const organizedComments = organizeComments(data.comments || []);
        setPost(data);
        setComments(organizedComments);
      } catch (error) {
        console.error(error);
        Alert.alert("오류", "게시물을 불러오는 중 문제가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPost();
  }, [id]);

  // 평면 댓글 배열을 계층 구조로 재구성
  const organizeComments = (flatComments) => {
    const map = {};
    const roots = [];
    flatComments.forEach((c) => {
      c.replies = [];
      map[c.id] = c;
    });
    flatComments.forEach((c) => {
      if (c.parent_id) {
        if (map[c.parent_id]) {
          map[c.parent_id].replies.push(c);
        }
      } else {
        roots.push(c);
      }
    });
    return roots;
  };

  // 댓글 등록
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const response = await fetch(`http://${server}:${port}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: post.id, content: newComment }),
      });
      if (!response.ok) throw new Error("댓글 등록 실패");
      const addedComment = await response.json();
      setComments((prev) => [...prev, addedComment]);
      setNewComment("");
    } catch (error) {
      console.error(error);
      Alert.alert("오류", "댓글 등록에 실패했습니다.");
    }
  };

  if (loading) return <Text style={styles.loading}>로딩 중...</Text>;
  if (!post) return <Text style={styles.error}>게시물을 찾을 수 없습니다.</Text>;

  return (
    <ScrollView style={styles.container}>
      {/* 게시글 내용 */}
      <View style={styles.postBox}>
        <Text style={styles.postTitle}>{post.title}</Text>
        <Text style={styles.postAuthor}>작성자: {post.author}</Text>
        <Text style={styles.postContent}>{post.content}</Text>
      </View>

      {/* AI 답변 내용만 별도 칸 */}
      {post.ai_answer && (
        <View style={styles.aiAnswerBox}>
          <Text style={styles.aiAnswerTitle}>AI 답변</Text>
          <Text style={styles.aiAnswerContent}>{post.ai_answer}</Text>
        </View>
      )}

      {/* 댓글 목록 */}
      <Text style={styles.commentHeader}>댓글 {comments.length}</Text>
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}

      {/* 댓글 입력 */}
      <View style={styles.commentInputContainer}>
        <Image source={{ uri: "https://via.placeholder.com/35" }} style={styles.profileImage} />
        <TextInput
          style={styles.commentInput}
          placeholder="댓글을 입력하세요"
          value={newComment}
          onChangeText={setNewComment}
        />
        <TouchableOpacity onPress={handleAddComment}>
          <Ionicons name="arrow-up-circle" size={28} color="#555" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// 댓글 재귀 컴포넌트
const CommentItem = ({ comment }) => (
  <View style={styles.commentBox}>
    <View style={styles.commentHeader}>
      <Image source={{ uri: "https://via.placeholder.com/35" }} style={styles.commentProfile} />
      <View style={styles.commentContent}>
        <Text style={styles.commentAuthor}>{comment.author}</Text>
        <Text style={styles.commentTime}>{new Date(comment.created_at).toLocaleString()}</Text>
        <Text style={styles.commentText}>{comment.content}</Text>
        {/* AI 답변 영역 (필요시 별도 칸으로) */}
        {comment.ai_reply && (
          <View style={styles.aiReplyBox}>
            <Text style={styles.aiReplyTitle}>AI 답변</Text>
            <Text style={styles.aiReplyContent}>{comment.ai_reply}</Text>
          </View>
        )}
        {/* 답글 리스트 */}
        {comment.replies && comment.replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} />
            ))}
          </View>
        )}
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  postBox: {
    //borderWidth: 1,
    //borderColor: "#999",
    //borderRadius: 8,
    padding: 16,
    margin: 16,
    backgroundColor: "#fff",
  },
  postTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 8, color: "#222" },
  postAuthor: { fontSize: 14, color: "#555", marginBottom: 8 },
  postContent: { fontSize: 16, color: "#333" },
  aiAnswerBox: {
    margin: 16,
    padding: 16,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#999",
  },
  aiAnswerTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8, color: "#222" },
  aiAnswerContent: { fontSize: 14, color: "#444" },
  commentHeader: { fontSize: 16, fontWeight: "bold", paddingHorizontal: 16, paddingVertical: 8, color: "#222" },
  commentBox: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: "#ffffff", // 하얀색 배경으로 변경
  },
  commentInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#ffffff", // 하얀색 배경으로 변경
  },
  commentProfile: { width: 35, height: 35, borderRadius: 17.5, marginRight: 8 },
  commentContent: { flex: 1 },
  commentAuthor: { fontSize: 14, fontWeight: "bold", color: "#222" },
  commentTime: { fontSize: 12, color: "#777" },
  commentText: { fontSize: 14, marginTop: 4, color: "#333" },
  aiReplyBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#d0d0d0",
    borderRadius: 6,
  },
  aiReplyTitle: { fontSize: 14, fontWeight: "bold", marginBottom: 4, color: "#222" },
  aiReplyContent: { fontSize: 14, color: "#444" },
  repliesContainer: { marginLeft: 20, marginTop: 8 },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  commentInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
  },
  profileImage: { width: 35, height: 35, borderRadius: 17.5, marginRight: 8 },
  loading: { flex: 1, textAlign: "center", paddingTop: 40, color: "#222" },
  error: { flex: 1, textAlign: "center", paddingTop: 40, color: "red" },
});