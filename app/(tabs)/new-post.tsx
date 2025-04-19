import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

const server = "localhost";
const port = "8080";

export default function NewPostScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState(""); // 작성자 입력 상태 추가

  const handlePost = async () => {
    if (!title.trim() || !content.trim() || !author.trim()) {
      Alert.alert("⚠️ 입력 오류", "제목, 내용, 작성자를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`http://${server}:${port}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          author, // 사용자 입력값 전달
        }),
      });

      if (!response.ok) throw new Error("게시글 추가 실패");

      router.push('/'); // index 페이지로 이동
    } catch (error) {
      console.error("게시글 추가 중 오류:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancel}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.title}>새 게시물</Text>
        <TouchableOpacity onPress={handlePost}>
          <Text style={styles.submit}>등록</Text>
        </TouchableOpacity>
      </View>

      {/* 제목 입력 */}
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="제목을 입력하세요"
        style={styles.inputTitle}
      />

      {/* 작성자 입력 */}
      <TextInput
        value={author}
        onChangeText={setAuthor}
        placeholder="작성자를 입력하세요"
        style={styles.inputAuthor}
      />

      {/* 내용 입력 */}
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder="내용을 입력하세요"
        multiline
        style={styles.inputContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  cancel: { fontSize: 16, color: "#777" },
  title: { fontSize: 18, fontWeight: "bold" },
  submit: { fontSize: 16, color: "#007bff", fontWeight: "bold" },

  categoryContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  categoryButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginHorizontal: 8,
  },
  categorySelected: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },
  categoryText: {
    fontSize: 14,
    color: "#555",
  },
  categoryTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },

  inputTitle: {
    fontSize: 16,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderColor: "#eee",
    padding: 12,
    marginTop: 8,
  },
  inputAuthor: { // 작성자 입력 스타일 추가
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
    padding: 12,
    marginTop: 8,
  },
  inputContent: {
    flex: 1,
    fontSize: 16,
    padding: 16,
    textAlignVertical: "top",
  },
});