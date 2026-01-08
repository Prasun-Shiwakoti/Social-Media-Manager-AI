import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import axios from 'axios';

export default function BusinessSetup() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({});
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Placeholder for API call
        console.log("Submitting Business Data:", formData);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            // navigate("/dashboard"); // or wherever the user should go next
        }, 1000);

        /* 
        // Example axios call
        axios.post('/api/business/setup/', { ...formData }).then(function (res) {
            console.log(res.data);
            setIsLoading(false);
            navigate("/dashboard");
        }).catch(function (err) {
            console.log(err);
            setIsLoading(false);
        });
        */
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Business Setup</CardTitle>
                    <CardDescription className="text-center">
                        Enter your business details and Meta access token
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="businessName">Business Name</Label>
                            <Input id="businessName" placeholder="My Awesome Business" required onChange={handleFormChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" placeholder="Describe your business..." required onChange={handleFormChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="metaAccessToken">Meta Access Token</Label>
                            <Input id="metaAccessToken" type="password" placeholder="EAA..." required onChange={handleFormChange} />
                            <p className="text-xs text-muted-foreground">
                                Your Meta Graph API access token.
                            </p>
                        </div>
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Business Details
                        </Button>
                    </form>
                </CardContent>
                {/* 
                <CardFooter className="flex flex-col space-y-2">
                    <div className="text-sm text-center text-muted-foreground">
                        <Link to="/dashboard" className="text-primary hover:underline">
                            Skip for now
                        </Link>
                    </div>
                </CardFooter>
                */}
            </Card>
        </div>
    );
}
