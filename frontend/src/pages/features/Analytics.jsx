import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { Users, Heart, MessageCircle, Share2, Eye, Bookmark, Loader2, AlertCircle, Image as ImageIcon } from "lucide-react";

const StatCard = ({ icon: Icon, label, value, color, description }) => (
    <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm group">
        <CardContent className="p-0">
            <div className="p-5 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${color} shadow-lg shadow-${color.split('-')[1]}-500/20`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1">{label}</p>
                    <div className="flex items-baseline gap-1">
                        <p className="text-2xl font-bold tracking-tight">{value ?? "0"}</p>
                    </div>
                </div>
            </div>
            {description && (
                <div className="px-5 py-2 bg-muted/30 border-t border-muted/20 text-[10px] text-muted-foreground">
                    {description}
                </div>
            )}
        </CardContent>
    </Card>
);

export default function Analytics() {
    const token = useSelector((state) => state.auth.token);
    const [insights, setInsights] = useState(null);
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!token) return;
        const fetchAll = async () => {
            setLoading(true);
            setError(null);
            try {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const since = thirtyDaysAgo.toISOString().split('T')[0];
                const until = new Date().toISOString().split('T')[0];

                const [insightRes, postsRes, profileRes] = await Promise.all([
                    axios.get(`/api/dashboard/instagram/insights/?since=${since}&until=${until}`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('/api/dashboard/instagram/posts/', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('/api/dashboard/instagram/profile/', { headers: { Authorization: `Bearer ${token}` } }),
                ]);

                // Parse insights into a usable dict
                const rawInsights = insightRes.data.insights || [];
                const parsed = {};
                rawInsights.forEach((item) => {
                    const key = Object.keys(item)[0];
                    const metricData = item[key];
                    let vals = [];
                    if (Array.isArray(metricData?.values) && metricData.values.length > 0) {
                        // Time-series shape: { values: [{value, end_time}, ...] }
                        vals = metricData.values;
                    } else if (metricData?.total_value !== undefined) {
                        // Engagement total_value shape: { total_value: { value: N } }
                        // Wrap as a single-item array with a numeric value
                        const tv = metricData.total_value;
                        const numVal = typeof tv === 'object' ? (tv?.value ?? 0) : (tv ?? 0);
                        vals = [{ value: numVal }];
                    }
                    parsed[key] = vals;
                });
                setInsights(parsed);
                setPosts(postsRes.data.posts || []);

                // Profile has real-time counts
                setProfile(profileRes.data.profile || null);

            } catch (err) {
                console.error(err);
                setError("Could not load analytics data. Make sure your Instagram token is valid.");
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [token]);

    // Build daily chart data from insight values (follower_count, reach, etc.)
    const buildChartData = (key) => {
        const vals = insights?.[key] || [];
        if (vals.length === 0 && key === 'follower_count' && profile?.followers_count !== undefined) {
            return [{ name: "Current", value: profile.followers_count }];
        }
        return vals.map((v) => ({
            name: v.end_time ? new Date(v.end_time).toLocaleDateString('en-US', { weekday: 'short' }) : "—",
            value: v.value ?? 0,
        }));
    };

    const latestVal = (key) => {
        const arr = insights?.[key];
        if (!arr || arr.length === 0) return null;
        return arr[arr.length - 1]?.value ?? null;
    };

    // Build engagement chart: merge likes, comments, shares by date
    const engagementData = (() => {
        const metricKeys = ['likes', 'comments', 'shares'];
        const dateMap = {};

        // 1. Try to use user-level insights (if and only if they have time-series dates)
        let hasInsightHistorical = false;
        metricKeys.forEach((key) => {
            (insights?.[key] || []).forEach((v) => {
                if (!v.end_time) return;
                const dateObj = new Date(v.end_time);
                const label = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                if (!dateMap[label]) dateMap[label] = { name: label, likes: 0, comments: 0, shares: 0, timestamp: dateObj };
                dateMap[label][key] = v.value ?? 0;
                hasInsightHistorical = true;
            });
        });

        // 2. Fallback: Aggregate from individual posts if insights are blank or not time-series
        if (!hasInsightHistorical && posts.length > 0) {
            posts.forEach(post => {
                const dateObj = new Date(post.timestamp);
                const label = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                if (!dateMap[label]) dateMap[label] = { name: label, likes: 0, comments: 0, shares: 0, timestamp: dateObj };
                dateMap[label].likes += (post.like_count ?? 0);
                dateMap[label].comments += (post.comments_count ?? 0);
            });
        }

        // Sort by timestamp and take last 7 days
        return Object.values(dateMap)
            .sort((a, b) => a.timestamp - b.timestamp)
            .slice(-7);
    })();

    // Build reach+profile_views chart with merged dates
    const reachData = (() => {
        const dateMap = {};
        (insights?.reach || []).forEach((v) => {
            const label = v.end_time ? new Date(v.end_time).toLocaleDateString('en-US', { weekday: 'short' }) : 'Unknown';
            if (!dateMap[label]) dateMap[label] = { name: label, reach: 0, profile_views: 0 };
            dateMap[label].reach = v.value ?? 0;
        });
        (insights?.profile_views || []).forEach((v) => {
            const label = v.end_time ? new Date(v.end_time).toLocaleDateString('en-US', { weekday: 'short' }) : 'Unknown';
            if (!dateMap[label]) dateMap[label] = { name: label, reach: 0, profile_views: 0 };
            dateMap[label].profile_views = v.value ?? 0;
        });
        return Object.values(dateMap).slice(-7);
    })();

    if (loading) return (
        <div className="flex items-center justify-center h-64 gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading analytics...</span>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-destructive">
            <AlertCircle className="h-8 w-8" />
            <p className="text-center max-w-md">{error}</p>
        </div>
    );

    const sumVal = (key) => {
        const arr = insights?.[key];
        if (!arr || arr.length === 0) return null;
        return arr.reduce((sum, v) => sum + (v.value ?? 0), 0);
    };

    // Use real-time profile counts for stat cards (most accurate)
    const statFollowers = profile?.followers_count ?? latestVal("follower_count") ?? 0;
    const statMediaCount = profile?.media_count ?? 0;

    // Aggregation from posts for more accurate engagement
    const totalLikesFromPosts = posts.reduce((sum, post) => sum + (post.like_count ?? 0), 0);
    const totalCommentsFromPosts = posts.reduce((sum, post) => sum + (post.comments_count ?? 0), 0);

    const statReach = sumVal("reach") ?? 0;
    const statLikes = sumVal("likes") ?? totalLikesFromPosts;
    const statComments = sumVal("comments") ?? totalCommentsFromPosts;
    const statShares = sumVal("shares") ?? 0;
    const statSaves = sumVal("saves") ?? 0;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
                <p className="text-muted-foreground">Real-time insights from your connected Instagram Business Account.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <StatCard icon={Users} label="Followers" value={statFollowers} color="bg-gradient-to-br from-blue-500 to-blue-600" description="Total audience size" />
                <StatCard icon={ImageIcon} label="Posts" value={statMediaCount} color="bg-gradient-to-br from-violet-500 to-violet-600" description="Content items" />
                <StatCard icon={Eye} label="Reach" value={statReach} color="bg-gradient-to-br from-indigo-500 to-indigo-600" description="Unique accounts reached" />
                <StatCard icon={Heart} label="Likes" value={statLikes} color="bg-gradient-to-br from-rose-500 to-rose-600" description="From recent posts" />
                <StatCard icon={MessageCircle} label="Comments" value={statComments} color="bg-gradient-to-br from-amber-500 to-amber-600" description="Engagements" />
                <StatCard icon={Bookmark} label="Saves" value={statSaves} color="bg-gradient-to-br from-teal-500 to-teal-600" description="Saved content" />
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="posts">Post Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">                        {/* Reach */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Reach & Profile Views</CardTitle>
                                <CardDescription>How many unique accounts your content reached each day.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[240px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={reachData}>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                            <XAxis dataKey="name" className="text-xs" />
                                            <YAxis className="text-xs" />
                                            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }} />
                                            <Legend />
                                            <Line type="monotone" dataKey="reach" name="Reach" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                                            <Line type="monotone" dataKey="profile_views" name="Profile Views" stroke="#06b6d4" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Follower Growth */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Follower Growth</CardTitle>
                                <CardDescription>Daily follower count over the last 7 days.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[280px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={buildChartData("follower_count")}>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                            <XAxis dataKey="name" className="text-xs" />
                                            <YAxis className="text-xs" />
                                            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }} />
                                            <Line type="monotone" dataKey="value" name="Followers" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Engagement */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Engagement</CardTitle>
                                <CardDescription>Likes, comments, and shares per day.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[280px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={engagementData}>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                            <XAxis dataKey="name" className="text-xs" />
                                            <YAxis className="text-xs" />
                                            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }} />
                                            <Legend />
                                            <Bar dataKey="likes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="comments" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="shares" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </TabsContent>

                <TabsContent value="posts">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Posts</CardTitle>
                            <CardDescription>Your last published Instagram posts with basic details.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {posts.length === 0 ? (
                                <p className="text-muted-foreground text-center py-10">No posts found.</p>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {posts.slice(0, 9).map((post) => (
                                        <a key={post.id} href={post.permalink} target="_blank" rel="noopener noreferrer" className="group block rounded-xl overflow-hidden border bg-card hover:border-primary transition-colors">
                                            <div className="aspect-square bg-muted overflow-hidden">
                                                <img
                                                    src={post.media_url || post.thumbnail_url}
                                                    alt={post.caption || "Post"}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                            <div className="p-3">
                                                <p className="text-xs text-muted-foreground">{new Date(post.timestamp).toLocaleDateString()}</p>
                                                <p className="text-sm mt-1 line-clamp-2">{post.caption || "No caption"}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
