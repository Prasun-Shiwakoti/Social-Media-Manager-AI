import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import axios from 'axios';
import { useDispatch } from "react-redux";
import * as auth from "../../redux/authSlice";
import { loginSuccess } from "../../redux/authSlice.js";

export default function Signup() {
    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({});
    const navigate = useNavigate();

    const handleSignup = (e) => {
        e.preventDefault();
        setIsLoading(true);

        axios.post('/api/account/register/', { ...formData }).then(function (res) {
            console.log(res.data.refresh_token);
            setIsLoading(true);
            //Save refresh token
            localStorage.setItem('refresh_token', res.data.refresh_token);

            //Set User
            dispatch(
                loginSuccess({
                    token: res.data.access_token,
                })
            )

            navigate("/business-setup");
        }).catch(function (err) {
            console.log(err);
            setIsLoading(false);
        });
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        console.log(formData);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email below to create your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">First name</Label>
                                <Input id="first_name" placeholder="John" required onChange={handleFormChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name">Last name</Label>
                                <Input id="last_name" placeholder="Doe" required onChange={handleFormChange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" placeholder="Your Username" required onChange={handleFormChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="m@example.com" required onChange={handleFormChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" required onChange={handleFormChange} />
                        </div>
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Account
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                    <div className="text-sm text-center text-muted-foreground">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary hover:underline">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
