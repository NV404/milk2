import React, { useState, useEffect, useRef } from "react";
import { Phone, X, Mic, MicOff, PhoneCallIcon, PhoneCall } from "lucide-react";

const AndroidDialer = () => {
  const [displayValue, setDisplayValue] = useState("");
  const [callStatus, setCallStatus] = useState("idle");
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showDialpad, setShowDialpad] = useState(true);
  const [ivrStarted, setIvrStarted] = useState(false);
  const [languageSelected, setLanguageSelected] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [isBrowser, setIsBrowser] = useState(false);

  const speechSynthesisRef = useRef(null);

  useEffect(() => {
    setIsBrowser(true);
    if (typeof window !== "undefined") {
      speechSynthesisRef.current = window.speechSynthesis;
    }
  }, []);

  useEffect(() => {
    let timer;
    if (callStatus === "connected") {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callStatus]);

  const handleKeypadClick = (ButtonText) => {
    if (callStatus === "idle") {
      setDisplayValue((prev) => prev + ButtonText);
    } else if (callStatus === "connected") {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
      if (languageSelected === "") {
        handleLanguageSelection(ButtonText);
      } else if (selectedOption === "") {
        handleMenuSelection(ButtonText);
      } else {
        handleConfirmation(ButtonText);
      }
    }
  };

  const handleLanguageSelection = (ButtonText) => {
    if (ButtonText === "2") {
      setLanguageSelected("english");
      startIvrSystem(
        "You have selected English. Press 1 for Order Management, 2 for Government Schemes, 3 for Market Trends."
      );
    } else if (ButtonText === "1") {
      setLanguageSelected("hindi");
      startIvrSystem(
        "आपने हिंदी चुनी है। आर्डर मैनेजमेंट के लिए 1 दबाएं।, गोवेर्मेंट स्कीम के लिए 2 दबाएं।, मार्किट ट्रेंड्स के लिए 3 दबाएं।"
      );
    } else {
      startIvrSystem("Invalid input. Press 1 for Hindi, 2 for English.");
    }
  };

  const handleMenuSelection = (ButtonText) => {
    const options = {
      "1": "Order Management",
      "2": "Government Schemes",
      "3": "Market Trends",
    };
    if (["1", "2", "3"].includes(ButtonText)) {
      setSelectedOption(options[ButtonText]);
      const message =
        languageSelected === "english"
          ? `You selected ${options[ButtonText]}.`
          : `आपने ${options[ButtonText]} चुना।`;
      if (options[ButtonText] === "Order Management") {
        handleOrderManagement();
      } else if (options[ButtonText] === "Government Schemes") {
        const governmentPolicyMessage =
          languageSelected === "english"
            ? "You have selected Government Schemes. Press 1 for Pradhan Mantri Awas Yojana, 2 for Pradhan Mantri Jan-Dhan Yojana, 3 for Pradhan Mantri Ujjwala Yojana."
            : "आपने सरकारी योजना चुनी है। प्रधानमंत्री आवास योजना के लिए 1 दबाएं। प्रधानमंत्री जन-धन योजना के लिए 2 दबाएं। प्रधानमंत्री उज्ज्वला योजना के लिए 3 दबाएं।";
        startIvrSystem(governmentPolicyMessage);
        handleGovernmentPolicySelection(ButtonText);
      } else {
        startIvrSystem(message);
      }
    } else {
      startIvrSystem("Invalid input. Please try again.");
    }
  };

  const handleGovernmentPolicySelection = (ButtonText) => {
    const options = {
      "1": "Pradhan Mantri Awas Yojana",
      "2": "Pradhan Mantri Jan-Dhan Yojana",
      "3": "Pradhan Mantri Ujjwala Yojana",
    };
    if (["1", "2", "3"].includes(ButtonText)) {
      setSelectedOption(options[ButtonText]);
      const message =
        languageSelected === "english"
          ? `You selected ${options[ButtonText]}. For more information, please visit our website.`
          : `आपने ${options[ButtonText]} चुना है। अधिक जानकारी के लिए कृपया हमारी वेबसाइट पर जाएं।`;
      handleGovernmentPolicy(options[ButtonText]);
      startIvrSystem(message);
    } else {
      startIvrSystem("Invalid input. Please try again.");
    }
  };

  const handleGovernmentPolicy = (selectedOption) => {
    const message =
      languageSelected === "english"
        ? `You have selected ${selectedOption}. For more information, please visit our website.`
        : `आपने ${selectedOption} चुना है। अधिक जानकारी के लिए कृपया हमारी वेबसाइट पर जाएं।`;
    startIvrSystem(message);
  };

  const handleOrderManagement = () => {
    const message =
      languageSelected === "english"
        ? "Your order 03120 is Shipped, Your order 01712 is still processing. Thank you!"
        : "आपका ऑर्डर 03120 भेज दिया गया है। आपका ऑर्डर 01712 अभी भी प्रक्रिया में है। धन्यवाद!";
    startIvrSystem(message);
  };

  const handleConfirmation = (ButtonText) => {
    if (selectedOption === "Order Management") {
      handleOrderManagement();
    } else {
      startIvrSystem("Invalid input. Please try again.");
    }
  };

  const startCall = () => {
    if (callStatus === "idle") {
      setCallStatus("calling");
      setShowDialpad(false);
      setTimeout(() => {
        setCallStatus("connected");
        setIvrStarted(true);
        startIvrSystem("हिंदी के लिए एक दबाये. Press two for english");
      }, 2000);
    }
  };

  const endCall = () => {
    setCallStatus("idle");
    setCallDuration(0);
    setDisplayValue("");
    setIvrStarted(false);
    setLanguageSelected("");
    setSelectedOption("");
    setShowDialpad(true);
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const toggleDialpad = () => setShowDialpad(!showDialpad);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const startIvrSystem = (input) => {
    if (isBrowser && speechSynthesisRef.current) {
      const speech = new SpeechSynthesisUtterance(input);
      speech.lang = languageSelected === "english" ? "en-US" : "hi-IN";
      speechSynthesisRef.current.cancel();
      speechSynthesisRef.current.speak(speech);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-900 text-white">
      <div className="flex-grow flex flex-col items-center justify-center">
        {callStatus === "idle" ? (
          <input
            type="text"
            value={displayValue}
            readOnly
            className="w-full text-4xl bg-transparent text-center outline-none mb-6 text-white"
            placeholder="Enter phone number"
          />
        ) : (
          <div className="text-center mb-4">
            <p className="text-3xl font-bold mb-2">{displayValue}</p>
            <p
              className={`text-xl ${
                callStatus === "calling" ? "animate-pulse" : ""
              }`}
            >
              {callStatus === "calling"
                ? "Calling..."
                : formatTime(callDuration)}
            </p>
          </div>
        )}
      </div>

      {showDialpad && (
        <div className="flex flex-col justify-end">
          <div className="flex justify-between mb-4 px-6">
            <button
              onClick={() => handleKeypadClick("1")}
              className="bg-black rounded-full w-20 h-20 flex items-center
justify-center text-3xl font-semibold text-white hover:bg-blue-500
transition-colors"
            >
              1
            </button>
            <button
              onClick={() => handleKeypadClick("2")}
              className="bg-black rounded-full w-20 h-20 flex items-center
justify-center text-3xl font-semibold text-white hover:bg-blue-500
transition-colors"
            >
              2
            </button>
            <button
              onClick={() => handleKeypadClick("3")}
              className="bg-black rounded-full w-20 h-20 flex items-center
justify-center text-3xl font-semibold text-white hover:bg-blue-500
transition-colors"
            >
              3
            </button>
          </div>
          <div className="flex justify-between mb-4 px-6">
            <button
              onClick={() => handleKeypadClick("4")}
              className="bg-black rounded-full w-20 h-20 flex items-center
justify-center text-3xl font-semibold text-white hover:bg-blue-500
transition-colors"
            >
              4
            </button>
            <button
              onClick={() => handleKeypadClick("5")}
              className="bg-black rounded-full w-20 h-20 flex items-center
justify-center text-3xl font-semibold text-white hover:bg-blue-500
transition-colors"
            >
              5
            </button>
            <button
              onClick={() => handleKeypadClick("6")}
              className="bg-black rounded-full w-20 h-20 flex items-center
justify-center text-3xl font-semibold text-white hover:bg-blue-500
transition-colors"
            >
              6
            </button>
          </div>
          <div className="flex justify-between mb-4 px-6">
            <button
              onClick={() => handleKeypadClick("7")}
              className="bg-black rounded-full w-20 h-20 flex items-center
justify-center text-3xl font-semibold text-white hover:bg-blue-500
transition-colors"
            >
              7
            </button>
            <button
              onClick={() => handleKeypadClick("8")}
              className="bg-black rounded-full w-20 h-20 flex items-center
justify-center text-3xl font-semibold text-white hover:bg-blue-500
transition-colors"
            >
              8
            </button>
            <button
              onClick={() => handleKeypadClick("9")}
              className="bg-black rounded-full w-20 h-20 flex items-center
justify-center text-3xl font-semibold text-white hover:bg-blue-500
transition-colors"
            >
              9
            </button>
          </div>
          <div className="flex justify-between mb-4 px-6">
            <button
              onClick={() => handleKeypadClick("*")}
              className="bg-black rounded-full w-20 h-20 flex items-center
justify-center text-3xl font-semibold text-white hover:bg-blue-500
transition-colors"
            >
              *
            </button>
            <button
              onClick={() => handleKeypadClick("0")}
              className="bg-black rounded-full w-20 h-20 flex items-center
justify-center text-3xl font-semibold text-white hover:bg-blue-500
transition-colors"
            >
              0
            </button>
            <button
              onClick={() => handleKeypadClick("#")}
              className="bg-black rounded-full w-20 h-20 flex items-center
justify-center text-3xl font-semibold text-white hover:bg-blue-500
transition-colors"
            >
              #
            </button>
          </div>
        </div>
      )}

      {callStatus !== "idle" && (
        <div className="w-full py-4 flex justify-center gap-4 bg-gray-800 ">
          <button
            onClick={toggleMute}
            className={`rounded-full w-16 h-16 flex items-center justify-center
text-white transition-colors ${isMuted ? "bg-red-500" : "bg-gray-500"}`}
          >
            {isMuted ? <MicOff size={32} /> : <Mic size={32} />}
          </button>

          <button
            onClick={toggleDialpad}
            className="bg-blue-500 rounded-full w-16 h-16 flex items-center
justify-center text-white transition-colors"
          >
            <PhoneCall size={32} />
          </button>

          <button
            onClick={endCall}
            className="bg-red-500 rounded-full w-16 h-16 flex items-center
justify-center text-white transition-colors"
          >
            <X size={32} />
          </button>
        </div>
      )}

      {callStatus === "idle" && (
        // <div className="h-20">
        <div className="w-full py-4 my-4 flex justify-center">
          <button
            onClick={startCall}
            className="bg-green-500 rounded-full w-16 h-16 flex items-center
justify-center text-white shadow-lg hover:bg-green-600
transition-colors"
          >
            <Phone size={32} />
          </button>
        </div>
        // </div>
      )}
    </div>
  );
};

export default AndroidDialer;
