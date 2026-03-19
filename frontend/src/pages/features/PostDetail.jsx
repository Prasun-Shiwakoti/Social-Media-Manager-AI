import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { ArrowLeft, MessageCircle, Heart, Calendar, BarChart3, TrendingUp, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function PostDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = useSelector((state) => state.auth.token);

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Sentiment Analysis State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [sentimentResults, setSentimentResults] = useState(null);

    useEffect(() => {
        const fetchPostData = async () => {
            if (!token || !id) return;
            try {
                setLoading(true);
                setError("");
                
                // Fetch Post Details
                const postRes = await axios.get(`/api/dashboard/instagram/post/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (postRes.data.post_details) {
                    setPost(postRes.data.post_details);
                } else {
                    setPost(postRes.data); // Fallback depending on returned structure
                }

                // Fetch Comments
                try {
                    const commentsRes = await axios.get(`/api/dashboard/instagram/post/${id}/comments/`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (commentsRes.data.comments && commentsRes.data.comments.data) {
                        setComments(commentsRes.data.comments.data);
                    } else if (Array.isArray(commentsRes.data.comments)) {
                        setComments(commentsRes.data.comments);
                    }
                } catch (commentErr) {
                    console.error("Error fetching comments:", commentErr);
                    // Non-blocking error if comments fail
                }

            } catch (err) {
                console.error("Error fetching post details:", err);
                setError("Failed to load post details. It might not exist or you don't have permission.");
            } finally {
                setLoading(false);
            }
        };

        fetchPostData();
    }, [id, token]);

    const handleAnalyzeSentiment = async () => {
        if (!comments || comments.length === 0) return;
        
        setIsAnalyzing(true);
        setSentimentResults(null);

        try {
            // Take up to 20 comments for analysis to avoid overloading API in MVP
            const commentsToAnalyze = comments.slice(0, 20);
            const results = {
                POSITIVE: 0,
                NEUTRAL: 0,
                NEGATIVE: 0,
                total: commentsToAnalyze.length
            };

            // Call API for each comment
            const promises = commentsToAnalyze.map(async (comment) => {
                if (!comment.text) return;
                try {
                    const res = await axios.post('/api/dashboard/sentiment_analysis/', 
                        { text: comment.text },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    
                    const score = res.data.sentiment_score?.sentiment;
                    if (score) {
                        const upperScore = score.toUpperCase();
                        if (results[upperScore] !== undefined) {
                            results[upperScore]++;
                        }
                    }
                } catch (err) {
                    console.error("Failed to analyze sentiment for comment:", err);
                }
            });

            await Promise.all(promises);
            setSentimentResults(results);

        } catch (err) {
            console.error("Sentiment analysis error:", err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full animate-pulse bg-muted" />
                    <div className="space-y-2">
                        <div className="h-6 w-48 rounded animate-pulse bg-muted" />
                        <div className="h-4 w-32 rounded animate-pulse bg-muted" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="h-[400px] w-full rounded-xl animate-pulse bg-muted" />
                        <div className="h-[200px] w-full rounded-xl animate-pulse bg-muted" />
                    </div>
                    <div className="h-[300px] w-full rounded-xl animate-pulse bg-muted" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="p-6 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
                    <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                    <h3 className="text-lg font-medium text-destructive">Error Loading Post</h3>
                    <p className="text-sm text-destructive/80 mt-1">{error}</p>
                </div>
            </div>
        );
    }

    const mediaUrl = post?.media_url || post?.media?.image_url;
    const caption = post?.caption || "No caption provided";
    const timestamp = post?.timestamp || post?.created_at;
    const dateFormatted = timestamp ? new Date(timestamp).toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : "Date unknown";

    // Fallback if no comments text is found to analyze
    const analyzeDisabled = isAnalyzing || comments.length === 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-full shadow-sm hover:bg-accent">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Post Insights</h2>
                        <p className="text-sm text-muted-foreground">Comprehensive analytics and audience sentiment.</p>
                    </div>
                </div>
                <Button onClick={() => window.open(post?.permalink, '_blank')} variant="secondary" className="gap-2">
                    <BarChart3 className="h-4 w-4" /> View on Instagram
                </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Post Details & Comments */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Post Hero Card */}
                    <Card className="overflow-hidden border-border/50 shadow-sm">
                        <div className="md:flex">
                            <div className="md:w-1/2 bg-muted relative aspect-square md:aspect-auto">
                                {mediaUrl ? (
                                    <img 
                                        src={mediaUrl} 
                                        alt={caption} 
                                        className="w-full h-full object-cover absolute inset-0"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center absolute inset-0">
                                        <span className="text-muted-foreground/50">No Image</span>
                                    </div>
                                )}
                            </div>
                            <div className="md:w-1/2 p-6 flex flex-col justify-between bg-card text-card-foreground">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                            Instagram Post
                                        </Badge>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                                            <Calendar className="h-3 w-3" />
                                            {dateFormatted}
                                        </div>
                                    </div>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap mt-2 font-medium">
                                        {caption}
                                    </p>
                                </div>
                                <div className="mt-6 pt-6 border-t border-border flex justify-between items-center text-sm font-medium">
                                    <div className="flex gap-4 text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <Heart className="h-4 w-4 text-rose-500" />
                                            <span>{post?.like_count || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <MessageCircle className="h-4 w-4 text-blue-500" />
                                            <span>{post?.comments_count || comments.length || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Comments Section */}
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <MessageCircle className="h-5 w-5 text-primary" />
                                Audience Comments
                            </CardTitle>
                            <CardDescription>
                                Recent conversations happening on this post.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {comments.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed text-sm">
                                    No comments found for this post yet.
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {comments.map((comment, idx) => (
                                        <div key={comment.id || idx} className="flex gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                                            <Avatar className="h-9 w-9 border border-border">
                                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                    {(comment.username || "U")[0].toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold">{comment.username || "User"}</span>
                                                    {comment.timestamp && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(comment.timestamp).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-foreground/90">{comment.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Sentiment Analysis */}
                <div className="lg:col-span-1">
                    <Card className="border-border/50 shadow-sm sticky top-6 bg-gradient-to-b from-card to-card/50 overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -z-10 -mt-16 -mr-16"></div>
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2 text-primary">
                                <Sparkles className="h-5 w-5" />
                                Sentiment AI
                            </CardTitle>
                            <CardDescription>
                                Uncover the true sentiment of your audience's comments using our advanced AI.
                            </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="space-y-6">
                            {!sentimentResults ? (
                                <div className="text-center space-y-4 py-4">
                                    <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <TrendingUp className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Analyze all {comments.length} comments to see how your audience is reacting to this post.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="text-center">
                                        <h4 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                                            {sentimentResults.total > 0 
                                                ? Math.round((sentimentResults.POSITIVE / sentimentResults.total) * 100) 
                                                : 0}%
                                        </h4>
                                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mt-1">Positive Sentiment</p>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {/* Positive */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="flex items-center gap-2 font-medium text-emerald-600 dark:text-emerald-400">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                    Positive
                                                </span>
                                                <span className="font-semibold">{sentimentResults.POSITIVE}</span>
                                            </div>
                                            <div className="w-full h-2 overflow-hidden rounded-full bg-secondary">
                                                <div className="h-full bg-emerald-500" style={{ width: `${(sentimentResults.POSITIVE / sentimentResults.total) * 100 || 0}%` }} />
                                            </div>
                                        </div>
                                        
                                        {/* Neutral */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="flex items-center gap-2 font-medium text-blue-600 dark:text-blue-400">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                    Neutral
                                                </span>
                                                <span className="font-semibold">{sentimentResults.NEUTRAL}</span>
                                            </div>
                                            <div className="w-full h-2 overflow-hidden rounded-full bg-secondary">
                                                <div className="h-full bg-blue-500" style={{ width: `${(sentimentResults.NEUTRAL / sentimentResults.total) * 100 || 0}%` }} />
                                            </div>
                                        </div>
                                        
                                        {/* Negative */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="flex items-center gap-2 font-medium text-rose-600 dark:text-rose-400">
                                                    <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                                    Negative
                                                </span>
                                                <span className="font-semibold">{sentimentResults.NEGATIVE}</span>
                                            </div>
                                            <div className="w-full h-2 overflow-hidden rounded-full bg-secondary">
                                                <div className="h-full bg-rose-500" style={{ width: `${(sentimentResults.NEGATIVE / sentimentResults.total) * 100 || 0}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-3 bg-muted/50 rounded-lg border text-xs text-center text-muted-foreground">
                                        Based on {sentimentResults.total} recent comments analyzed.
                                    </div>
                                </div>
                            )}

                            <Button 
                                className="w-full shadow-md" 
                                size="lg"
                                disabled={analyzeDisabled}
                                onClick={handleAnalyzeSentiment}
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                                        Analyzing Sentiment...
                                    </>
                                ) : sentimentResults ? (
                                    "Re-Analyze Comments"
                                ) : (
                                    "Analyze Comments Sentiment"
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
