"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, HelpCircle } from "lucide-react";

const HelpPopup = () => {
    const [isVisible, setIsVisible] = useState(false);

    const removeSplashScreen = () => {
        const splashElement = document.getElementById('splash');
        if (splashElement) {
            splashElement.remove();

        } else {

        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
    };
    useEffect(() => {
         
        const timer = setTimeout(() => {
            const splashElement = document.getElementById('splash');
            if (splashElement) {
                setIsVisible(true);
            }
        }, 2500);

        return () => clearTimeout(timer);

    }, []);
    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 duration-300">
            <div className="bg-help-popup border border-help-popup-border rounded-lg shadow-lg p-4 max-w-xs">
                <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <div className="flex items-start justify-between">
                            <div className="text-sm text-help-popup-foreground mb-3">
                                If you are able to see only splash screen with logo, please click below
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDismiss}
                                className="h-6 w-8 p-2 hover:bg-gray-600"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button
                            onClick={removeSplashScreen}
                            size="sm"
                            className="w-full"
                        >
                            Remove Splash Screen
                        </Button>
                    </div>
                </div>
            <p className="text-xs text-help-popup-foreground mt-2">Sorry for the inconvenience. we're working on it as we dont have any FE team</p>
            </div>
        </div>
    );
};

export default HelpPopup;