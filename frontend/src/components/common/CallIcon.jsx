/* eslint-disable react/prop-types */
// CallIcon.jsx
import { useEffect, useState } from "react";
import { IoIosCall } from "react-icons/io";

const CallIcon = ({ phoneNumber, size = 20, color = "green" }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isValidPhoneNumber = (number) => {
    // This regex strictly enforces 10 digits
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return phoneRegex.test(number);
  };

  const handleCallClick = () => {
    // Remove any non-digit characters before validation
    const cleanNumber = phoneNumber.replace(/\D/g, "");

    if (!isValidPhoneNumber(cleanNumber)) {
      alert("Invalid phone number. Please enter a 10-digit number.");
      return;
    }

    if (isMobile) {
      window.location.href = `tel:${cleanNumber}`;
    } else {
      navigator.clipboard
        .writeText(cleanNumber)
        .then(() => alert("Phone number copied to clipboard!"))
        .catch((err) => console.error("Failed to copy: ", err));
    }
  };

  return (
    <IoIosCall
      color={color}
      size={size}
      onClick={handleCallClick}
      className="cursor-pointer"
    />
  );
};

export default CallIcon;
