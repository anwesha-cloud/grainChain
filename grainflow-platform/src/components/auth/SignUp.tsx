import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import backgroundImage from "@/assets/background.jpg";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";

interface SignUpProps {
  onBack: () => void;
}

// helper component for picking location
function LocationPicker({
  setLatLng,
}: {
  setLatLng: (coords: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(e) {
      setLatLng({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export const SignUp = ({ onBack }: SignUpProps) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [isDonor, setIsDonor] = useState(true);
  const [error, setError] = useState("");
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [latLng, setLatLng] = useState<{ lat: number; lng: number } | null>(
    null
  );

  const navigate = useNavigate();

  const validatePassword = (pw: string) => {
    const rules = [
      { id: "length", label: "At least 8 characters", test: pw.length >= 8 },
      {
        id: "upper",
        label: "One uppercase letter (A-Z)",
        test: /[A-Z]/.test(pw),
      },
      {
        id: "lower",
        label: "One lowercase letter (a-z)",
        test: /[a-z]/.test(pw),
      },
      { id: "number", label: "One number (0-9)", test: /[0-9]/.test(pw) },
      {
        id: "special",
        label: "One special character (e.g. !@#$%)",
        test: /[^A-Za-z0-9]/.test(pw),
      },
    ];

    const passed = rules.filter((r) => r.test).length;
    const failed = rules.filter((r) => !r.test).map((r) => r.label);
    return { rules, passed, failed, valid: failed.length === 0 };
  };

  const passwordValidation = useMemo(
    () => validatePassword(password),
    [password]
  );
  const strengthPercent = Math.round(
    (passwordValidation.passed / passwordValidation.rules.length) * 100
  );

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError("");
    setError("");

    if (!passwordValidation.valid) {
      setError(`Password requirements not met.`);
      return;
    }

    if (!latLng) {
      setError("Please pick your location on the map.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          address,
          role: isDonor ? "donor" : "ngo",
          lat: latLng.lat,
          lng: latLng.lng,
        }),
      });

      let data: any;
      try {
        data = await res.json();
      } catch (jsonErr) {
        data = { error: undefined };
      }

      if (!res.ok) {
        setServerError(data?.error || `Signup failed (status ${res.status})`);
        setSubmitting(false);
        return;
      }

      localStorage.setItem("fullName", fullName);

      navigate("/login");
    } catch (err: any) {
      setServerError(err?.message || "Network error");
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-background/60" />

      <Card className="w-full max-w-md relative z-10 bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-2xl">Sign Up</CardTitle>
              <CardDescription>Join the GrainChain community</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSignUp}
            className="space-y-4"
            aria-describedby="form-error"
          >
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters, a mix of letters, numbers & symbols"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                aria-invalid={!passwordValidation.valid}
              />

              <div className="mt-2">
                <div className="w-full h-2 rounded bg-slate-200 overflow-hidden">
                  <div
                    className="h-2 rounded bg-green-500"
                    style={{
                      width: `${strengthPercent}%`,
                      transition: "width 160ms ease",
                    }}
                    aria-hidden
                  />
                </div>
                <p className="text-xs mt-1">Strength: {strengthPercent}%</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                type="text"
                placeholder="123 Main Street, City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                autoComplete="street-address"
              />
            </div>

            {/* Map location picker */}
            <div className="space-y-2">
              <Label>Pick Your Location</Label>
              <div style={{ height: "250px", width: "100%" }}>
                <MapContainer
                  center={[28.7041, 77.1025]}
                  zoom={12}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {latLng && <Marker position={[latLng.lat, latLng.lng]} />}
                  <LocationPicker setLatLng={setLatLng} />
                </MapContainer>
              </div>
              {latLng && (
                <p className="text-xs text-green-600">
                  Location selected: {latLng.lat.toFixed(4)},{" "}
                  {latLng.lng.toFixed(4)}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="userType"
                checked={isDonor}
                onCheckedChange={(checked) => setIsDonor(checked === true)}
              />
              <Label htmlFor="userType">
                I am a donor {!isDonor && "(Uncheck if you are an NGO)"}
              </Label>
            </div>

            <div id="form-error" aria-live="polite">
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {serverError && (
                <p className="text-red-500 text-sm">{serverError}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Signing up..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
