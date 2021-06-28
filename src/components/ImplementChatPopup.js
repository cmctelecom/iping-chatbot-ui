import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

import useMediaRecorder from "@wmik/use-media-recorder";
import { createSpeechlySpeechRecognition } from "@speechly/speech-recognition-polyfill";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import UIfx from "uifx";

import microAudio from "../assets/micro.mp3";

import messages from "../assets/messages.json";
import ChatPopup from "./ChatPopup";

const sessionId = uuidv4();

const appId = process.env.REACT_APP_SPEECHLY_ID;
const SpeechlySpeechRecognition = createSpeechlySpeechRecognition(appId);
SpeechRecognition.applyPolyfill(SpeechlySpeechRecognition);

function countWords(str) {
  let wordLength = str.split(" ");
  return Math.floor((wordLength.length / 5) * 1000);
}

function playAudio(audioFile) {
  let audioRing = new UIfx(audioFile);
  audioRing.play();
}

export default function ImplementChatPopup() {
  const [text, setText] = useState("");
  const [requestStatus, setStatus] = useState("not ready");
  const [isRecord, setRecord] = useState(false);
  const [userBlob, setUserBlob] = useState(null);
  const [error, setError] = useState("");
  const [chat, setChat] = useState("");
  const [results, setResults] = useState([]);
  const [isMute, setMuted] = useState(false);

  const microTimeout = useRef();

  const commands = [
    {
      command: "*",
      callback: (text) => {
        setText(text);
      },
    },
  ];

  const {} = useSpeechRecognition({ commands });
  const startListening = () => SpeechRecognition.startListening();
  const stopListening = () => SpeechRecognition.abortListening();

  function getSuccess() {
    setText("");
    setRecord(false);
    console.log(userBlob);
    const fd = new FormData();
    fd.append("record", userBlob, "something.wav");
    fd.append("id", sessionId);
    setStatus("loading");
    axios
      .post(`${process.env.REACT_APP_API_URL}/audio`, fd)
      .then((response) => {
        let b64 = Buffer.from(response.data.audio_buffer.data).toString(
          "base64"
        );
        console.log(response.data);
        setStatus("fetching");
        setResults([
          {
            user: response.data.user,
            bot: response.data.bot,
          },
          ...results,
        ]);

        if (isMute) {
          clickToStart();
          setStatus("done");
        } else {
          playAudio("data:audio/mp3;base64," + b64);
          setTimeout(() => {
            clickToStart();
            setStatus("done");
          }, countWords(response.data.bot));
        }
      })
      .catch((error) => {
        console.log(error.response);
        setError(
          messages.system[Math.floor(Math.random() * messages.system.length)]
        );
      });
  }

  function clickToMute() {
    setMuted(!isMute);
  }

  function getFailure() {
    stopListening();
    stopRecording();
    setRecord(false);
    console.log("fail");
    setError(messages.error[Math.floor(Math.random() * messages.error.length)]);
  }

  useEffect(() => {
    if (microTimeout.current !== null) {
      clearTimeout(microTimeout.current);
    }

    microTimeout.current = setTimeout(() => {
      microTimeout.current = null;
      if (isRecord === true) {
        return text !== "" ? getSuccess() : getFailure();
      }
    }, 5000);
  }, [text, isRecord, userBlob]);

  let { stopRecording, startRecording } = useMediaRecorder({
    recordScreen: false,
    blobOptions: { type: "audio/wav" },
    mediaStreamConstraints: { audio: true },
    onStop: (blob) => {
      setUserBlob(blob);
    },
    // onDataAvailable: (blob) => {
    //   console.log(blob);
    // },
  });

  useEffect(() => {
    if (text) {
      stopRecording();
      stopListening();
    }
  }, [text]);

  function clickToStart(e) {
    startRecording();
    startListening();
    setRecord(true);
    setError("");
    setText("");
    playAudio(microAudio);
  }

  const handleChat = (e) => {
    setChat(e.target.value);
    setError("");
  };

  const handleChatSubmit = (e) => {
    setChat("");
    e.preventDefault();
    if (chat === "") {
      setError("Ooops, dữ liệu rỗng. Bạn có chắc mình đã nhập?");
    } else {
      setStatus("loading");
      axios
        .post(`${process.env.REACT_APP_API_URL}/text`, {
          id: sessionId,
          message: chat,
        })
        .then((response) => {
          console.log(response.data.response);
          setStatus("fetching");
          setResults([
            {
              bot: response.data.response.bot,
              user: response.data.response.user,
            },
            ...results,
          ]);

          if (isMute) {
            setStatus("done");
          } else {
            let b64 = Buffer.from(response.data.response.audio_buffer.data).toString(
              "base64"
            );
            playAudio("data:audio/mp3;base64," + b64);
            setTimeout(() => {
              setStatus("done");
            }, countWords(response.data.bot));
          }
        });
    }
  };

  return (
    <ChatPopup
      requestStatus={requestStatus}
      chat={chat}
      handleChatSubmit={handleChatSubmit}
      handleChat={handleChat}
      clickToStart={clickToStart}
      results={results}
      error={error}
      text={text}
      isMuted={isMute}
      clickToMute={clickToMute}
    />
  );
}
