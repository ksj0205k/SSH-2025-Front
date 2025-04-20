import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Platform,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const server = "43.203.119.117";
const port = "8080";

export default function HomeScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [visibleIds, setVisibleIds] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`http://${server}:${port}/api/posts`);
      if (!res.ok) throw new Error("게시판 데이터를 불러오는 데 실패했습니다.");
      const data = await res.json();
      const enriched = (data || []).map(item => ({
       ...item,
       summation: item.summation
         || (item.content ? item.content.slice(0, 100) : ""),
        ai_answer: item.ai_answer || "AI 요약: 더 자세한 답변을 보려면 선택하세요.",
        like_count: item.like_count ?? 0,
        comment_count: item.comment_count ?? 0,
      }));
      setPosts(enriched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  // 스크롤 시 보이는 항목 ID 관리
  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    const ids = viewableItems.map(v => v.item.id);
    setVisibleIds(ids);
  }).current;

  const filtered = posts.filter(p =>
    p.title.includes(search) || p.content.includes(search)
  );

  if (loading) return <ActivityIndicator style={styles.loading} size="large" color="#2DB400" />;

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <Text style={styles.logoText}>Q&Ai</Text>
        <Ionicons name="search-outline" size={24} color="#fff" />
      </View>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#777" />
        <TextInput
          style={styles.searchInput}
          placeholder="궁금한 질문을 입력해 보세요."
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <ListItem
            item={item}
            onPress={() => router.push(`/post-detail?id=${item.id}`)}
            isVisible={visibleIds.includes(item.id)}
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => router.push(`/new-post`)}>
        <Ionicons name="create-outline" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

function ListItem({ item, onPress, isVisible }) {
  const fade = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(item.like_count);

  // 뷰 진입 시 애니메이션
  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [isVisible]);

  const toggleLike = () => {
    setLiked(prev => !prev);
    setLikes(prev => (liked ? prev - 1 : prev + 1));
  };

  return (
    <Animated.View
      style={[
        styles.card,
        { opacity: fade, transform: [{ translateY }] },
      ]}
    >
      <TouchableOpacity style={styles.cardContent} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.headerRow}>
          <Ionicons name="help-circle" size={20} color="#2DB400" />
          <Text style={styles.category}>Q&A</Text>
          <Text style={styles.timestamp}>{new Date(item.created_at).toLocaleString()}</Text>
        </View>
        <Text style={styles.postTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.summation} numberOfLines={2}>{item.summation}...</Text>
        <View style={styles.aiSnippetBox}>
          <Text style={styles.aiSnippet} numberOfLines={2}>{item.ai_answer}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.metaRow}>        
        <TouchableOpacity style={styles.metaItem} onPress={toggleLike} activeOpacity={0.6}>
          <Ionicons name={liked ? "thumbs-up" : "thumbs-up-outline"} size={16} color={liked ? "#2DB400" : "#777"} />
          <Text style={[styles.metaText, liked && { color: "#2DB400" }]}>{likes}</Text>
        </TouchableOpacity>
        <View style={styles.metaItem}>
          <Ionicons name="chatbubble-ellipses-outline" size={16} color="#777" />
          <Text style={styles.metaText}>{item.comment_count}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

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
  logoText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
    ...Platform.select({ ios: { fontFamily: 'AvenirNext-Bold' }, android: { fontFamily: 'Roboto' } }),
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    paddingHorizontal: 14,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: { flex: 1, marginLeft: 10, height: 42, fontSize: 15, color: "#444" },
  listContainer: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardContent: { padding: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  category: { marginLeft: 6, color: "#2DB400", fontWeight: "700" },
  timestamp: { marginLeft: 'auto', color: "#999", fontSize: 11 },
  postTitle: { fontSize: 17, fontWeight: "700", color: "#222" },
  summation: { fontSize: 14, color: "#555", marginVertical: 6 },
  aiSnippetBox: { backgroundColor: "#f5f5f5", padding: 10, borderRadius: 8 },
  aiSnippet: { fontSize: 13, color: "#333", fontStyle: "italic" },
  metaRow: { flexDirection: "row", padding: 12, borderTopWidth: 1, borderTopColor: "#eee" },
  metaItem: { flexDirection: "row", alignItems: "center", marginRight: 24 },
  metaText: { marginLeft: 6, color: "#777", fontSize: 13 },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#2DB400',
    borderRadius: 28,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});