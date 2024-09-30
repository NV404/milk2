import React, { useState, useEffect, useRef } from "react";
import { Phone, X, Mic, MicOff, PhoneCallIcon, PhoneCall } from "lucide-react";
import { Button } from "~/components/ui/button";

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
        "आपने हिंदी चुनी है। आर्डर मैनेजमेंट के लिए 1, गोवेर्मेंट स्कीम के लिए 2, मार्किट ट्रेंड्स के लिए 3 दबाएं।"
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
      "4": "Product Listing",
      "5": "Seeds",
      "6": "Payment Issue",
      "7": "fertilizers",
      "8": "grains",
      "9": "Logistic",
      "0": "Feedback",
    };
    if (
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].includes(ButtonText)
    ) {
      setSelectedOption(options[ButtonText]);
      const message =
        languageSelected === "english"
          ? `You selected ${options[ButtonText]}.`
          : `आपने ${options[ButtonText]} चुना।`;
      if (ButtonText === "2") {
        handleConfirmation("1");
      }
      startIvrSystem(message);
    } else {
      startIvrSystem("Invalid input. Please try again.");
    }
  };

  const handleConfirmation = (ButtonText) => {
    if (ButtonText === "1") {
      const message =
        languageSelected === "english"
          ? "Your order 03120 is Shipped. Your order 71002 is still processing. Thank you!"
          : "आपका ऑर्डर 03120 भेज दिया गया है। आपका ऑर्डर 71002 अभी भी प्रोसेस हो रहा है। धन्यवाद!";
      startIvrSystem(message);
      setTimeout(endCall, 3000);
    } else if (ButtonText === "2") {
      setSelectedOption("");
      const message =
        languageSelected === "english"
          ? "Pradhan Mantri Krishi Sinchai Yojana (PMKSY), Uttarakhand Krishi Vikas Bank Uttarakhand, Organic Farming Policy, Pradhan Mantri Fasal Bima Yojana (PMFBY), Soil Health Card Scheme"
          : "प्रधान मंत्री कृषि सिंचाई योजना, उत्तराखंड कृषि विकास बैंक उत्तराखंड, जैविक खेती नीति, प्रधान मंत्री फसल बीमा योजना, मृदा स्वास्थ्य कार्ड योजना";
      startIvrSystem(message);
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
            <Button
              onClick={() => handleKeypadClick("1")}
              className="bg-black rounded-full w-20 h-20 flex items-center justify-center text-3xl font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              1
            </Button>
            <Button
              onClick={() => handleKeypadClick("2")}
              className="bg-black rounded-full w-20 h-20 flex items-center justify-center text-3xl font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              2
            </Button>
            <Button
              onClick={() => handleKeypadClick("3")}
              className="bg-black rounded-full w-20 h-20 flex items-center justify-center text-3xl font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              3
            </Button>
          </div>
          <div className="flex justify-between mb-4 px-6">
            <Button
              onClick={() => handleKeypadClick("4")}
              className="bg-black rounded-full w-20 h-20 flex items-center justify-center text-3xl font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              4
            </Button>
            <Button
              onClick={() => handleKeypadClick("5")}
              className="bg-black rounded-full w-20 h-20 flex items-center justify-center text-3xl font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              5
            </Button>
            <Button
              onClick={() => handleKeypadClick("6")}
              className="bg-black rounded-full w-20 h-20 flex items-center justify-center text-3xl font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              6
            </Button>
          </div>
          <div className="flex justify-between mb-4 px-6">
            <Button
              onClick={() => handleKeypadClick("7")}
              className="bg-black rounded-full w-20 h-20 flex items-center justify-center text-3xl font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              7
            </Button>
            <Button
              onClick={() => handleKeypadClick("8")}
              className="bg-black rounded-full w-20 h-20 flex items-center justify-center text-3xl font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              8
            </Button>
            <Button
              onClick={() => handleKeypadClick("9")}
              className="bg-black rounded-full w-20 h-20 flex items-center justify-center text-3xl font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              9
            </Button>
          </div>
          <div className="flex justify-between mb-4 px-6">
            <Button
              onClick={() => handleKeypadClick("*")}
              className="bg-black rounded-full w-20 h-20 flex items-center justify-center text-3xl font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              *
            </Button>
            <Button
              onClick={() => handleKeypadClick("0")}
              className="bg-black rounded-full w-20 h-20 flex items-center justify-center text-3xl font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              0
            </Button>
            <Button
              onClick={() => handleKeypadClick("#")}
              className="bg-black rounded-full w-20 h-20 flex items-center justify-center text-3xl font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              #
            </Button>
          </div>
        </div>
      )}

      {callStatus !== "idle" && (
        <div className="w-full py-4 flex justify-center gap-4 bg-gray-800 ">
          <Button
            onClick={toggleMute}
            className={`rounded-full w-16 h-16 flex items-center justify-center text-white transition-colors ${
              isMuted ? "bg-red-500" : "bg-gray-500"
            }`}
          >
            {isMuted ? <MicOff size={32} /> : <Mic size={32} />}
          </Button>

          <Button
            onClick={toggleDialpad}
            className="bg-blue-500 rounded-full w-16 h-16 flex items-center justify-center text-white transition-colors"
          >
            <PhoneCall size={32} />
          </Button>

          <Button
            onClick={endCall}
            className="bg-red-500 rounded-full w-16 h-16 flex items-center justify-center text-white transition-colors"
          >
            <X size={32} />
          </Button>
        </div>
      )}

      {callStatus === "idle" && (
        // <div className="h-20">
        <div className="w-full py-4 my-4 flex justify-center">
          <Button
            onClick={startCall}
            className="bg-green-500 rounded-full w-16 h-16 flex items-center justify-center text-white shadow-lg hover:bg-green-600 transition-colors"
          >
            <Phone size={32} />
          </Button>
        </div>
        // </div>
      )}
    </div>
  );
};

export default AndroidDialer;
