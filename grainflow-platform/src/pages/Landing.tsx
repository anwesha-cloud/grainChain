import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Login } from "@/components/auth/Login";
import { SignUp } from "@/components/auth/SignUp";
import backgroundImage from "@/assets/background.jpg";

const Landing = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  const handleBack = () => {
    setShowLogin(false);
    setShowSignUp(false);
  };

  if (showLogin) {
    return <Login onBack={handleBack} />;
  }

  if (showSignUp) {
    return <SignUp onBack={handleBack} />;
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url(${backgroundImage})`, // ✅ fixed
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/60" />

      {/* Heading and caption */}
      <div className="relative z-10 text-center mb-12">
        <h1
          style={{
            fontFamily: "'Inknut Antiqua', serif",
            letterSpacing: "0.1em",
            fontSize: "90px",
            fontWeight: 800,
            color: "#ffffff",
          }}
        >
          GrainChain
        </h1>
        <p
          className="mt-2"
          style={{
            fontFamily: "'Inria Sans', sans-serif",
            letterSpacing: "2px",
            fontSize: "22px",
            color: "#e5e5e5",
          }}
        >
          Connecting Surplus to Need: From Restaurants to Communities
        </p>
      </div>

      {/* Login/Signup Card */}
      <Card className="w-full max-w-md relative z-10 bg-card/80 backdrop-blur-sm border-border/50 -mt-6">
        <CardContent className="space-y-4 py-8">
          <p className="text-center text-muted-foreground">
            Join our community to reduce food waste and fight hunger.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => setShowSignUp(true)}
              className="w-full"
              size="lg"
            >
              Sign Up
            </Button>
            <Button
              onClick={() => setShowLogin(true)}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Landing;
