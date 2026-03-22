import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, ChevronDown, ChevronUp, Loader2, AlertCircle, RefreshCw } from "lucide-react";

const sentimentColor = (result) => {
    if (!result || !result.sentiment) return "secondary";
    if (result.sentiment === "Positive") return "success";
    if (result.sentiment === "Negative") return "destructive";
    return "secondary";
};
const sentimentLabel = (result) => {
    if (!result || !result.sentiment) return "—";
    return result.sentiment;
};

export default function Comments() {
    const token = useSelector((state) => state.auth.token);
    const [posts, setPosts] = useState([]);
    const [expandedPost, setExpandedPost] = useState(null);
    const [commentsMap, setCommentsMap] = useState({});
    const [sentimentMap, setSentimentMap] = useState({});
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [loadingComments, setLoadingComments] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!token) return;
        fetchPosts();
    }, [token]);

    const fetchPosts = async () => {
        setLoadingPosts(true);
        setError(null);
        try {
            const res = await axios.get('/api/dashboard/instagram/posts/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPosts(res.data.posts || []);
        } catch (err) {
            setError("Could not load posts. Check your Instagram token.");
        } finally {
            setLoadingPosts(false);
        }
    };

    const togglePost = async (postId) => {
        if (expandedPost === postId) {
            setExpandedPost(null);
            return;
        }
        setExpandedPost(postId);

        if (commentsMap[postId]) return; // Already fetched

        setLoadingComments(true);
        try {
            const res = await axios.get(`/api/dashboard/instagram/post/${postId}/comments/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const fetchedComments = res.data.comments || [];
            setCommentsMap((prev) => ({ ...prev, [postId]: fetchedComments }));

            // Get sentiment for each comment
            const sentiments = {};
            await Promise.all(fetchedComments.map(async (c) => {
                try {
                    const s = await axios.post('/api/dashboard/sentiment_analysis/', { text: c.text }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    sentiments[c.id] = s.data.sentiment_score;
                } catch {
                    sentiments[c.id] = null;
                }
            }));
            setSentimentMap((prev) => ({ ...prev, [postId]: sentiments }));
        } catch (err) {
            setCommentsMap((prev) => ({ ...prev, [postId]: [] }));
        } finally {
            setLoadingComments(false);
        }
    };

    const filteredPosts = posts.filter((p) =>
        !search || (p.caption || "").toLowerCase().includes(search.toLowerCase())
    );

    if (loadingPosts) return (
        <div className="flex items-center justify-center h-64 gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading posts...</span>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-destructive">
            <AlertCircle className="h-8 w-8" />
            <p className="text-center">{error}</p>
            <Button variant="outline" onClick={fetchPosts}><RefreshCw className="mr-2 h-4 w-4" />Retry</Button>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Comments & Sentiment</h2>
                    <p className="text-muted-foreground">Monitor and analyse feedback on your Instagram posts.</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchPosts}>
                    <RefreshCw className="mr-2 h-4 w-4" />Refresh
                </Button>
            </div>

            <Input
                placeholder="Search posts by caption..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
            />

            {filteredPosts.length === 0 && (
                <p className="text-muted-foreground text-center py-12">No posts found.</p>
            )}

            <div className="space-y-4">
                {filteredPosts.map((post) => {
                    const isOpen = expandedPost === post.id;
                    const comments = commentsMap[post.id];
                    const sentiments = sentimentMap[post.id] || {};

                    return (
                        <Card key={post.id} className="overflow-hidden">
                            {/* Post Header */}
                            <button
                                className="w-full text-left"
                                onClick={() => togglePost(post.id)}
                            >
                                <CardHeader className="hover:bg-muted/40 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                                            <img
                                                src={post.media_url || post.thumbnail_url}
                                                alt="post"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium line-clamp-2 text-sm">{post.caption || "No caption"}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{new Date(post.timestamp).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Badge variant="outline" className="gap-1">
                                                <MessageSquare className="h-3 w-3" />
                                                {comments ? comments.length : "?"}
                                            </Badge>
                                            {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                                        </div>
                                    </div>
                                </CardHeader>
                            </button>

                            {/* Comments list */}
                            {isOpen && (
                                <CardContent className="pt-0 border-t border-border/50">
                                    {loadingComments && !comments ? (
                                        <div className="flex items-center gap-2 text-muted-foreground py-6 justify-center">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Loading comments...</span>
                                        </div>
                                    ) : !comments || comments.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-6 text-sm">No comments on this post yet.</p>
                                    ) : (
                                        <div className="divide-y divide-border/50">
                                            {comments.map((comment) => {
                                                const score = sentiments[comment.id];
                                                return (
                                                    <div key={comment.id} className="flex items-start gap-3 py-4">
                                                        <Avatar className="h-8 w-8 shrink-0">
                                                            <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                                                                {(comment.username || "?")[0].toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-semibold text-sm">@{comment.username}</span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {new Date(comment.timestamp).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                                <Badge variant={sentimentColor(score)} className="text-xs">
                                                                    {sentimentLabel(score)}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm mt-1">{comment.text}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
