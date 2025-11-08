import React, { useState, useEffect } from "react";

// Import SVG files
import GrayCatOpen from "../assets/pets/graycat/graycat_normal.svg";
import GrayCatBlink from "../assets/pets/graycat/graycat_blink.svg";
import GrayCatHappy from "../assets/pets/graycat/graycat_happy.svg";
import YellowDogOpen from "../assets/pets/yellowdog/yellowdog_normal.svg";
import YellowDogBlink from "../assets/pets/yellowdog/yellowdog_blink.svg";
import YellowDogHappy from "../assets/pets/yellowdog/yellowdog_happy.svg";

// Import clothing assets
// Collars
import RedCollar from "../assets/pets/clothing/collars/red_collar.svg";
import BlueCollar from "../assets/pets/clothing/collars/blue_collar.svg";
import BowTie from "../assets/pets/clothing/collars/bowtie.svg";

// Hats
import PartyHat from "../assets/pets/clothing/hats/party_hat.svg";
import Crown from "../assets/pets/clothing/hats/crown.svg";
import BlueCap from "../assets/pets/clothing/hats/blue_cap.svg";

const Pets = ({ petType, equippedItems }) => {
    console.log("Testing Clothing:");
    console.log("Equipped Items:", equippedItems);
    console.log("Collar Image:", getCollarImage());
    console.log("Hat Image:", getHatImage());
    console.log("Pet Type:", petType);
    
    const [isBlinking, setIsBlinking] = useState(false);
    const [isHappy, setIsHappy] = useState(false);
    const [isJumping, setIsJumping] = useState(false);
    
    const [happiness, setHappiness] = useState(50);
    const [hunger, setHunger] = useState(50);
    const [thirst, setThirst] = useState(50);

    useEffect(() => {
        if (!petType || isHappy) return;

        const blink = () => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 150);
        };

        // Random blinking intervals (2-6 seconds)
        const interval = setInterval(() => {
            const shouldBlink = Math.random() > 0.3; // 70% chance to blink
            if (shouldBlink) {
                const delay = Math.random() * 4000 + 2000; // 2-6 second delay
                setTimeout(blink, delay);
            }
        }, 7000); // Check every 7 seconds

        return () => clearInterval(interval);
    }, [petType, isHappy]);

    // Decrease stats over time
    useEffect(() => {
        if (!petType) return;

        const statsInterval = setInterval(() => {
            setHappiness(prev => Math.max(0, prev - 1));
            setHunger(prev => Math.max(0, prev - 2));
            setThirst(prev => Math.max(0, prev - 2));
        }, 60000); // Every minute

        return () => clearInterval(statsInterval);
    }, [petType]);

    const handleClick = () => {
        setHappiness(prev => Math.min(100, prev + 5));
        setIsHappy(true);
        setIsJumping(true);
        
        setTimeout(() => setIsJumping(false), 500);
        setTimeout(() => setIsHappy(false), 2000);
    };

    const feedPet = (foodType) => {
        if (foodType === 'food') {
            setHunger(prev => Math.min(100, prev + 30));
            setHappiness(prev => Math.min(100, prev + 5));
        } else if (foodType === 'water') {
            setThirst(prev => Math.min(100, prev + 30));
            setHappiness(prev => Math.min(100, prev + 3));
        }
    };

    const getPetImage = () => {
        if (isHappy) {
            // Show happy face when clicked
            if (petType === "cat") return GrayCatHappy;
            if (petType === "dog") return YellowDogHappy;
        }
        
        // Normal or blinking state
        if (petType === "cat") {
            return isBlinking ? GrayCatBlink : GrayCatOpen;
        }
        if (petType === "dog") {
            return isBlinking ? YellowDogBlink : YellowDogOpen;
        }
        return null;
    };

    const getPetStyles = () => {
        const baseStyles = "absolute z-20 h-auto -translate-x-[5vw] cursor-pointer transition-all duration-300";
        const bounceStyle = "animate-bounce-slow";
        const jumpStyle = "animate-bounce";
        
        // Use jump animation when clicked, otherwise normal bounce
        const animationStyle = isJumping ? jumpStyle : bounceStyle;
        
        if (petType === "cat") {
            return `${baseStyles} ${animationStyle} top-[45vh] w-[40vw] ${isJumping ? 'scale-110' : ''}`;
        }
        if (petType === "dog") {
            return `${baseStyles} ${animationStyle} top-[45vh] w-[40vw] ${isJumping ? 'scale-110' : ''}`;
        }
        return `${baseStyles} ${animationStyle}`;
    };

    // Clothing
    // Collars
    const getCollarImage = () => {
        if (!equippedItems?.collar) return null;
        
        const collars = {
            'red_collar': RedCollar,
            'blue_collar': BlueCollar,
            'bow_tie': BowTie
        };
        
        return collars[equippedItems.collar];
    };

    // Hats
    const getHatImage = () => {
        if (!equippedItems?.hat) return null;
        
        const hats = {
            'party_hat': PartyHat,
            'crown': Crown,
            'blue_cap': BlueCap
        };
        
        return hats[equippedItems.hat];
    };

    return (
        <div className="relative">
            {/* Hat */}
            {getHatImage() && (
                <img
                    src={getHatImage()}
                    alt="Hat"
                    className="absolute z-30 h-auto w-[15vw] top-[30vh] -translate-x-[5vw]"
                />
            )}

            {/* Main Pet */}
            <img
                src={getPetImage()}
                alt={petType}
                className={getPetStyles()}
                onClick={handleClick}
            />

            {/* Collar */}
            {getCollarImage() && (
                <img
                    src={getCollarImage()}
                    alt="Collar"
                    className="absolute z-25 h-auto w-[25vw] top-[65vh] -translate-x-[5vw]"
                />
            )}
        </div>
    );
};

export default Pets;