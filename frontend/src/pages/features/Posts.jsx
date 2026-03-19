import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Image as ImageIcon, MessageCircle, Heart, Calendar } from "lucide-react";

export default function Posts() {
    const token = useSelector((state) => state.auth.token);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/dashboard/instagram/posts/', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                
                if (response.data.posts && Array.isArray(response.data.posts)) {
                    setPosts(response.data.posts);
                } else {
                    setPosts([]);
                }
            } catch (err) {
                console.error("Error fetching posts:", err);
                setError("Failed to load posts.");
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchPosts();
        }
    }, [token]);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Posts</h2>
                <p className="text-muted-foreground">Manage and analyze your recent content across platforms.</p>
            </div>

            {error && (
                <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm font-medium">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <Card key={i} className="overflow-hidden">
                            <div className="h-48 w-full rounded-none animate-pulse bg-muted" />
                            <CardContent className="p-4 space-y-3">
                                <div className="h-4 w-full animate-pulse bg-muted rounded" />
                                <div className="h-4 w-2/3 animate-pulse bg-muted rounded" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : posts.length === 0 && !error ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-foreground">No posts found</h3>
                    <p className="text-sm text-muted-foreground mt-1">Connect your accounts to see your content here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {posts.map((post) => (
                        <Link key={post.id} to={`/posts/${post.id}`} className="group block focus:outline-none focus:ring-2 focus:ring-ring rounded-xl">
                            <Card className="overflow-hidden h-full hover:shadow-lg transition-all duration-300 border-border/50 group-hover:border-primary/30 flex flex-col cursor-pointer bg-card/50 backdrop-blur-sm">
                                <div className="relative aspect-square overflow-hidden bg-muted">
                                    {post.media_url ? (
                                        <img 
                                            src={post.media_url} 
                                            alt={post.caption || "Post visual"} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                        <span className="text-white text-sm font-medium flex items-center gap-1.5 shadow-sm">
                                            View Details
                                        </span>
                                    </div>
                                </div>
                                
                                <CardContent className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>
                                            {post.timestamp ? new Date(post.timestamp).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            }) : "Unknown Date"}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-foreground/90 line-clamp-2 leading-relaxed flex-1">
                                        {post.caption || "No caption provided"}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
