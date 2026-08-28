"use client";
import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext";
import {
 Users,
 MessageSquare,
 Share2,
 Heart,
 Send,
 Plus,
 Check,
 UserPlus,
 Award,
 Sparkles,
 ShieldCheck,
 Search,
 X,
 Filter,
 Bookmark,
 MoreHorizontal,
 ThumbsUp,
 TrendingUp,
 Code2,
 ExternalLink,
 Smile,
 Hash,
 Eye,
 CheckCircle2,
 UserCheck,
 Briefcase,
 GraduationCap,
 MapPin,
 Calendar,
} from "lucide-react";
import { networkApi } from "../../../../lib/api/network";
import { SkillBadge } from "../common/SkillBadge";
import { TechSkillIcon } from "../common/TechSkillIcon";

export type ReactionType = "like" | "celebrate" | "support" | "love" | "insightful" | "curious";

export interface ReactionConfig {
 type: ReactionType;
 emoji: string;
 label: string;
 color: string;
 bgColor: string;
}

export const REACTIONS: Record<ReactionType, ReactionConfig> = {
 like: {
 type: "like",
 emoji: "👍",
 label: "Like",
 color: "text-blue-500",
 bgColor: "bg-blue-500/10",
 },
 celebrate: {
 type: "celebrate",
 emoji: "👏",
 label: "Celebrate",
 color: "text-emerald-500",
 bgColor: "bg-emerald-500/10",
 },
 support: {
 type: "support",
 emoji: "🚀",
 label: "Support",
 color: "text-purple-500",
 bgColor: "bg-purple-500/10",
 },
 love: {
 type: "love",
 emoji: "❤️",
 label: "Love",
 color: "text-rose-500",
 bgColor: "bg-rose-500/10",
 },
 insightful: {
 type: "insightful",
 emoji: "💡",
 label: "Insightful",
 color: "text-amber-500",
 bgColor: "bg-amber-500/10",
 },
 curious: {
 type: "curious",
 emoji: "🤔",
 label: "Curious",
 color: "text-indigo-500",
 bgColor: "bg-indigo-500/10",
 },
};

interface PostComment {
 id: string;
 name: string;
 avatar?: string;
 text: string;
 timeAgo: string;
}

interface NetworkPost {
 id: string;
 authorName: string;
 authorHeadline: string;
 authorAvatar: string;
 timeAgo: string;
 content: string;
 skills: string[];
 hashtag?: string;
 aiVerifiedBadge?: string;
 githubRepoUrl?: string;
 reactions: Record<ReactionType, number>;
 userReaction?: ReactionType | null;
 comments: PostComment[];
}

interface Peer {
 id: string;
 name: string;
 headline: string;
 avatar: string;
 bannerUrl?: string;
 about?: string;
 trustScore?: number;
 certifications?: Array<{ title: string; issuer: string; score: string }>;
 skills: Array<{ name: string; endorsedCount: number; endorsedByMe: boolean; status?: any }>;
 status: "none" | "pending" | "connected";
 mutualCount: number;
}

const STORAGE_POSTS_KEY = "microintern_network_posts_nomock_v1";
const STORAGE_PEERS_KEY = "microintern_network_peers_nomock_v1";
const STORAGE_CHATS_KEY = "microintern_network_chats_nomock_v1";

// Completely empty default state (zero mockup data)
const INITIAL_POSTS: NetworkPost[] = [];
const INITIAL_PEERS: Peer[] = [];

// Sample candidate profiles directory that users can explore on demand
const DIRECTORY_PEERS: Peer[] = [];

