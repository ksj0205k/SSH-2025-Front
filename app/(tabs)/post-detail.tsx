import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// 로컬 에셋 이미지
const DEFAULT_USER_AVATAR = require('../../assets/images/asker.png');
const DEFAULT_AI_AVATAR = require('../../assets/images/answer.png');

// 더미 AI 답변
const DUMMY_POST_AI = "이 게시물에 대한 AI 더미 답변입니다. 궁금하신 점을 쉽게 이해하실 수 있도록 도와드립니다.";
const DUMMY_COMMENT_AI = "이 댓글에 대한 AI 더미 답변입니다. 추가 설명이 필요하시면 언제든지 물어보세요.";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // 애니메이션 값
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  // 데이터 로드
  useEffect(() => {
    fetchPost();
  }, [id]);

  // 화면 포커스 될 때마다 애니메이션 초기화
  useFocusEffect(
    React.useCallback(() => {
      // 초기값 세팅
      fadeAnim.setValue(0);
      translateY.setValue(20);
      // 애니메이션 실행
      if (!loading && post) {
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
      }
    }, [loading, post])
  );

  const fetchPost = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://43.203.119.117:8080/posts/${id}`);
      if (!res.ok) throw new Error("게시물 불러오기 실패");
      const data = await res.json();
      data.ai_answer = data.ai_answer || DUMMY_POST_AI;
      data.like_count = data.like_count ?? 0;
      setLikeCount(data.like_count);
      setLiked(!!data.user_liked);
      // 댓글 재구성
      const organized = organizeComments((data.comments || []).map(c => ({
        ...c,
        ai_reply: c.ai_reply || DUMMY_COMMENT_AI,
      })));
      setPost(data);
      setComments(organized);
    } catch (e) {
      console.error(e);
      Alert.alert("오류", "게시물을 불러오는 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const organizeComments = flat => {
    const map = {};
    flat.forEach(c => { map[c.id] = { ...c, replies: [] }; });
    const roots = [];
    flat.forEach(c => {
      if (c.parent_id && map[c.parent_id]) map[c.parent_id].replies.push(map[c.id]);
      else roots.push(map[c.id]);
    });
    return roots;
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`http://43.203.119.117:8080/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: post.id, content: newComment }),
      });
      if (!res.ok) throw new Error("댓글 등록 실패");
      const added = await res.json();
      added.ai_reply = DUMMY_COMMENT_AI;
      setComments(prev => [...prev, { ...added, replies: [] }]);
      setNewComment("");
    } catch (e) {
      console.error(e);
      Alert.alert("오류", "댓글 등록에 실패했습니다.");
    }
  };

  const toggleLike = () => {
    setLiked(prev => !prev);
    setLikeCount(prev => prev + (liked ? -1 : 1));
    // TODO: 서버 동기화
  };

  if (loading) {
    return <ActivityIndicator style={styles.loading} size="large" color="#2DB400" />;
  }
  if (!post) {
    return <Text style={styles.error}>게시물을 찾을 수 없습니다.</Text>;
  }

  return (
    <Animated.ScrollView
      contentContainerStyle={styles.content}
      style={[styles.container, { opacity: fadeAnim, transform: [{ translateY }] }]}
      showsVerticalScrollIndicator={false}
    >
      {/* 헤더 */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Q&Ai</Text>
        <TouchableOpacity>
          <Ionicons name="share-social-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* 본문 */}
      <View style={styles.postBox}>
        <View style={styles.authorRow}>
          <Image
            source={post.author_avatar ? { uri: post.author_avatar } : DEFAULT_USER_AVATAR}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.postAuthor}>{post.author}</Text>
            <Text style={styles.postTime}>{new Date(post.created_at).toLocaleString()}</Text>
          </View>
        </View>
        <Text style={styles.postTitle}>{post.title}</Text>
        <Text style={styles.postContent}>{post.content}</Text>
        <View style={styles.actionRow}>
          {/* 좋아요 */}
          <TouchableOpacity style={styles.actionBtn} onPress={toggleLike}>
            <Ionicons name={liked ? "heart" : "heart-outline"} size={20} color={liked ? "#e91e63" : "#777"} />
            <Text style={[styles.actionText, liked && { color: "#e91e63" }]}>{likeCount}</Text>
          </TouchableOpacity>
          {/* 댓글 */}
          <View style={styles.actionBtn}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#777" />
            <Text style={styles.actionText}>{comments.length}</Text>
          </View>
          {/* 스크랩 */}
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="bookmark-outline" size={20} color="#777" />
            <Text style={styles.actionText}>스크랩</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* AI 답변 */}
      <View style={styles.aiAnswerBox}>
        <View style={styles.authorRow}>
          <Image
            source={post.ai_avatar ? { uri: post.ai_avatar } : DEFAULT_AI_AVATAR}
            style={styles.avatar}
          />
          <Text style={styles.aiAnswerTitle}>AI 답변</Text>
        </View>
        <Text style={styles.aiAnswerContent}>{post.ai_answer}</Text>
      </View>

      {/* 댓글 */}
      <Text style={styles.commentHeader}>댓글 {comments.length}</Text>
      {comments.map(c => <CommentItem key={c.id} comment={c} />)}

      <View style={{ height: 100 }} />
    </Animated.ScrollView>
  );
}

// 댓글 컴포넌트
const CommentItem = ({ comment }) => (
  <View style={styles.commentBox}>
    <View style={styles.commentHeaderRow}>
      <Image
        source={comment.author_avatar ? { uri: comment.author_avatar } : DEFAULT_USER_AVATAR}
        style={styles.commentAvatar}
      />
      <View style={styles.commentMain}>
        <View style={styles.commentMeta}>
          <Text style={styles.commentAuthor}>{comment.author}</Text>
          <Text style={styles.commentTime}>{new Date(comment.created_at).toLocaleString()}</Text>
        </View>
        <Text style={styles.commentText}>{comment.content}</Text>

        <View style={styles.aiReplyBox}>
          <View style={styles.authorRow}>
            <Image source={DEFAULT_AI_AVATAR} style={styles.commentAvatar} />
            <Text style={styles.aiReplyTitle}>AI 답변</Text>
          </View>
          <Text style={styles.aiReplyContent}>{comment.ai_reply}</Text>
        </View>

        {comment.replies?.map(r => <CommentItem key={r.id} comment={r} />)}
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  navbar: {
    height: 56,
    backgroundColor: "#2DB400",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  navTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  content: { paddingBottom: 80 },
  postBox: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  authorRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  postAuthor: { fontSize: 16, fontWeight: "600", color: "#222" },
  postTime: { fontSize: 12, color: "#999" },
  postTitle: { fontSize: 20, fontWeight: "bold", color: "#222", marginBottom: 12 },
  postContent: { fontSize: 16, color: "#333", lineHeight: 24 },
  actionRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 16 },
  actionBtn: { flexDirection: "row", alignItems: "center" },
  actionText: { marginLeft: 6, fontSize: 14, color: "#777" },
  aiAnswerBox: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  aiAnswerTitle: { fontSize: 16, fontWeight: "bold", color: "#2DB400", marginLeft: 8 },
  aiAnswerContent: { fontSize: 15, color: "#444", lineHeight: 22, marginTop: 8 },
  commentHeader: { fontSize: 18, fontWeight: "bold", color: "#222", marginHorizontal: 16, marginBottom: 8 },
  commentBox: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#2DB400",
  },
  commentHeaderRow: { flexDirection: "row", alignItems: "flex-start" },
  commentAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: 10 },
  commentMain: { flex: 1 },
  commentMeta: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  commentAuthor: { fontSize: 14, fontWeight: "600", color: "#222" },
  commentTime: { fontSize: 11, color: "#999" },
  commentText: { fontSize: 14, color: "#333", lineHeight: 20 },
  aiReplyBox: { backgroundColor: "#f9f9f9", padding: 10, borderRadius: 8, marginTop: 12 },
  aiReplyTitle: { fontSize: 14, fontWeight: "bold", color: "#2DB400", marginLeft: 8, marginBottom: 6 },
  aiReplyContent: { fontSize: 13, color: "#555", lineHeight: 18 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { flex: 1, textAlign: "center", paddingTop: 40, color: "red" },
});
