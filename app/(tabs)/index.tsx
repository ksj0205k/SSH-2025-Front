import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router"; // useRouter 사용
import { Ionicons } from "@expo/vector-icons";

const server = "localhost";
const port = "8080";

export default function HomeScreen() {
  const router = useRouter();
  const [ posts, setPosts ] = useState<
    {
      id: string;
      title: string;
      content: string;
      author: string;
      created_at: string;
      summation : string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`http://${server}:${port}/posts`);
      if (!response.ok) {
        throw new Error("게시판 데이터를 불러오는 데 실패했습니다.");
      }
      const data = await response.json();
      setPosts(data || []);
    } catch (error) {
      console.log("에러 발생:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        router.push(`/post-detail?id=${item.id}`); // 게시물 상세 페이지로 이동
      }}
    >
      <View style={styles.userRow}>
        <Ionicons name="person-circle-outline" size={40} color="#ccc" style={styles.profileImage} />
        <View>
          <Text style={styles.username}>{item.author}</Text>
          <Text style={styles.timestamp}>{new Date(item.created_at).toLocaleString()}</Text>
        </View>
      </View>

      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postContent} numberOfLines={2}>{item.content}</Text>

    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push(`/new-post`)} // 새 게시물 작성 페이지로 이동
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  profileImage: { marginRight: 8 },
  username: { fontSize: 16, fontWeight: "bold" },
  timestamp: { fontSize: 12, color: "#777" },
  postTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  postContent: { fontSize: 14, color: "#555" },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  iconRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  addButton: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    backgroundColor: '#007bff',
    borderRadius: 50,
    padding: 10,
    elevation: 5,
  },
  listContainer: { paddingHorizontal: 16 },
  partyButton: {
    marginTop: 10,
    backgroundColor: '#4f4f4f', // 버튼 배경색
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  partyButtonText: {
    color: '#fff', // 버튼 텍스트 색상
    fontWeight: 'bold',
  },
});