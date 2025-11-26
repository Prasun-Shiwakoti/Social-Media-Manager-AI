import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, ThumbsUp, AlertCircle } from "lucide-react";

const comments = [
    {
        id: 1,
        user: "Sarah M.",
        avatar: "https://i.pravatar.cc/150?u=1",
        text: "Love this new design! The colors are amazing. 😍",
        sentiment: "positive",
        post: "Summer Collection Launch",
        time: "2h ago",
    },
    {
        id: 2,
        user: "John D.",
        avatar: "https://i.pravatar.cc/150?u=2",
        text: "When will this be available in stores?",
        sentiment: "neutral",
        post: "Product Teaser",
        time: "4h ago",
    },
    {
        id: 3,
        user: "Alex K.",
        avatar: "https://i.pravatar.cc/150?u=3",
        text: "Shipping is taking too long. Not happy.",
        sentiment: "negative",
        post: "Order Update",
        time: "1d ago",
    },
];

export default function Comments() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Comments & Sentiment</h2>
                <p className="text-muted-foreground">Monitor and reply to user feedback.</p>
            </div>

            <div className="grid gap-4">
                {comments.map((comment) => (
                    <Card key={comment.id}>
                        <CardContent className="p-6">
                            <div className="flex gap-4">
                                <Avatar>
                                    <AvatarImage src={comment.avatar} />
                                    <AvatarFallback>{comment.user[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{comment.user}</span>
                                            <span className="text-muted-foreground text-sm">• {comment.time}</span>
                                        </div>
                                        <Badge variant={
                                            comment.sentiment === "positive" ? "success" :
                                                comment.sentiment === "negative" ? "destructive" : "secondary"
                                        }>
                                            {comment.sentiment}
                                        </Badge>
                                    </div>
                                    <p className="text-sm">{comment.text}</p>
                                    <div className="flex items-center gap-4 pt-2">
                                        <p className="text-xs text-muted-foreground">On post: <span className="font-medium text-foreground">{comment.post}</span></p>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" className="h-8">Reply</Button>
                                            <Button variant="ghost" size="sm" className="h-8">Like</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
