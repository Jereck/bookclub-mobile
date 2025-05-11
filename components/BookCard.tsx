"use client"

import { useState } from "react"
import {
  View,
  Text,
  Image,
  ScrollView,
  useWindowDimensions,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import type { Book } from "@/lib/api/types"

export interface BookCardProps {
  book: Book
  onAdd?: () => void
  isAdded?: boolean
  onClose?: () => void
}

export default function BookCard({ book, onAdd, isAdded, onClose }: BookCardProps) {
  const { width } = useWindowDimensions()
  const [expanded, setExpanded] = useState(false)

  // Extract genres if they exist
  const genres = book.subjects?.slice(0, 3) || []

  return (
    <View style={[styles.container, { width: width * 0.9, maxHeight: width * 1.5 }]}>
      {/* Close button */}
      {onClose && (
        <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
          <Feather name="x" size={18} color="#ffffff" />
        </TouchableOpacity>
      )}

      <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Book Cover with Gradient Overlay */}
        <View style={styles.coverContainer}>
          {book.image ? (
            <Image source={{ uri: book.image }} style={styles.coverImage} resizeMode="cover" />
          ) : (
            <View style={styles.placeholderCover}>
              <Feather name="book" size={48} color="#9ca3af" />
            </View>
          )}

          <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} style={styles.coverGradient} />

          {/* Title and author overlay on image */}
          <View style={styles.coverTextContainer}>
            <Text style={styles.coverTitle} numberOfLines={2}>
              {book.title}
            </Text>
            <Text style={styles.coverAuthor} numberOfLines={1}>
              {book.authors ? book.authors[0] : "Unknown Author"}
            </Text>
          </View>
        </View>

        {/* Book Details */}
        <View style={styles.detailsContainer}>
          {/* Rating and Metadata */}
          <View style={styles.metadataContainer}>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Feather
                  key={`star-${star}`}
                  name="star"
                  size={16}
                  color={star <= 4 ? "#F59E0B" : "#D1D5DB"}
                  style={{ marginRight: 2 }}
                />
              ))}
              <Text style={styles.ratingText}>4.0</Text>
            </View>

            <View style={styles.statsContainer}>
              {book.pages && (
                <View style={styles.statItem}>
                  <Feather name="file-text" size={14} color="#9ca3af" />
                  <Text style={styles.statText}>{book.pages} pages</Text>
                </View>
              )}

              {book.date_published && (
                <View style={styles.statItem}>
                  <Feather name="calendar" size={14} color="#9ca3af" />
                  <Text style={styles.statText}>{book.date_published}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Genre Tags */}
          {genres.length > 0 && (
            <View style={styles.genreContainer}>
              {genres.map((genre, index) => (
                <View key={index} style={styles.genreTag}>
                  <Text style={styles.genreText}>{genre}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Synopsis */}
          {book.synopsis ? (
            <View style={styles.synopsisContainer}>
              <Text style={styles.sectionTitle}>Synopsis</Text>
              <Text style={styles.synopsisText} numberOfLines={expanded ? undefined : 4}>
                {book.synopsis}
              </Text>

              {book.synopsis.length > 120 && (
                <TouchableOpacity
                  onPress={() => setExpanded(!expanded)}
                  style={styles.readMoreButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.readMoreText}>{expanded ? "Show less" : "Read more"}</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null}

          {/* Add to Shelf Button */}
          {onAdd && (
            <View style={styles.actionContainer}>
              <TouchableOpacity
                onPress={onAdd}
                style={[styles.addButton, { backgroundColor: isAdded ? "#10B981" : "#6366F1" }]}
                activeOpacity={0.8}
              >
                <Feather name={isAdded ? "check" : "plus"} size={16} color="white" />
                <Text style={styles.buttonText}>{isAdded ? "Added to Shelf" : "Add to Shelf"}</Text>
              </TouchableOpacity>

              {/* ISBN Display */}
              <Text style={styles.isbnText}>ISBN: {book.isbn13}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  scrollContent: {
    flexGrow: 1,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.3)",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    ...Platform.select({
      android: {
        elevation: 5,
      },
    }),
  },
  coverContainer: {
    width: "100%",
    height: 240,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  placeholderCover: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  coverGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
  coverTextContainer: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
  },
  coverTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  coverAuthor: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  detailsContainer: {
    padding: 16,
  },
  metadataContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "500",
    color: "#F59E0B",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  statText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#6B7280",
  },
  genreContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  genreTag: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  genreText: {
    fontSize: 12,
    color: "#6366F1",
    fontWeight: "500",
  },
  synopsisContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  synopsisText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#4B5563",
  },
  readMoreButton: {
    marginTop: 8,
    alignSelf: "flex-start",
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6366F1",
  },
  actionContainer: {
    marginTop: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  isbnText: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 12,
    color: "#9CA3AF",
  },
})