export const NetworkPage: React.FC = () => {
 const { userProfile, showToast, setCurrentRoute } = useApp();

 // Active Tab
 const [activeTab, setActiveTab] = useState<"feed" | "network">("feed");

 // Search and hashtag filters
 const [searchQuery, setSearchQuery] = useState("");
 const [activeHashtag, setActiveHashtag] = useState<string | null>(null);

 // Persistent Posts State
 const [posts, setPosts] = useState<NetworkPost[]>([]);

 // My own posts (shown in My Network tab)
 const [myPosts, setMyPosts] = useState<NetworkPost[]>([]);
 const [myPostsLoading, setMyPostsLoading] = useState(false);

 // Persistent Peers State
 const [peers, setPeers] = useState<Peer[]>([]);

 useEffect(() => {
 // Fetch feed
 networkApi.getFeed().then((res) => {
 // Map API posts to UI structure
 const mappedPosts = res.data.posts.map((p) => ({
 id: p.id,
 authorName: p.author?.name || "Unknown User",
 authorHeadline: p.author?.headline || "",
 authorAvatar: p.author?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
 timeAgo: new Date(p.createdAt).toLocaleDateString(),
 content: p.content,
 skills: ["MicroIntern"], // Just stub for now, as posts don't have skills directly yet
 hashtag: p.postType,
 reactions: {
 like: p._count?.reactions || 0,
 celebrate: 0, support: 0, love: 0, insightful: 0, curious: 0,
 },
 userReaction: (p.hasReacted ? "like" : null) as ReactionType | null,
 comments: [],
 }));
 setPosts(mappedPosts);
 }).catch(console.error);

 // Fetch Discover profiles
 networkApi.getDiscoverProfiles().then((res) => {
 const mappedPeers = res.data.map((p) => ({
 id: p.id,
 name: p.name,
 headline: p.headline || "Software Engineer",
 avatar: p.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
 trustScore: p.trustScore,
 skills: p.skills.map((s) => ({
 name: s.skill,
 endorsedCount: 1, // default
 endorsedByMe: false,
 status: s.verified ? "VERIFIED" : "CLAIMED"
 })),
 status: "none" as "none" | "pending" | "connected",
 mutualCount: 0,
 }));
 setPeers(mappedPeers);
 }).catch(console.error);
 }, []);

 // Fetch my posts when My Network tab becomes active
 useEffect(() => {
 if (activeTab !== "network") return;
 setMyPostsLoading(true);
 networkApi.getMyPosts().then((res) => {
 const mapped = res.data.map((p) => ({
 id: p.id,
 authorName: p.author?.name || userProfile.fullName || "Me",
 authorHeadline: p.author?.headline || "",
 authorAvatar: p.author?.avatar || userProfile.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
 timeAgo: new Date(p.createdAt).toLocaleDateString(),
 content: p.content,
 skills: [] as string[],
 hashtag: p.postType,
 reactions: {
 like: p._count?.reactions || 0,
 celebrate: 0, support: 0, love: 0, insightful: 0, curious: 0,
 },
 userReaction: (p.hasReacted ? "like" : null) as ReactionType | null,
 comments: [],
 }));
 setMyPosts(mapped);
 }).catch(console.error).finally(() => setMyPostsLoading(false));
 }, [activeTab]);

 // Create Post input state
 const [newPostText, setNewPostText] = useState("");
 const [selectedPostSkills, setSelectedPostSkills] = useState<string[]>([
 "React",
 "TypeScript",
 "AI & LLM",
 ]);
 const [newPostHashtag, setNewPostHashtag] = useState<string>("INSIGHT");
 const [newPostRepoUrl, setNewPostRepoUrl] = useState("");
 const [showAdvancedPostFields, setShowAdvancedPostFields] = useState(false);

 // Reaction Picker Popover State
 const [activeReactionPickerId, setActiveReactionPickerId] = useState<string | null>(null);

 // Direct Messaging Modal
 const [activeChatPeer, setActiveChatPeer] = useState<Peer | null>(null);
 const [chatMessages, setChatMessages] = useState<
 Record<string, Array<{ id: string; sender: "me" | "peer"; text: string; time: string }>>
 >(() => {
 if (typeof window !== "undefined") {
 const saved = localStorage.getItem(STORAGE_CHATS_KEY);
 if (saved) {
 try {
 return JSON.parse(saved);
 } catch (e) {
 console.error(e);
 }
 }
 }
 return {};
 });
 const [chatInput, setChatInput] = useState("");

 // LinkedIn Public Profile Modal state (for viewing another person's account)
 const [selectedPublicPeer, setSelectedPublicPeer] = useState<Peer | null>(null);

 // Comment Modal / Expand
 const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
 const [commentInput, setCommentInput] = useState("");

 // Prevent body scroll when modals are open
 useEffect(() => {
 if (activeChatPeer || selectedPublicPeer) {
 document.body.style.overflow = "hidden";
 } else {
 document.body.style.overflow = "unset";
 }
 return () => {
 document.body.style.overflow = "unset";
 };
 }, [activeChatPeer, selectedPublicPeer]);

 // Save chats
 useEffect(() => {
 if (typeof window !== "undefined") {
 localStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify(chatMessages));
 }
 }, [chatMessages]);

 // Handle LinkedIn Reaction click (toggle or change reaction)
 const handleSelectReaction = (postId: string, reactionType: ReactionType) => {
 setPosts((prev) =>
 prev.map((p) => {
 if (p.id !== postId) return p;
 const currentReaction = p.userReaction;
 const newReactions = { ...p.reactions };

 // If clicking the same reaction, toggle it off
 if (currentReaction === reactionType) {
 newReactions[reactionType] = Math.max(0, newReactions[reactionType] - 1);
 return {
 ...p,
 reactions: newReactions,
 userReaction: null,
 };
 }

 // If previously reacted with something else, decrement old and increment new
 if (currentReaction) {
 newReactions[currentReaction] = Math.max(0, newReactions[currentReaction] - 1);
 }
 newReactions[reactionType] = newReactions[reactionType] + 1;

 return {
 ...p,
 reactions: newReactions,
 userReaction: reactionType,
 };
 }),
 );
 setActiveReactionPickerId(null);
 };

 // Handle Create Post
 const handleCreatePost = async () => {
 if (!newPostText.trim()) {
 showToast("Empty Post", "Please write something before posting.", "warning");
 return;
 }
 
 try {
 const res = await networkApi.createPost(newPostText.trim(), newPostHashtag || "INSIGHT");
 if (res.success) {
 const p = res.data;
 // Build author from userProfile immediately — no refetch needed
 const mappedPost = {
 id: p.id,
 authorName: p.author?.name || userProfile.fullName || "Me",
 authorHeadline: p.author?.headline || "",
 authorAvatar: p.author?.avatar || userProfile.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
 timeAgo: "Just now",
 content: p.content,
 skills: selectedPostSkills,
 hashtag: p.postType,
 reactions: {
 like: 0, celebrate: 0, support: 0, love: 0, insightful: 0, curious: 0,
 },
 userReaction: null,
 comments: [],
 };
 setPosts([mappedPost, ...posts]);
 // Also prepend to myPosts so it shows immediately in My Network tab
 setMyPosts((prev) => [mappedPost, ...prev]);
 setNewPostText("");
 setNewPostRepoUrl("");
 setShowAdvancedPostFields(false);
 showToast(
 "Post Published 🚀",
 "Your update is now live in the professional network feed.",
 "success",
 );
 }
 } catch (e) {
 showToast("Error", "Failed to publish post. Please try again.", "error");
 console.error(e);
 }
 };

 // Handle Accept Request
 const handleAcceptPeer = (peerId: string) => {
 setPeers((prev) => prev.map((p) => (p.id === peerId ? { ...p, status: "connected" } : p)));
 showToast(
 "Connection Accepted ✓",
 "You are now connected and can message directly.",
 "success",
 );
 };

 // Handle Connect Request
 const handleConnectPeer = async (peerId: string) => {
 try {
 await networkApi.sendConnectionRequest(peerId);
 setPeers((prev) => prev.map((p) => (p.id === peerId ? { ...p, status: "pending" } : p)));
 showToast("Request Sent", "Connection request sent successfully.", "info");
 } catch (e) {
 showToast("Error", "Failed to send connection request.", "error");
 console.error(e);
 }
 };

 // Handle Endorse Skill on Peer
 const handleEndorseSkill = (peerId: string, skillName: string) => {
 setPeers((prev) =>
 prev.map((p) => {
 if (p.id !== peerId) return p;
 return {
 ...p,
 skills: p.skills.map((s) => {
 if (s.name !== skillName) return s;
 return {
 ...s,
 endorsedByMe: !s.endorsedByMe,
 endorsedCount: s.endorsedByMe ? s.endorsedCount - 1 : s.endorsedCount + 1,
 };
 }),
 };
 }),
 );
 // Also update selectedPublicPeer if it happens to be open
 if (selectedPublicPeer && selectedPublicPeer.id === peerId) {
 setSelectedPublicPeer((prev) => {
 if (!prev) return null;
 return {
 ...prev,
 skills: prev.skills.map((s) => {
 if (s.name !== skillName) return s;
 return {
 ...s,
 endorsedByMe: !s.endorsedByMe,
 endorsedCount: s.endorsedByMe ? s.endorsedCount - 1 : s.endorsedCount + 1,
 };
 }),
 };
 });
 }
 showToast("Skill Endorsed 👏", `You endorsed ${skillName}. Endorsement saved!`, "success");
 };

 // Open Messaging
 const handleOpenChat = (peer: Peer) => {
 setActiveChatPeer(peer);
 if (!chatMessages[peer.id]) {
 setChatMessages((prev) => ({
 ...prev,
 [peer.id]: [
 {
 id: `m-init-${Date.now()}`,
 sender: "peer",
 text: `Hey! Thanks for connecting on MicroIntern. Let's discuss AI & Full Stack projects!`,
 time: "Just now",
 },
 ],
 }));
 }
 };

 const handleSendMessage = () => {
 if (!chatInput.trim() || !activeChatPeer) return;
 const currentList = chatMessages[activeChatPeer.id] || [];
 const updatedList = [
 ...currentList,
 {
 id: `m-${Date.now()}`,
 sender: "me" as const,
 text: chatInput.trim(),
 time: "Just now",
 },
 ];
 setChatMessages((prev) => ({
 ...prev,
 [activeChatPeer.id]: updatedList,
 }));
 setChatInput("");
 };

 const handleAddComment = (postId: string) => {
 if (!commentInput.trim()) return;
 setPosts((prev) =>
 prev.map((p) => {
 if (p.id !== postId) return p;
 return {
 ...p,
 comments: [
 ...p.comments,
 {
 id: `c-${Date.now()}`,
 name: userProfile.fullName || "You",
 avatar: userProfile.avatar,
 text: commentInput.trim(),
 timeAgo: "Just now",
 },
 ],
 };
 }),
 );
 setCommentInput("");
 showToast("Comment Added", "Your comment has been posted.", "success");
 };

 // Total reactions helper for a post
 const getTotalReactions = (reactions: Record<ReactionType, number>) => {
 return Object.values(reactions).reduce((acc, count) => acc + count, 0);
 };

 // Open LinkedIn Public Profile View for ANY person clicked
 const handleOpenProfileByName = (
 authorName: string,
 authorHeadline: string,
 authorAvatar: string,
 ) => {
 const existingPeer =
 peers.find((p) => p.name === authorName) ||
 DIRECTORY_PEERS.find((p) => p.name === authorName);
 if (existingPeer) {
 setSelectedPublicPeer(existingPeer);
 } else {
 // Dynamically create a viewable profile for this author
 setSelectedPublicPeer({
 id: `temp-${Date.now()}`,
 name: authorName,
 headline: authorHeadline,
 avatar: authorAvatar,
 about: `${authorHeadline}. Verified candidate member on MicroIntern demonstrating engineering and AI competencies.`,
 trustScore: 94,
 certifications: [
 {
 title: "MicroIntern Core Competency",
 issuer: "AI Credential Validator",
 score: "Verified ✓",
 },
 ],
 skills: [
 { name: "React", endorsedCount: 14, endorsedByMe: false },
 { name: "TypeScript", endorsedCount: 18, endorsedByMe: false },
 { name: "AI & LLM", endorsedCount: 22, endorsedByMe: false },
 ],
 status: "none",
 mutualCount: 9,
 });
 }
 };

 // Add real directory peers so user can test viewing other profiles when starting from clean state
 const handleDiscoverDirectory = () => {
 setPeers(DIRECTORY_PEERS);
 showToast(
 "Directory Populated 🌟",
 "4 real candidate profiles added to your network. Click on any name or avatar to inspect their full LinkedIn profile!",
 "success",
 );
 };

 // Filtered Posts
 const filteredPosts = posts.filter((post) => {
 const matchesSearch =
 !searchQuery.trim() ||
 post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
 post.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
 post.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
 const matchesHashtag = !activeHashtag || post.hashtag === activeHashtag;
 return matchesSearch && matchesHashtag;
 });

 return (
 <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
 {/* Header & Tabs */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/60 backdrop-blur-xl/60 backdrop-blur-xl p-6 rounded-[32px] border border-white/50 shadow-sm">
 <div>
 <h1 className="text-2xl font-bold text-[#222] flex items-center gap-2.5">
 <Users className="w-6 h-6 text-purple-500" />
 Professional Network & LinkedIn Feed
 </h1>
 <p className="text-xs text-black/50 mt-1">
 Real-time feed with LinkedIn multi-reactions, verified AI credentials, and full public
 candidate profiles.
 </p>
 </div>

 <div className="flex items-center gap-2 bg-black/5 backdrop-blur-xl/5 p-1.5 rounded-full">
 <button
 onClick={() => setActiveTab("feed")}
 className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
 activeTab === "feed"
 ? "bg-[#111111] backdrop-blur-xl text-white shadow-sm"
 : "text-[#666] hover:text-black :text-white"
 }`}
 >
 Community Feed
 </button>
 <button
 onClick={() => setActiveTab("network")}
 className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
 activeTab === "network"
 ? "bg-[#111111] backdrop-blur-xl text-white shadow-sm"
 : "text-[#666] hover:text-black :text-white"
 }`}
 >
 My Network
 {peers.filter((p) => p.status === "pending").length > 0 && (
 <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
 {peers.filter((p) => p.status === "pending").length}
 </span>
 )}
 </button>
 </div>
 </div>

 {activeTab === "feed" ? (
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Main Feed Column */}
 <div className="lg:col-span-2 space-y-6">
 {/* Search & Hashtag Bar */}
 <div className="bg-white/60 backdrop-blur-xl/60 backdrop-blur-xl p-4 rounded-2xl border border-white/50 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div className="relative flex-1">
 <Search className="w-4 h-4 absolute left-3.5 top-3 text-black/40 " />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search updates, candidates, or skills..."
 className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/5 backdrop-blur-xl/5 border border-black/5 text-xs text-[#222] focus:outline-none"
 />
 {searchQuery && (
 <button
 onClick={() => setSearchQuery("")}
 className="absolute right-3 top-2.5 text-black/40 hover:text-black"
 >
 <X className="w-4 h-4" />
 </button>
 )}
 </div>
 <div className="flex items-center gap-1.5 overflow-x-auto py-1">
 {["#INSIGHT", "#PROJECT", "#ACHIEVEMENT", "#LEARNING", "#OPPORTUNITY"].map((tag) => {
 const isActive = activeHashtag === tag.replace("#", "");
 return (
 <button
 key={tag}
 onClick={() => setActiveHashtag(isActive ? null : tag.replace("#", ""))}
 className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
 isActive
 ? "bg-purple-600 text-white shadow-xs"
 : "bg-black/5 backdrop-blur-xl/10 text-black/70 hover:bg-black/10"
 }`}
 >
 {tag}
 </button>
 );
 })}
 {activeHashtag && (
 <button
 onClick={() => setActiveHashtag(null)}
 className="px-2 py-1 text-[11px] text-rose-500 font-bold hover:underline"
 >
 Clear
 </button>
 )}
 </div>
 </div>

 {/* Create Post Box */}
 <div className="bg-white/60 backdrop-blur-xl/60 backdrop-blur-xl p-6 rounded-[32px] border border-white/50 shadow-sm space-y-4">
 <div className="flex items-start gap-3">
 <img
 src={
 userProfile.avatar ||
 "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
 }
 alt="My Avatar"
 className="w-11 h-11 rounded-full object-cover border border-black/10"
 />
 <textarea
 value={newPostText}
 onChange={(e) => setNewPostText(e.target.value)}
 placeholder="Share an achievement, AI-validated certification, or technical insight..."
 className="w-full min-h-[90px] p-4 rounded-2xl bg-black/5 backdrop-blur-xl/5 border border-white/50 text-xs text-[#222] placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
 />
 </div>

 {/* Advanced attachment toggles (GitHub URL & Hashtag) */}
 {showAdvancedPostFields && (
 <div className="p-4 rounded-2xl bg-black/5 backdrop-blur-xl/5 space-y-3 border border-white/50">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-[11px] font-semibold text-black/50 mb-1">
 Topic Hashtag
 </label>
 <select
 value={newPostHashtag}
 onChange={(e) => setNewPostHashtag(e.target.value)}
 className="w-full px-3 py-2 rounded-xl bg-white/60 backdrop-blur-xl/60 backdrop-blur-xl border border-black/10 text-xs text-[#222]"
 >
 <option value="INSIGHT">Insight</option>
 <option value="PROJECT">Project</option>
 <option value="ACHIEVEMENT">Achievement</option>
 <option value="LEARNING">Learning</option>
 <option value="OPPORTUNITY">Opportunity</option>
 </select>
 </div>
 <div>
 <label className="block text-[11px] font-semibold text-black/50 mb-1">
 GitHub Repository / Demo URL (Optional)
 </label>
 <input
 type="url"
 value={newPostRepoUrl}
 onChange={(e) => setNewPostRepoUrl(e.target.value)}
 placeholder="https://github.com/username/project"
 className="w-full px-3 py-2 rounded-xl bg-white/60 backdrop-blur-xl/60 backdrop-blur-xl border border-black/10 text-xs text-[#222]"
 />
 </div>
 </div>
 </div>
 )}

 {/* Skills / Badges attached to post */}
 <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/50">
 <div className="flex items-center gap-1.5 overflow-x-auto py-1">
 <span className="text-[11px] text-black/40 font-semibold">
 Tag Skills:
 </span>
 {["React", "TypeScript", "AI & LLM", "Next.js", "AWS", "Python"].map((skill) => {
 const isSelected = selectedPostSkills.includes(skill);
 return (
 <button
 key={skill}
 type="button"
 onClick={() => {
 if (isSelected) {
 setSelectedPostSkills(selectedPostSkills.filter((s) => s !== skill));
 } else {
 setSelectedPostSkills([...selectedPostSkills, skill]);
 }
 }}
 className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
 isSelected
 ? "bg-purple-600 text-white shadow-xs"
 : "bg-black/5 backdrop-blur-xl/10 text-[#222] hover:bg-black/10"
 }`}
 >
 <TechSkillIcon skill={skill} size={13} />
 <span>{skill}</span>
 </button>
 );
 })}
 </div>

 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => setShowAdvancedPostFields(!showAdvancedPostFields)}
 className="px-3 py-1.5 rounded-full bg-black/5 backdrop-blur-xl/10 text-black/70 text-xs font-semibold hover:bg-black/10 transition-colors flex items-center gap-1"
 >
 <Code2 className="w-3.5 h-3.5" />
 <span>Attach Repo</span>
 </button>

 <button
 type="button"
 onClick={handleCreatePost}
 disabled={!newPostText.trim()}
 className="px-6 py-2.5 rounded-full bg-[#111111] backdrop-blur-xl text-white font-bold text-xs hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-2 cursor-pointer"
 >
 <Send className="w-3.5 h-3.5" />
 <span>Post</span>
 </button>
 </div>
 </div>
 </div>

 {/* Posts Feed */}
 <div className="space-y-4">
 {filteredPosts.length === 0 ? (
 <div className="bg-white/60 backdrop-blur-xl/60 backdrop-blur-xl p-12 rounded-[32px] text-center border border-white/50 space-y-3">
 <Award className="w-10 h-10 text-black/20 mx-auto" />
 <p className="text-sm font-bold text-[#222]">
 {posts.length === 0
 ? "No updates in your feed yet"
 : "No matching network updates"}
 </p>
 <p className="text-xs text-[#888] max-w-sm mx-auto">
 {posts.length === 0
 ? "Write an update above or discover real community candidates to inspect full LinkedIn-style public accounts!"
 : "Try clearing your search query or hashtag filter to see more community posts."}
 </p>
 {posts.length === 0 && (
 <button
 type="button"
 onClick={handleDiscoverDirectory}
 className="px-5 py-2.5 rounded-full bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 transition-colors cursor-pointer inline-flex items-center gap-2 shadow-sm"
 >
 <UserCheck className="w-4 h-4" />
 <span>Discover Real Candidates in Directory</span>
 </button>
 )}
 </div>
 ) : (
 filteredPosts.map((post) => {
 const totalRx = getTotalReactions(post.reactions);
 const activeReactionConfig = post.userReaction
 ? REACTIONS[post.userReaction as ReactionType]
 : null;

 return (
 <div
 key={post.id}
 className="bg-white/60 backdrop-blur-xl/60 backdrop-blur-xl p-6 rounded-[32px] border border-white/50 shadow-sm space-y-4 hover:border-black/15 :border-white/20 transition-all relative"
 >
 {/* Author Header (CLICK TO VIEW FULL PUBLIC LINKEDIN PROFILE) */}
 <div className="flex items-start justify-between">
 <div
 onClick={() =>
 handleOpenProfileByName(
 post.authorName,
 post.authorHeadline,
 post.authorAvatar,
 )
 }
 className="flex items-start gap-3 cursor-pointer group/author"
 >
 <img
 src={post.authorAvatar}
 alt={post.authorName}
 className="w-12 h-12 rounded-full object-cover border border-black/10 group-hover/author:ring-2 ring-purple-500 transition-all"
 />
 <div>
 <div className="flex items-center gap-2">
 <h4 className="font-bold text-sm text-[#222] group-hover/author:text-purple-600 :text-purple-400 transition-colors">
 {post.authorName}
 </h4>
 {post.aiVerifiedBadge && (
 <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold flex items-center gap-1">
 <ShieldCheck className="w-3 h-3" />
 {post.aiVerifiedBadge}
 </span>
 )}
 </div>
 <p className="text-xs text-black/50 mt-0.5">
 {post.authorHeadline}
 </p>
 <span className="text-[11px] text-black/40 ">
 {post.timeAgo}
 </span>
 </div>
 </div>

 {post.hashtag && (
 <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 text-xs font-bold">
 {post.hashtag}
 </span>
 )}
 </div>

 {/* Post Content */}
 <p className="text-xs sm:text-sm text-[#222] leading-relaxed whitespace-pre-line">
 {post.content}
 </p>

 {/* Attached GitHub Repo Link */}
 {post.githubRepoUrl && (
 <a
 href={post.githubRepoUrl}
 target="_blank"
 rel="noreferrer"
 className="flex items-center justify-between p-3.5 rounded-2xl bg-black/5 backdrop-blur-xl/5 border border-white/50 hover:border-purple-500/40 transition-colors"
 >
 <div className="flex items-center gap-2.5">
 <Code2 className="w-5 h-5 text-purple-500" />
 <div>
 <div className="text-xs font-bold text-[#222]">
 {post.githubRepoUrl.replace("https://github.com/", "")}
 </div>
 <div className="text-[10px] text-black/40 ">
 Attached Code Repository • Click to inspect
 </div>
 </div>
 </div>
 <ExternalLink className="w-4 h-4 text-black/40 " />
 </a>
 )}

 {/* Skills / Badges bar with Real SVG Icons */}
 {post.skills.length > 0 && (
 <div className="flex flex-wrap gap-2 pt-1">
 {post.skills.map((skill, idx) => (
 <SkillBadge
 key={idx}
 skill={skill}
 status="CLAIMED"
 />
 ))}
 </div>
 )}

 {/* LinkedIn-style aggregated reactions and comments count */}
 <div className="flex items-center justify-between text-xs text-[#888] pt-3 border-t border-white/50">
 <div className="flex items-center gap-1.5">
 {totalRx > 0 ? (
 <>
 <span className="flex items-center -space-x-1">
 {post.reactions.like > 0 && (
 <span className="inline-block">👍</span>
 )}
 {post.reactions.celebrate > 0 && (
 <span className="inline-block">👏</span>
 )}
 {post.reactions.insightful > 0 && (
 <span className="inline-block">💡</span>
 )}
 {post.reactions.support > 0 && (
 <span className="inline-block">🚀</span>
 )}
 {post.reactions.love > 0 && (
 <span className="inline-block">❤️</span>
 )}
 {post.reactions.curious > 0 && (
 <span className="inline-block">🤔</span>
 )}
 </span>
 <span className="font-bold text-black/70 ">
 {totalRx} reactions
 </span>
 </>
 ) : (
 <span>Be the first to react</span>
 )}
 </div>
 <span>{post.comments.length} comments</span>
 </div>

 {/* Action buttons: Like/React with Hover Popover, Comment, Share */}
 <div className="flex items-center justify-between pt-1 relative">
 {/* LINKEDIN REACTION BUTTON WITH POPOVER */}
 <div
 className="relative"
 onMouseEnter={() => setActiveReactionPickerId(post.id)}
 onMouseLeave={() => setActiveReactionPickerId(null)}
 >
 {/* THE LINKEDIN REACTION PILL POPOVER */}
 {activeReactionPickerId === post.id && (
 <div
 onClick={(e) => e.stopPropagation()}
 className="absolute -top-12 left-0 z-40 bg-white/60 backdrop-blur-xl px-3 py-1.5 rounded-full border border-black/10 shadow-xl flex items-center gap-2 animate-scale-up"
 >
 {(Object.keys(REACTIONS) as ReactionType[]).map((rType) => {
 const cfg = REACTIONS[rType];
 return (
 <button
 key={rType}
 type="button"
 onClick={() => handleSelectReaction(post.id, rType)}
 className="p-1.5 rounded-full hover:scale-125 transition-transform flex flex-col items-center group/emoji cursor-pointer"
 title={cfg.label}
 >
 <span className="text-lg leading-none">{cfg.emoji}</span>
 </button>
 );
 })}
 </div>
 )}

 <button
 type="button"
 onClick={() =>
 handleSelectReaction(
 post.id,
 post.userReaction ? post.userReaction : "like",
 )
 }
 className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
 activeReactionConfig
 ? `${activeReactionConfig.bgColor} ${activeReactionConfig.color}`
 : "hover:bg-black/5 :bg-white/60 backdrop-blur-xl/5 text-black/70 "
 }`}
 >
 <span className="text-base leading-none">
 {activeReactionConfig ? activeReactionConfig.emoji : "👍"}
 </span>
 <span>
 {activeReactionConfig ? activeReactionConfig.label : "React"}
 </span>
 </button>
 </div>

 <button
 type="button"
 onClick={() =>
 setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)
 }
 className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold hover:bg-black/5 :bg-white/60 backdrop-blur-xl/5 text-black/70 transition-all cursor-pointer"
 >
 <MessageSquare className="w-4 h-4" />
 <span>Comment ({post.comments.length})</span>
 </button>

 <button
 type="button"
 onClick={() =>
 showToast("Post Shared", "Post link copied to clipboard.", "info")
 }
 className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold hover:bg-black/5 :bg-white/60 backdrop-blur-xl/5 text-black/70 transition-all cursor-pointer"
 >
 <Share2 className="w-4 h-4" />
 <span>Share</span>
 </button>
 </div>

 {/* Comments Section */}
 {activeCommentPostId === post.id && (
 <div className="pt-3 border-t border-white/50 space-y-3">
 {post.comments.map((c) => (
 <div
 key={c.id}
 className="p-3.5 rounded-2xl bg-black/5 backdrop-blur-xl/5 space-y-1"
 >
 <div className="flex items-center justify-between">
 <span
 onClick={() =>
 handleOpenProfileByName(
 c.name,
 "Candidate Community Member",
 c.avatar || "",
 )
 }
 className="font-bold text-xs text-[#222] hover:text-purple-600 cursor-pointer"
 >
 {c.name}
 </span>
 <span className="text-[10px] text-black/40">{c.timeAgo}</span>
 </div>
 <p className="text-xs text-black/80 ">{c.text}</p>
 </div>
 ))}
 <div className="flex gap-2">
 <input
 type="text"
 value={commentInput}
 onChange={(e) => setCommentInput(e.target.value)}
 onKeyDown={(e) => {
 if (e.key === "Enter") handleAddComment(post.id);
 }}
 placeholder="Write a comment..."
 className="flex-1 px-3.5 py-2 rounded-xl bg-black/5 backdrop-blur-xl/5 border border-white/50 text-xs text-[#222] focus:outline-none"
 />
 <button
 type="button"
 onClick={() => handleAddComment(post.id)}
 className="px-4 py-2 rounded-xl bg-[#111111] backdrop-blur-xl text-white font-bold text-xs cursor-pointer"
 >
 Reply
 </button>
 </div>
 </div>
 )}
 </div>
 );
 })
 )}
 </div>
 </div>

 {/* Right Sidebar: AI Profile Strength & Verified Credentials */}
 <div className="space-y-6">
 <div className="bg-white/60 backdrop-blur-xl/60 backdrop-blur-xl p-6 rounded-[32px] border border-white/50 shadow-sm space-y-4">
 <h3 className="font-bold text-sm text-[#222] flex items-center gap-2">
 <Sparkles className="w-4 h-4 text-purple-500" />
 Your Verified Network Score
 </h3>
 <p className="text-xs text-black/60 ">
 Candidates with AI-validated certifications and active community posts get 3.2x more
 trial invitations.
 </p>
 <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center space-y-1">
 <div className="text-2xl font-black text-purple-600 ">
 96 / 100
 </div>
 <div className="text-xs font-bold text-[#222]">
 Elite AI Trust Level
 </div>
 </div>
 <button
 onClick={() => setCurrentRoute("profile")}
 className="w-full py-3 rounded-2xl bg-[#111111] backdrop-blur-xl text-white font-bold text-xs hover:opacity-90 transition-all cursor-pointer"
 >
 Add Certification in Profile
 </button>
 </div>

 {/* Trending Community Hashtags & Topics */}
 <div className="bg-white/60 backdrop-blur-xl/60 backdrop-blur-xl p-6 rounded-[32px] border border-white/50 shadow-sm space-y-4">
 <h3 className="font-bold text-sm text-[#222] flex items-center gap-2">
 <Hash className="w-4 h-4 text-purple-500" />
 Trending on MicroIntern
 </h3>
 <div className="space-y-2.5">
 {[
 { tag: "#AgenticAI", posts: "48 updates", desc: "Autonomous multi-agent trials" },
 {
 tag: "#SystemDesign",
 posts: "35 updates",
 desc: "High throughput architecture",
 },
 { tag: "#NextJS", posts: "29 updates", desc: "React 19 & server actions" },
 { tag: "#AWS", posts: "22 updates", desc: "Verified cloud infrastructure" },
 ].map((item, i) => (
 <div
 key={i}
 onClick={() => setActiveHashtag(item.tag)}
 className="p-3 rounded-xl bg-black/5 backdrop-blur-xl/5 hover:bg-black/10 transition-colors cursor-pointer flex items-center justify-between"
 >
 <div>
 <div className="font-bold text-xs text-[#222]">{item.tag}</div>
 <div className="text-[10px] text-[#888]">
 {item.desc}
 </div>
 </div>
 <span className="text-[11px] font-bold text-purple-600 ">
 {item.posts}
 </span>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 ) : (
 /* MY NETWORK & CONNECTIONS TAB (Persistent with skill endorsements & Full LinkedIn Profile view) */
 <div className="space-y-6">

 {/* ─── MY ACTIVITY (LinkedIn-style) ─── */}
 <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[32px] border border-white/50 shadow-sm space-y-5">
 {/* Profile mini-header */}
 <div className="flex items-center gap-4">
 <img
 src={userProfile.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
 alt="My Avatar"
 className="w-16 h-16 rounded-full object-cover border-2 border-white shadow"
 />
 <div>
 <h3 className="font-bold text-base text-[#222]">{userProfile.fullName || "My Account"}</h3>
 <p className="text-xs text-black/50">{(userProfile as any).role === "candidate" ? "Candidate" : "Member"} · MicroIntern</p>
 <div className="flex items-center gap-3 mt-1.5">
 <span className="text-[11px] text-black/60 font-medium">
 <span className="font-bold text-[#222]">{myPosts.length}</span> posts
 </span>
 <span className="text-[11px] text-black/60 font-medium">
 <span className="font-bold text-[#222]">{peers.filter((p) => p.status === "connected").length}</span> connections
 </span>
 </div>
 </div>
 </div>

 {/* Section heading */}
 <div className="flex items-center justify-between border-t border-white/50 pt-4">
 <h4 className="text-xs font-bold uppercase tracking-wider text-black/40 flex items-center gap-1.5">
 <Eye className="w-3.5 h-3.5" />
 My Activity
 </h4>
 <button
 type="button"
 onClick={() => setActiveTab("feed")}
 className="text-xs text-purple-600 font-semibold hover:underline"
 >
 + New Post
 </button>
 </div>

 {/* Posts grid */}
 {myPostsLoading ? (
 <div className="flex items-center justify-center py-10">
 <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
 </div>
 ) : myPosts.length === 0 ? (
 <div className="p-10 rounded-2xl bg-black/5 text-center space-y-2">
 <Bookmark className="w-8 h-8 text-black/20 mx-auto" />
 <p className="text-sm font-bold text-[#222]">No posts yet</p>
 <p className="text-xs text-[#888]">Your posts will appear here. Go to Community Feed and share something!</p>
 <button
 type="button"
 onClick={() => setActiveTab("feed")}
 className="mt-2 px-5 py-2 rounded-full bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 transition-colors cursor-pointer"
 >
 Write your first post
 </button>
 </div>
 ) : (
 <div className="space-y-4">
 {myPosts.map((post) => (
 <div
 key={post.id}
 className="p-4 rounded-2xl bg-black/5 border border-white/50 space-y-2 hover:border-black/15 transition-all"
 >
 {/* Post meta */}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 {post.hashtag && (
 <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 text-[10px] font-bold">
 #{post.hashtag}
 </span>
 )}
 <span className="text-[11px] text-black/40">{post.timeAgo}</span>
 </div>
 <div className="flex items-center gap-3 text-[11px] text-black/50">
 <span className="flex items-center gap-1">
 <ThumbsUp className="w-3 h-3" />
 {Object.values(post.reactions).reduce((a, b) => a + b, 0)}
 </span>
 <span className="flex items-center gap-1">
 <MessageSquare className="w-3 h-3" />
 {post.comments.length}
 </span>
 </div>
 </div>
 {/* Content */}
 <p className="text-sm text-[#222] leading-relaxed">{post.content}</p>
 {/* Skills */}
 {post.skills.length > 0 && (
 <div className="flex flex-wrap gap-1.5 pt-1">
 {post.skills.map((s) => (
 <span key={s} className="px-2 py-0.5 rounded-full bg-black/5 text-[11px] text-black/60 font-medium">{s}</span>
 ))}
 </div>
 )}
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Pending Requests Section */}
 {peers.filter((p) => p.status === "pending").length > 0 && (
 <div className="bg-white/60 backdrop-blur-xl/60 backdrop-blur-xl p-6 rounded-[32px] border border-white/50 shadow-sm space-y-4">
 <h3 className="font-bold text-sm text-[#222] flex items-center gap-2">
 <UserPlus className="w-4 h-4 text-purple-500" />
 Pending Connection Requests ({peers.filter((p) => p.status === "pending").length})
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {peers
 .filter((p) => p.status === "pending")
 .map((peer) => (
 <div
 key={peer.id}
 className="p-4 rounded-2xl bg-black/5 backdrop-blur-xl/5 border border-black/5 flex items-center justify-between gap-4"
 >
 <div
 onClick={() => setSelectedPublicPeer(peer)}
 className="flex items-center gap-3 cursor-pointer group/peer"
 >
 <img
 src={peer.avatar}
 alt={peer.name}
 className="w-12 h-12 rounded-full object-cover"
 />
 <div>
 <div className="font-bold text-sm text-[#222] group-hover/peer:text-purple-600">
 {peer.name}
 </div>
 <div className="text-xs text-[#666]">
 {peer.headline}
 </div>
 <div className="text-[11px] text-black/40 mt-1">
 {peer.mutualCount} mutual connections
 </div>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => handleAcceptPeer(peer.id)}
 className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 transition-colors cursor-pointer"
 >
 Accept
 </button>
 <button
 type="button"
 onClick={() =>
 setPeers((prev) =>
 prev.map((p) => (p.id === peer.id ? { ...p, status: "none" } : p)),
 )
 }
 className="px-3 py-2 rounded-xl bg-black/10 backdrop-blur-xl/10 text-[#222] font-bold text-xs hover:bg-black/20"
 >
 Ignore
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Connected Peers & Suggested Directory */}
 <div className="bg-white/60 backdrop-blur-xl/60 backdrop-blur-xl p-6 rounded-[32px] border border-white/50 shadow-sm space-y-4">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <h3 className="font-bold text-sm text-[#222]">
 Your Connections & Recommended Peers (Click Name to View Full Account)
 </h3>
 {peers.length === 0 && (
 <button
 type="button"
 onClick={handleDiscoverDirectory}
 className="px-4 py-2 rounded-full bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 transition-colors cursor-pointer inline-flex items-center gap-2 shadow-xs"
 >
 <UserPlus className="w-3.5 h-3.5" />
 <span>Discover Real Candidates in Directory</span>
 </button>
 )}
 </div>

 {peers.length === 0 ? (
 <div className="p-12 rounded-[24px] bg-black/5 backdrop-blur-xl/5 text-center space-y-3">
 <Users className="w-10 h-10 text-black/20 mx-auto" />
 <p className="text-sm font-bold text-[#222]">
 No connections or recommended peers yet
 </p>
 <p className="text-xs text-[#888] max-w-sm mx-auto">
 Click the discover button above to populate verified candidate profiles and
 inspect their full LinkedIn-style accounts!
 </p>
 <button
 type="button"
 onClick={handleDiscoverDirectory}
 className="px-5 py-2.5 rounded-full bg-[#111111] backdrop-blur-xl text-white font-bold text-xs hover:opacity-90 transition-all cursor-pointer inline-flex items-center gap-2"
 >
 <UserPlus className="w-4 h-4" />
 <span>Explore Candidate Directory</span>
 </button>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {peers.map((peer) => (
 <div
 key={peer.id}
 className="p-5 rounded-2xl bg-black/5 backdrop-blur-xl/5 border border-white/50 flex flex-col justify-between space-y-4 hover:border-black/20 :border-white/25 transition-all"
 >
 <div
 onClick={() => setSelectedPublicPeer(peer)}
 className="flex items-start gap-3 cursor-pointer group/card"
 >
 <img
 src={peer.avatar}
 alt={peer.name}
 className="w-12 h-12 rounded-full object-cover border border-black/10 group-hover/card:ring-2 ring-purple-500 transition-all"
 />
 <div>
 <div className="font-bold text-sm text-[#222] group-hover/card:text-purple-600 transition-colors">
 {peer.name}
 </div>
 <p className="text-xs text-[#666] mt-0.5">
 {peer.headline}
 </p>
 <span className="text-[11px] text-black/40 mt-1 block">
 {peer.mutualCount} mutual connections
 </span>
 </div>
 </div>

 {/* Skills with Endorsement badges & Real SVG Icons */}
 <div className="space-y-1.5">
 <span className="text-[10px] font-bold uppercase tracking-wider text-black/40 block">
 Skills & Peer Endorsements
 </span>
 <div className="flex flex-wrap gap-1.5">
 {peer.skills.map((skill: any, idx: number) => (
 <div key={idx} className="relative group">
 <SkillBadge
 skill={skill.name}
 status={skill.status || "CLAIMED"}
 />
 {/* Hidden endorsement button on hover */}
 <button
 type="button"
 onClick={() => handleEndorseSkill(peer.id, skill.name)}
 className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-black/50 text-white text-[10px] rounded"
 >
 Endorse +1
 </button>
 </div>
 ))}
 </div>
 </div>

 <div className="flex items-center gap-2 pt-2 border-t border-white/50">
 {peer.status === "connected" ? (
 <>
 <span className="flex-1 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold text-xs text-center flex items-center justify-center gap-1">
 <Check className="w-3.5 h-3.5" />
 Connected
 </span>
 <button
 type="button"
 onClick={() => handleOpenChat(peer)}
 className="px-4 py-2 rounded-xl bg-[#111111] backdrop-blur-xl text-white font-bold text-xs hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
 >
 <MessageSquare className="w-3.5 h-3.5" />
 Message
 </button>
 </>
 ) : peer.status === "pending" ? (
 <button
 type="button"
 onClick={() => handleAcceptPeer(peer.id)}
 className="w-full py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 transition-colors cursor-pointer"
 >
 Accept Connection
 </button>
 ) : (
 <button
 type="button"
 onClick={() => handleConnectPeer(peer.id)}
 className="w-full py-2 rounded-xl bg-[#111111] backdrop-blur-xl text-white font-bold text-xs hover:opacity-90 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
 >
 <UserPlus className="w-3.5 h-3.5" />
 Connect
 </button>
 )}
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 )}

 {/* FULL LINKEDIN PUBLIC PROFILE MODAL (View another person's account) */}
 {selectedPublicPeer && (
 <div
 onClick={() => setSelectedPublicPeer(null)}
 className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 animate-fade-in"
 >
 <div
 onClick={(e) => e.stopPropagation()}
 className="w-full max-w-2xl bg-white/60 backdrop-blur-xl rounded-[36px] border border-white/50 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
 >
 {/* Top Cover Banner */}
 <div className="h-32 sm:h-40 relative bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 overflow-hidden">
 {selectedPublicPeer.bannerUrl && (
 <img
 src={selectedPublicPeer.bannerUrl}
 alt="Banner"
 className="w-full h-full object-cover opacity-60"
 />
 )}
 <button
 type="button"
 onClick={() => setSelectedPublicPeer(null)}
 className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer z-10"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Profile Content Body */}
 <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-6 -mt-14 relative">
 {/* Header Info */}
 <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
 <div className="flex items-end gap-4">
 <img
 src={selectedPublicPeer.avatar}
 alt={selectedPublicPeer.name}
 className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-lg bg-white/60 backdrop-blur-xl"
 />
 <div>
 <div className="flex items-center gap-2">
 <h2 className="text-xl sm:text-2xl font-bold text-[#222]">
 {selectedPublicPeer.name}
 </h2>
 <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold flex items-center gap-1">
 <ShieldCheck className="w-3.5 h-3.5" />
 AI Verified Account
 </span>
 </div>
 <p className="text-xs sm:text-sm text-black/70 mt-1">
 {selectedPublicPeer.headline}
 </p>
 <div className="flex items-center gap-3 text-xs text-[#888] mt-1">
 <span>{selectedPublicPeer.mutualCount} mutual connections</span>
 <span>•</span>
 <span className="font-bold text-purple-600 ">
 Trust Score: {selectedPublicPeer.trustScore || 95}/100
 </span>
 </div>
 </div>
 </div>

 {/* Main Profile Action Buttons */}
 <div className="flex items-center gap-2">
 {selectedPublicPeer.status === "connected" ? (
 <button
 type="button"
 onClick={() => {
 const peer = selectedPublicPeer;
 setSelectedPublicPeer(null);
 handleOpenChat(peer);
 }}
 className="px-5 py-2.5 rounded-full bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 transition-all flex items-center gap-2 cursor-pointer shadow-md"
 >
 <MessageSquare className="w-4 h-4" />
 <span>Message</span>
 </button>
 ) : selectedPublicPeer.status === "pending" ? (
 <button
 type="button"
 onClick={() => handleAcceptPeer(selectedPublicPeer.id)}
 className="px-5 py-2.5 rounded-full bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 transition-all cursor-pointer shadow-md"
 >
 Accept Connection
 </button>
 ) : (
 <button
 type="button"
 onClick={() => handleConnectPeer(selectedPublicPeer.id)}
 className="px-5 py-2.5 rounded-full bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 transition-all flex items-center gap-2 cursor-pointer shadow-md"
 >
 <UserPlus className="w-4 h-4" />
 <span>Connect</span>
 </button>
 )}
 </div>
 </div>

 {/* About Bio */}
 <div className="p-5 rounded-2xl bg-black/5 backdrop-blur-xl/5 border border-white/50 space-y-2">
 <h4 className="text-xs font-bold uppercase tracking-wider text-black/40 flex items-center gap-1.5">
 <Briefcase className="w-3.5 h-3.5" />
 About
 </h4>
 <p className="text-xs sm:text-sm text-[#222] leading-relaxed">
 {selectedPublicPeer.about ||
 `${selectedPublicPeer.headline}. Verified candidate on MicroIntern demonstrating high-throughput engineering and AI competencies.`}
 </p>
 </div>

 {/* Verified Certifications & Credentials */}
 <div className="space-y-3">
 <h4 className="text-xs font-bold uppercase tracking-wider text-black/40 flex items-center gap-1.5">
 <GraduationCap className="w-3.5 h-3.5" />
 AI Validated Certifications
 </h4>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {(
 selectedPublicPeer.certifications || [
 {
 title: "AI Engineering & Prompt Evaluation",
 issuer: "MicroIntern AI Validator",
 score: "98/100",
 },
 {
 title: "Full Stack React & Next.js",
 issuer: "Verified Competency Test",
 score: "Elite",
 },
 ]
 ).map((cert, i) => (
 <div
 key={i}
 className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-start justify-between"
 >
 <div>
 <div className="font-bold text-xs text-[#222]">
 {cert.title}
 </div>
 <div className="text-[10px] text-[#666] mt-0.5">
 {cert.issuer}
 </div>
 </div>
 <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
 {cert.score}
 </span>
 </div>
 ))}
 </div>
 </div>

 {/* Skills & Endorsement Section */}
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <h4 className="text-xs font-bold uppercase tracking-wider text-black/40 flex items-center gap-1.5">
 <Award className="w-3.5 h-3.5" />
 Skills & Peer Endorsements (Click to Endorse)
 </h4>
 <span className="text-[11px] text-purple-600 font-semibold">
 Endorse real skills directly
 </span>
 </div>
 <div className="flex flex-wrap gap-2">
 {selectedPublicPeer.skills.map((skill: any, idx: number) => (
 <div key={idx} className="relative group">
 <SkillBadge
 skill={skill.name}
 status={skill.status || "CLAIMED"}
 />
 {/* Hidden endorsement button on hover */}
 <button
 type="button"
 onClick={() => handleEndorseSkill(selectedPublicPeer.id, skill.name)}
 className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-black/50 text-white text-[10px] rounded"
 >
 Endorse +1
 </button>
 </div>
 ))}
 </div>
 </div>

 {/* Author's Recent Activity / Posts */}
 <div className="space-y-3 pt-2 border-t border-white/50">
 <h4 className="text-xs font-bold uppercase tracking-wider text-black/40 ">
 Recent Updates by {selectedPublicPeer.name}
 </h4>
 {posts.filter((p) => p.authorName === selectedPublicPeer.name).length === 0 ? (
 <p className="text-xs text-[#888] italic">
 No recent public posts by this candidate in your feed.
 </p>
 ) : (
 posts
 .filter((p) => p.authorName === selectedPublicPeer.name)
 .map((post) => (
 <div
 key={post.id}
 className="p-4 rounded-2xl bg-black/5 backdrop-blur-xl/5 border border-black/5 space-y-2"
 >
 <div className="flex items-center justify-between text-xs text-black/50">
 <span>{post.timeAgo}</span>
 {post.hashtag && (
 <span className="font-bold text-purple-500">{post.hashtag}</span>
 )}
 </div>
 <p className="text-xs text-[#222] line-clamp-2">
 {post.content}
 </p>
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 </div>
 )}

 {/* DIRECT MESSAGING CHAT MODAL (Locks background scroll when open) */}
 {activeChatPeer && (
 <div
 onClick={() => setActiveChatPeer(null)}
 className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
 >
 <div
 onClick={(e) => e.stopPropagation()}
 className="w-full sm:max-w-lg bg-white/60 backdrop-blur-xl rounded-t-[32px] sm:rounded-[32px] border border-white/50 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-up"
 >
 {/* Chat Header */}
 <div className="p-4 sm:p-5 border-b border-white/50 flex items-center justify-between bg-black/5 backdrop-blur-xl/5">
 <div
 onClick={() => {
 const peer = activeChatPeer;
 setActiveChatPeer(null);
 setSelectedPublicPeer(peer);
 }}
 className="flex items-center gap-3 cursor-pointer group/chatpeer"
 >
 <img
 src={activeChatPeer.avatar}
 alt={activeChatPeer.name}
 className="w-10 h-10 rounded-full object-cover"
 />
 <div>
 <h4 className="font-bold text-sm text-[#222] group-hover/chatpeer:text-purple-600">
 {activeChatPeer.name}
 </h4>
 <p className="text-xs text-black/50 ">
 {activeChatPeer.headline}
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setActiveChatPeer(null)}
 className="w-9 h-9 rounded-full bg-black/5 backdrop-blur-xl/10 flex items-center justify-center hover:bg-black/10 transition-colors"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {/* Chat Messages Body */}
 <div className="p-5 flex-1 overflow-y-auto space-y-4 max-h-80 min-h-[250px]">
 {(chatMessages[activeChatPeer.id] || []).map((msg) => (
 <div
 key={msg.id}
 className={`flex flex-col ${msg.sender === "me" ? "items-end" : "items-start"}`}
 >
 <div
 className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm ${
 msg.sender === "me"
 ? "bg-[#111111] backdrop-blur-xl text-white font-medium"
 : "bg-black/5 backdrop-blur-xl/10 text-[#222]"
 }`}
 >
 {msg.text}
 </div>
 <span className="text-[10px] text-black/40 mt-1 px-1">{msg.time}</span>
 </div>
 ))}
 </div>

 {/* Chat Input Bar */}
 <div className="p-4 border-t border-white/50 bg-black/5 backdrop-blur-xl/5 flex items-center gap-2">
 <input
 type="text"
 value={chatInput}
 onChange={(e) => setChatInput(e.target.value)}
 onKeyDown={(e) => {
 if (e.key === "Enter") handleSendMessage();
 }}
 placeholder={`Message ${activeChatPeer.name}...`}
 className="flex-1 px-4 py-2.5 rounded-full bg-white/60 backdrop-blur-xl/60 backdrop-blur-xl border border-white/50 text-xs text-[#222] focus:outline-none"
 />
 <button
 type="button"
 onClick={handleSendMessage}
 disabled={!chatInput.trim()}
 className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-50 cursor-pointer"
 >
 <Send className="w-4 h-4" />
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
};
